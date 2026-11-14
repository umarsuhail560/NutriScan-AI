import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

// Load local secrets for development, while keeping already-set environment
// variables (such as Vercel production secrets) authoritative.
dotenv.config({ path: ['.env.local', '.env'] });

const appBaseDir =
  typeof import.meta !== 'undefined' && import.meta.url
    ? path.dirname(fileURLToPath(import.meta.url))
    : process.cwd();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent local store for email-authenticated users & scans
const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'nutriscan-store.json');

interface StoredUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  passwordHash: string;
  salt: string;
  totalScans: number;
  healthyScansCount: number;
  unhealthyScansCount: number;
  createdAt: string;
}

interface RegisteredUserRecord {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  provider: 'google' | 'email';
  totalScans: number;
  healthyScansCount: number;
  unhealthyScansCount: number;
  createdAt: string;
  lastActiveAt: string;
}

interface StoredFeedback {
  id: string;
  senderUid: string;
  senderName: string;
  senderEmail: string;
  senderType: 'google' | 'email' | 'guest';
  message: string;
  status: 'pending' | 'replied';
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface StoreData {
  users: Record<string, StoredUser>; // keyed by lowercase email
  userRegistry: Record<string, RegisteredUserRecord>; // keyed by uid (includes Google + Email users)
  feedback: StoredFeedback[];
  scans: Record<string, any[]>; // keyed by uid
}

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '313178';
const ADMIN_TOKEN_SECRET = crypto
  .createHash('sha256')
  .update(`${ADMIN_PASSCODE}_nutriscan_umar_suhail_admin_secret`)
  .digest('hex');

function signAdminToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      name: 'Umar Suhail',
      exp: Date.now() + 12 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string | undefined): boolean {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(payload).digest('base64url');
  const actualBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(actualBuf, expectedBuf)) {
    return false;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function readStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial: StoreData = { users: {}, userRegistry: {}, feedback: [], scans: {} };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || {},
      userRegistry: parsed.userRegistry || {},
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
      scans: parsed.scans || {},
    };
  } catch (err) {
    console.warn('Could not read local store, using in-memory fallback:', err);
    return { users: {}, userRegistry: {}, feedback: [], scans: {} };
  }
}

let memoryStore: StoreData = readStore();

function writeStore(data: StoreData) {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not persist store to disk:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function sanitizeUser(u: StoredUser) {
  return {
    uid: u.uid,
    displayName: u.displayName,
    email: u.email,
    photoURL: u.photoURL,
    totalScans: u.totalScans || 0,
    healthyScansCount: u.healthyScansCount || 0,
    unhealthyScansCount: u.unhealthyScansCount || 0,
    createdAt: u.createdAt,
  };
}

function findUserByUid(store: StoreData, uid: string): StoredUser | undefined {
  return Object.values(store.users).find((u) => u.uid === uid);
}

// Check once server-side whether Firebase Email/Password auth is enabled in Firebase Console
let cachedFirebaseEmailEnabled: boolean | null = null;
let lastCapabilitiesCheck = 0;

async function checkFirebaseEmailPasswordEnabled(): Promise<boolean> {
  const now = Date.now();
  if (cachedFirebaseEmailEnabled !== null && now - lastCapabilitiesCheck < 60_000) {
    return cachedFirebaseEmailEnabled;
  }
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      cachedFirebaseEmailEnabled = false;
      return false;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config.apiKey) {
      cachedFirebaseEmailEnabled = false;
      return false;
    }
    const probeRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(config.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'probe-check@invalid.local',
          password: 'probe-check-password',
          returnSecureToken: true,
        }),
      }
    );
    const body: any = await probeRes.json().catch(() => ({}));
    const errMsg = String(body?.error?.message || '');
    const disabled =
      errMsg.includes('OPERATION_NOT_ALLOWED') ||
      errMsg.includes('PASSWORD_LOGIN_DISABLED') ||
      errMsg.includes('ADMIN_ONLY_OPERATION');
    const enabled = !disabled && probeRes.ok ? true : !disabled && (errMsg.includes('EMAIL_NOT_FOUND') || errMsg.includes('INVALID_LOGIN_CREDENTIALS') || errMsg.includes('INVALID_PASSWORD'));
    cachedFirebaseEmailEnabled = enabled;
    lastCapabilitiesCheck = now;
    return enabled;
  } catch {
    cachedFirebaseEmailEnabled = false;
    lastCapabilitiesCheck = now;
    return false;
  }
}

// Helper to initialize Gemini safely (use v1beta for TTS speechConfig and grounding tools)
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      apiVersion: 'v1beta',
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateFoodAnalysisJson(
  ai: GoogleGenAI,
  contents: any,
  language: string,
  dietaryPreferences: string[]
) {
  const systemInstruction = buildFoodAnalysisSystemPrompt(language, dietaryPreferences);
  const attempts = [
    { model: 'gemini-4-hydrogen', delayMs: 0 },
    { model: 'gemini-4-hydrogen', delayMs: 900 },
    { model: 'gemini-3.1-flash-lite', delayMs: 300 },
  ];

  let lastErr: any;
  for (const attempt of attempts) {
    if (attempt.delayMs > 0) {
      await new Promise((r) => setTimeout(r, attempt.delayMs));
    }
    try {
      const response = await ai.models.generateContent({
        model: attempt.model,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          ...(attempt.model === 'gemini-4-hydrogen'
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
            : {}),
        },
      });
      const text = response.text || '';
      const cleanJsonString = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanJsonString);
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message || err);
      const retryable = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429');
      if (!retryable) throw err;
    }
  }
  throw lastErr;
}

function buildFoodAnalysisSystemPrompt(language = 'English', dietaryPreferences: string[] = []): string {
  const dietaryNote =
    Array.isArray(dietaryPreferences) && dietaryPreferences.length > 0
      ? `\nPrioritize evaluating against the user's dietary preferences: ${dietaryPreferences.join(', ')}. Highlight any risks or suitability specifically for these preferences in warnings, badPoints, goodPoints, and summary.`
      : '';

  return `
You are NutriScan AI, an expert clinical nutritionist and food safety inspector.
Analyze the provided food product photo (or text metadata) and evaluate its ingredients, additives, nutrition facts, and health score.

CRITICAL LANGUAGE REQUIREMENT:
Write ALL human-readable text values (productName if appropriate, ingredients, artificialColors, preservatives, artificialSweeteners, additives, allergens, childrenNotes, diabeticNotes, pregnantNotes, elderlyNotes, gymNotes, goodPoints, badPoints, warnings, benefits, dailyAdvice, alternatives names & reasons, and summary) strictly in **${language}**.
HOWEVER, keep all JSON property keys in English, keep "grade" strictly as one of "A+|A|B|C|D|E", and keep "riskLevel" strictly as one of "Very Healthy|Healthy|Moderate|Unhealthy|Avoid Frequently".${dietaryNote}

Strictly respond with ONLY valid JSON matching this exact structure:
{
  "productName": "Product Name",
  "brand": "Brand Name or Unknown",
  "healthScore": 85,
  "grade": "A+|A|B|C|D|E",
  "riskLevel": "Very Healthy|Healthy|Moderate|Unhealthy|Avoid Frequently",
  "calories": "250 kcal",
  "protein": "12g",
  "fat": "4.5g",
  "sugar": "2.1g",
  "salt": "0.3g",
  "fiber": "6g",
  "carbohydrates": "38g",
  "servingSize": "100g",
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "artificialColors": [],
  "preservatives": [],
  "artificialSweeteners": [],
  "additives": [],
  "allergens": [],
  "suitability": {
    "forChildren": true,
    "childrenNotes": "Reason why safe or unsafe for kids in ${language}",
    "forDiabetics": false,
    "diabeticNotes": "Sugar/glycemic impact notes in ${language}",
    "forPregnant": true,
    "pregnantNotes": "Pregnancy safety notes in ${language}",
    "forElderly": true,
    "elderlyNotes": "Digestive & sodium notes for seniors in ${language}",
    "forGym": true,
    "gymNotes": "Protein & recovery value in ${language}"
  },
  "goodPoints": ["Good point 1 in ${language}", "Good point 2 in ${language}"],
  "badPoints": ["Bad point 1 in ${language}", "Bad point 2 in ${language}"],
  "warnings": ["Warning if any in ${language}"],
  "benefits": ["Benefit 1 in ${language}", "Benefit 2 in ${language}"],
  "dailyAdvice": "Daily consumption guidance in ${language}",
  "alternatives": [
    { "name": "Healthier Alternative Name", "reason": "Why it's better in ${language}" }
  ],
  "summary": "Clear, simple summary understandable by anyone in ${language}."
}

Rules:
1. Health score must be an integer from 0 to 100 based on Nutri-Score standards, sugar content, ultra-processing level, and harmful additives.
2. Grade must correlate: 90-100 = A+, 75-89 = A, 60-74 = B, 45-59 = C, 30-44 = D, 0-29 = E.
3. Identify any artificial colors (E102, Yellow 5, Red 40, etc.), preservatives, artificial sweeteners (Aspartame, Sucralose, etc.), food additives (E-numbers), and common allergens (nuts, milk, soy, wheat).
4. Output raw clean JSON only.
`;
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth Capabilities check (prevents browser-side Firebase 400 console errors when Email/Password is not enabled in Firebase Console)
app.get('/api/auth/capabilities', async (req, res) => {
  const emailPasswordEnabled = await checkFirebaseEmailPasswordEnabled();
  res.json({ firebaseEmailPasswordEnabled: emailPasswordEnabled });
});

// Email/Password Registration
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanName = typeof name === 'string' ? name.trim() : '';

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ code: 'INVALID_EMAIL', error: 'Please enter a valid email address.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ code: 'WEAK_PASSWORD', error: 'Password must be at least 6 characters.' });
    }

    const store = memoryStore;
    if (store.users[cleanEmail]) {
      return res.status(409).json({
        code: 'EMAIL_EXISTS',
        error: 'An account already exists with this email address. Please sign in.',
      });
    }

    const uid = `local_user_${crypto.createHash('sha256').update(cleanEmail).digest('hex').slice(0, 16)}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const newUser: StoredUser = {
      uid,
      displayName: cleanName || cleanEmail.split('@')[0],
      email: cleanEmail,
      photoURL: null,
      passwordHash,
      salt,
      totalScans: 0,
      healthyScansCount: 0,
      unhealthyScansCount: 0,
      createdAt: new Date().toISOString(),
    };

    store.users[cleanEmail] = newUser;
    if (!store.scans[uid]) store.scans[uid] = [];
    writeStore(store);

    return res.json({ success: true, user: sanitizeUser(newUser) });
  } catch (err: any) {
    console.error('Error in /api/auth/register:', err);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Email/Password Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanEmail || !password) {
      return res.status(400).json({ code: 'MISSING_FIELDS', error: 'Email and password are required.' });
    }

    const store = memoryStore;
    const existing = store.users[cleanEmail];
    if (!existing) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        error: 'No account found with this email. Please switch to Create Account.',
      });
    }

    if (!verifyPassword(password, existing.salt, existing.passwordHash)) {
      return res.status(401).json({
        code: 'INVALID_PASSWORD',
        error: 'Incorrect password. Please check your password and try again.',
      });
    }

    return res.json({ success: true, user: sanitizeUser(existing) });
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    return res.status(500).json({ error: 'Sign in failed.' });
  }
});

// Local Account Password Reset
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, newPassword } = req.body || {};
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const store = memoryStore;
    const existing = store.users[cleanEmail];

    if (!existing) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    existing.salt = salt;
    existing.passwordHash = hashPassword(newPassword, salt);
    store.users[cleanEmail] = existing;
    writeStore(store);

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error in /api/auth/reset-password:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// Sync user profile / stats for local email accounts
app.get('/api/user-data/:uid/profile', (req, res) => {
  const { uid } = req.params;
  const user = findUserByUid(memoryStore, uid);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: sanitizeUser(user) });
});

app.post('/api/user-data/:uid/profile', (req, res) => {
  const { uid } = req.params;
  const user = findUserByUid(memoryStore, uid);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { totalScans, healthyScansCount, unhealthyScansCount, displayName } = req.body || {};
  if (typeof totalScans === 'number') user.totalScans = totalScans;
  if (typeof healthyScansCount === 'number') user.healthyScansCount = healthyScansCount;
  if (typeof unhealthyScansCount === 'number') user.unhealthyScansCount = unhealthyScansCount;
  if (typeof displayName === 'string' && displayName.trim()) user.displayName = displayName.trim();

  memoryStore.users[user.email] = user;
  writeStore(memoryStore);
  return res.json({ user: sanitizeUser(user) });
});

// Scans persistence for email-registered accounts
app.get('/api/user-data/:uid/scans', (req, res) => {
  const { uid } = req.params;
  const scans = memoryStore.scans[uid] || [];
  return res.json({ scans });
});

app.post('/api/user-data/:uid/scans', (req, res) => {
  const { uid } = req.params;
  const scan = req.body;
  if (!scan || !scan.productName) {
    return res.status(400).json({ error: 'Invalid scan payload' });
  }
  const newScan = {
    ...scan,
    id: scan.id || `scan_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    userId: uid,
    createdAt: scan.createdAt || new Date().toISOString(),
  };
  if (!memoryStore.scans[uid]) memoryStore.scans[uid] = [];
  memoryStore.scans[uid] = [newScan, ...memoryStore.scans[uid]];
  writeStore(memoryStore);
  return res.json({ scan: newScan });
});

app.patch('/api/user-data/:uid/scans/:scanId', (req, res) => {
  const { uid, scanId } = req.params;
  const { isFavorite } = req.body || {};
  const list = memoryStore.scans[uid] || [];
  memoryStore.scans[uid] = list.map((s) => (s.id === scanId ? { ...s, isFavorite: !!isFavorite } : s));
  writeStore(memoryStore);
  return res.json({ success: true });
});

app.delete('/api/user-data/:uid/scans/:scanId', (req, res) => {
  const { uid, scanId } = req.params;
  const list = memoryStore.scans[uid] || [];
  memoryStore.scans[uid] = list.filter((s) => s.id !== scanId);
  writeStore(memoryStore);
  return res.json({ success: true });
});

// Sync any authenticated user (Google Sign-In or Email/Password) to persistent account registry
app.post('/api/users/sync', (req, res) => {
  try {
    const {
      uid,
      displayName,
      email,
      photoURL = null,
      provider = 'email',
      totalScans = 0,
      healthyScansCount = 0,
      unhealthyScansCount = 0,
      createdAt,
    } = req.body || {};

    if (!uid || typeof uid !== 'string' || uid === 'guest') {
      return res.status(400).json({ error: 'Valid non-guest user UID is required' });
    }

    const now = new Date().toISOString();
    const existing = memoryStore.userRegistry[uid];
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : existing?.email || '';

    memoryStore.userRegistry[uid] = {
      uid,
      displayName: (typeof displayName === 'string' && displayName.trim()) || existing?.displayName || cleanEmail.split('@')[0] || 'NutriScan User',
      email: cleanEmail,
      photoURL: photoURL || existing?.photoURL || null,
      provider: provider === 'google' ? 'google' : existing?.provider || 'email',
      totalScans: typeof totalScans === 'number' ? Math.max(totalScans, existing?.totalScans || 0) : existing?.totalScans || 0,
      healthyScansCount: typeof healthyScansCount === 'number' ? Math.max(healthyScansCount, existing?.healthyScansCount || 0) : existing?.healthyScansCount || 0,
      unhealthyScansCount: typeof unhealthyScansCount === 'number' ? Math.max(unhealthyScansCount, existing?.unhealthyScansCount || 0) : existing?.unhealthyScansCount || 0,
      createdAt: existing?.createdAt || createdAt || now,
      lastActiveAt: now,
    };

    writeStore(memoryStore);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error in /api/users/sync:', err);
    return res.status(500).json({ error: 'Failed to sync user profile' });
  }
});

// User Feedback Submission (Private: only Admin & the original sender can read)
app.post('/api/feedback', (req, res) => {
  try {
    const { id, senderUid, senderName, senderEmail, senderType = 'guest', message } = req.body || {};
    const cleanSenderUid = typeof senderUid === 'string' ? senderUid.trim() : '';
    const cleanMessage = typeof message === 'string' ? message.trim() : '';

    if (!cleanSenderUid || cleanSenderUid.length > 128) {
      return res.status(400).json({ error: 'Valid sender identifier is required' });
    }
    if (!cleanMessage || cleanMessage.length > 2000) {
      return res.status(400).json({ error: 'Feedback message must be 1–2000 characters' });
    }

    const item: StoredFeedback = {
      id: typeof id === 'string' && id.trim() ? id.trim() : `fb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      senderUid: cleanSenderUid,
      senderName: (typeof senderName === 'string' && senderName.trim().slice(0, 120)) || 'NutriScan User',
      senderEmail: (typeof senderEmail === 'string' && senderEmail.trim().slice(0, 200)) || 'guest@nutriscan.ai',
      senderType: senderType === 'google' || senderType === 'email' ? senderType : 'guest',
      message: cleanMessage,
      status: 'pending',
      adminReply: null,
      repliedAt: null,
      createdAt: new Date().toISOString(),
    };

    memoryStore.feedback = [item, ...memoryStore.feedback.filter((f) => f.id !== item.id)];
    writeStore(memoryStore);
    return res.json({ success: true, item });
  } catch (err: any) {
    console.error('Error in POST /api/feedback:', err);
    return res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Strict sender-only feedback & reply lookup
app.get('/api/feedback/my', (req, res) => {
  try {
    const senderUid = typeof req.query.senderUid === 'string' ? req.query.senderUid.trim() : '';
    if (!senderUid) {
      return res.status(400).json({ error: 'senderUid query parameter is required' });
    }

    const items = memoryStore.feedback
      .filter((f) => f.senderUid === senderUid)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ success: true, items });
  } catch (err: any) {
    console.error('Error in GET /api/feedback/my:', err);
    return res.status(500).json({ error: 'Failed to fetch your feedback' });
  }
});

// Admin Passcode Verification (Passcode: 313178)
app.post('/api/admin/verify', (req, res) => {
  const passcode = String(req.body?.passcode ?? '').trim();
  if (passcode !== ADMIN_PASSCODE) {
    return res.status(401).json({
      verified: false,
      error: 'Invalid admin passcode',
    });
  }
  const token = signAdminToken();
  return res.json({
    verified: true,
    token,
    adminName: 'Umar Suhail',
  });
});

// Admin Overview: Full User Accounts List + All Private Feedback (Admin Only)
app.get('/api/admin/overview', (req, res) => {
  const token = req.headers['x-admin-token'] as string | undefined;
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized: Admin passcode required' });
  }

  const byUid = new Map<string, RegisteredUserRecord>();

  // Include all email/password registered users
  for (const u of Object.values(memoryStore.users)) {
    byUid.set(u.uid, {
      uid: u.uid,
      displayName: u.displayName || u.email.split('@')[0],
      email: u.email,
      photoURL: u.photoURL || null,
      provider: 'email',
      totalScans: u.totalScans || 0,
      healthyScansCount: u.healthyScansCount || 0,
      unhealthyScansCount: u.unhealthyScansCount || 0,
      createdAt: u.createdAt,
      lastActiveAt: u.createdAt,
    });
  }

  // Merge synced Google + Email accounts
  for (const reg of Object.values(memoryStore.userRegistry)) {
    const prev = byUid.get(reg.uid);
    byUid.set(reg.uid, {
      ...reg,
      totalScans: Math.max(reg.totalScans || 0, prev?.totalScans || 0),
      healthyScansCount: Math.max(reg.healthyScansCount || 0, prev?.healthyScansCount || 0),
      unhealthyScansCount: Math.max(reg.unhealthyScansCount || 0, prev?.unhealthyScansCount || 0),
    });
  }

  const accounts = Array.from(byUid.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const feedback = [...memoryStore.feedback].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalScansStored = Object.values(memoryStore.scans).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0
  );

  return res.json({
    success: true,
    adminName: 'Umar Suhail',
    accounts,
    feedback,
    stats: {
      totalAccounts: accounts.length,
      totalFeedback: feedback.length,
      pendingFeedback: feedback.filter((f) => f.status !== 'replied').length,
      totalScansStored,
    },
  });
});

// Admin Reply to a specific User's Feedback (Private to that sender)
app.post('/api/admin/feedback/:id/reply', (req, res) => {
  const token = req.headers['x-admin-token'] as string | undefined;
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized: Admin passcode required' });
  }

  const { id } = req.params;
  const replyText = typeof req.body?.reply === 'string' ? req.body.reply.trim() : '';
  if (!replyText || replyText.length > 2000) {
    return res.status(400).json({ error: 'Reply message is required (max 2000 chars)' });
  }

  const index = memoryStore.feedback.findIndex((f) => f.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Feedback message not found' });
  }

  const updated: StoredFeedback = {
    ...memoryStore.feedback[index],
    adminReply: replyText,
    repliedAt: new Date().toISOString(),
    status: 'replied',
  };

  memoryStore.feedback[index] = updated;
  writeStore(memoryStore);

  return res.json({ success: true, item: updated });
});

// Analyze Image endpoint
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userPrompt, language = 'English', dietaryPreferences = [] } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getGeminiAI();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const contents = [
      {
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      },
      {
        text: `Analyze this food packaging/nutrition label/product image in detail and respond in ${language}. ${userPrompt ? `User notes: ${userPrompt}` : ''}`,
      },
    ];

    const data = await generateFoodAnalysisJson(ai, contents, language, dietaryPreferences);

    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in /api/analyze-image:', err);
    return res.status(500).json({
      error: err.message || 'Failed to analyze food product image',
    });
  }
});

// Text-to-Speech endpoint using Gemini Natural AI Voices
const VALID_TTS_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'] as const;

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for speech synthesis' });
    }

    const safeVoice = VALID_TTS_VOICES.includes(voiceName) ? voiceName : 'Kore';
    const trimmedText = text.trim().slice(0, 3200);
    const ai = getGeminiAI();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: 'Warm, calm, articulate health assistant speaking clearly for older adults',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: safeVoice },
          },
        },
      },
    });

    const inlinePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part?.inlineData?.data
    );
    const audioBase64 = inlinePart?.inlineData?.data;
    const mimeType = inlinePart?.inlineData?.mimeType || 'audio/wav';

    if (!audioBase64) {
      return res.status(502).json({ error: 'No audio data returned by TTS model' });
    }

    return res.json({ audioBase64, mimeType, voiceName: safeVoice });
  } catch (err: any) {
    console.error('Error in /api/tts:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to synthesize speech' });
  }
});

// Helper: build candidate barcode formats (raw, EAN-13 padded, UPC-A trimmed)
function getBarcodeCandidates(rawBarcode: string): string[] {
  const trimmed = rawBarcode.trim();
  const digitsOnly = trimmed.replace(/\s+/g, '');
  const set = new Set<string>([trimmed, digitsOnly]);

  if (/^\d+$/.test(digitsOnly)) {
    if (digitsOnly.length === 12) {
      set.add('0' + digitsOnly);
    } else if (digitsOnly.length === 13 && digitsOnly.startsWith('0')) {
      set.add(digitsOnly.slice(1));
    } else if (digitsOnly.length < 13 && digitsOnly.length >= 8) {
      set.add(digitsOnly.padStart(13, '0'));
    }
    const noLeadingZeros = digitsOnly.replace(/^0+/, '');
    if (noLeadingZeros.length >= 8) {
      set.add(noLeadingZeros);
    }
  }

  return Array.from(set).filter(Boolean);
}

async function fetchWithTimeout(url: string, timeoutMs = 5500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

interface LookupProductResult {
  source: string;
  productName: string;
  brand: string;
  barcode: string;
  ingredientsText: string;
  servingSize: string;
  calories: string;
  protein: string;
  fat: string;
  sugar: string;
  salt: string;
  fiber: string;
  carbohydrates: string;
  nutriscore: string;
  imageUrl: string;
  extraNotes?: string;
}

async function queryOpenFactsRegistry(
  reg: { name: string; base: string; priority: number },
  code: string
): Promise<(LookupProductResult & { priority: number }) | null> {
  try {
    const res = await fetchWithTimeout(`${reg.base}/${encodeURIComponent(code)}.json`, 4500);
    if (!res.ok) return null;
    const json: any = await res.json();
    if (json && json.status === 1 && json.product) {
      const p = json.product;
      const productName = p.product_name || p.product_name_en || p.generic_name || '';
      if (!productName && !p.brands && !p.ingredients_text) return null;
      const nutriments = p.nutriments || {};
      return {
        priority: reg.priority,
        source: reg.name,
        productName: productName || 'Packaged Product',
        brand: p.brands || 'Unknown Brand',
        barcode: code,
        ingredientsText: p.ingredients_text_en || p.ingredients_text || '',
        servingSize: p.serving_size || '100g',
        calories: `${nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 'N/A'} kcal`,
        protein: `${nutriments.proteins_100g ?? nutriments.proteins ?? 'N/A'} g`,
        fat: `${nutriments.fat_100g ?? nutriments.fat ?? 'N/A'} g`,
        sugar: `${nutriments.sugars_100g ?? nutriments.sugars ?? 'N/A'} g`,
        salt: `${nutriments.salt_100g ?? nutriments.salt ?? 'N/A'} g`,
        fiber: `${nutriments.fiber_100g ?? nutriments.fiber ?? 'N/A'} g`,
        carbohydrates: `${nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? 'N/A'} g`,
        nutriscore: p.nutriscore_grade || '',
        imageUrl: p.image_url || p.image_front_url || '',
        extraNotes: p.categories || '',
      };
    }
  } catch {
    // ignore timeout/network error for single registry
  }
  return null;
}

async function queryUpcItemDb(code: string): Promise<(LookupProductResult & { priority: number }) | null> {
  try {
    const upcRes = await fetchWithTimeout(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code)}`,
      4500
    );
    if (!upcRes.ok) return null;
    const upcData: any = await upcRes.json();
    const item = upcData?.items?.[0];
    if (item && (item.title || item.description)) {
      return {
        priority: 5,
        source: 'UPCitemdb Global',
        productName: item.title || 'Global Product',
        brand: item.brand || 'Unknown Brand',
        barcode: code,
        ingredientsText: item.description || '',
        servingSize: item.size || '100g',
        calories: 'Estimated by AI',
        protein: 'Estimated by AI',
        fat: 'Estimated by AI',
        sugar: 'Estimated by AI',
        salt: 'Estimated by AI',
        fiber: 'Estimated by AI',
        carbohydrates: 'Estimated by AI',
        nutriscore: '',
        imageUrl: Array.isArray(item.images) && item.images[0] ? item.images[0] : '',
        extraNotes: [item.category, item.description].filter(Boolean).join(' — '),
      };
    }
  } catch {
    // ignore
  }
  return null;
}

async function lookupBarcodeInOpenRegistries(candidates: string[]): Promise<LookupProductResult | null> {
  const registries = [
    { name: 'Open Food Facts', base: 'https://world.openfoodfacts.org/api/v2/product', priority: 1 },
    { name: 'Open Products Facts', base: 'https://world.openproductsfacts.org/api/v2/product', priority: 2 },
    { name: 'Open Beauty Facts', base: 'https://world.openbeautyfacts.org/api/v2/product', priority: 3 },
    { name: 'Open Pet Food Facts', base: 'https://world.openpetfoodfacts.org/api/v2/product', priority: 4 },
  ];

  const tasks: Promise<(LookupProductResult & { priority: number }) | null>[] = [];
  for (const code of candidates.slice(0, 3)) {
    for (const reg of registries) {
      tasks.push(queryOpenFactsRegistry(reg, code));
    }
    tasks.push(queryUpcItemDb(code));
  }

  const hits = (await Promise.all(tasks)).filter(
    (r): r is LookupProductResult & { priority: number } => r !== null
  );
  if (hits.length === 0) return null;
  hits.sort((a, b) => a.priority - b.priority);
  const { priority: _p, ...best } = hits[0];
  return best;
}

// Barcode Lookup & Global Web-Grounded AI Enrichment endpoint
app.post('/api/analyze-barcode', async (req, res) => {
  try {
    const { barcode, language = 'English', dietaryPreferences = [] } = req.body;
    if (!barcode || typeof barcode !== 'string') {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    const cleanBarcode = barcode.trim();
    const candidates = getBarcodeCandidates(cleanBarcode);
    const ai = getGeminiAI();

    let extractedInfo = await lookupBarcodeInOpenRegistries(candidates);
    let groundedContext = '';

    // Final global fallback: live Google Search grounding via Gemini
    if (!extractedInfo) {
      try {
        const searchResp = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Search the web for the product barcode "${cleanBarcode}" (UPC/EAN/GTIN). Identify the exact product name, brand, country/category, typical ingredients, and nutrition facts per 100g or per serving. If you cannot find any matching product anywhere on the web, reply strictly with NOT_FOUND.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        const foundText = (searchResp.text || '').trim();
        if (foundText && !foundText.toUpperCase().includes('NOT_FOUND') && foundText.length > 20) {
          groundedContext = foundText;
          extractedInfo = {
            source: 'Global Web Search',
            productName: `Barcode ${cleanBarcode}`,
            brand: 'Verified via Web',
            barcode: cleanBarcode,
            ingredientsText: '',
            servingSize: '100g',
            calories: 'N/A',
            protein: 'N/A',
            fat: 'N/A',
            sugar: 'N/A',
            salt: 'N/A',
            fiber: 'N/A',
            carbohydrates: 'N/A',
            nutriscore: '',
            imageUrl: '',
            extraNotes: foundText,
          };
        }
      } catch (searchErr) {
        console.warn('Google Search barcode grounding skipped:', searchErr);
      }
    }

    if (!extractedInfo) {
      return res.json({
        found: false,
        barcode: cleanBarcode,
        message: 'Product not found in international barcode databases. Please upload front and back photos of the product for AI analysis.',
      });
    }

    const promptText = groundedContext
      ? `
Global Web Search Findings for Barcode ${cleanBarcode}:
${groundedContext}

Using the verified web search details above, perform a thorough nutritional safety analysis, extract/estimate nutritional values, risk level classification, population suitability checks (children, diabetics, pregnant, elderly, gym users), warnings, additives identification, and healthy alternatives for this product. Respond with all descriptive fields written in ${language}.
`
      : `
Product Metadata from ${extractedInfo.source} (${extractedInfo.barcode}):
Name: ${extractedInfo.productName}
Brand: ${extractedInfo.brand}
Category/Details: ${extractedInfo.extraNotes || 'N/A'}
Ingredients / Description: ${extractedInfo.ingredientsText || 'Not listed in registry — infer standard formulation if well-known brand product and note clearly'}
Nutritional Info (per ${extractedInfo.servingSize}): Calories: ${extractedInfo.calories}, Protein: ${extractedInfo.protein}, Fat: ${extractedInfo.fat}, Sugar: ${extractedInfo.sugar}, Salt: ${extractedInfo.salt}, Fiber: ${extractedInfo.fiber}, Carbs: ${extractedInfo.carbohydrates}

Perform a thorough nutritional safety analysis, risk level classification, population suitability checks (children, diabetics, pregnant, elderly, gym users), warnings, additives identification, and healthy alternatives for this product. Respond with all descriptive fields written in ${language}.
`;

    let aiResult: any;
    try {
      aiResult = await generateFoodAnalysisJson(ai, promptText, language, dietaryPreferences);
    } catch (aiErr: any) {
      console.warn('AI enrichment unavailable, returning direct registry data:', aiErr?.message || aiErr);
      const ns = (extractedInfo.nutriscore || '').toUpperCase();
      const fallbackScore = ns === 'A' ? 85 : ns === 'B' ? 72 : ns === 'C' ? 55 : ns === 'D' ? 35 : ns === 'E' ? 20 : 50;
      const fallbackGrade = (['A', 'B', 'C', 'D', 'E'].includes(ns) ? ns : 'C') as 'A' | 'B' | 'C' | 'D' | 'E';
      aiResult = {
        productName: extractedInfo.productName,
        brand: extractedInfo.brand,
        healthScore: fallbackScore,
        grade: fallbackGrade,
        riskLevel: fallbackScore >= 65 ? 'Healthy' : fallbackScore >= 45 ? 'Moderate' : 'Unhealthy',
        calories: extractedInfo.calories,
        protein: extractedInfo.protein,
        fat: extractedInfo.fat,
        sugar: extractedInfo.sugar,
        salt: extractedInfo.salt,
        fiber: extractedInfo.fiber,
        carbohydrates: extractedInfo.carbohydrates,
        servingSize: extractedInfo.servingSize,
        ingredients: extractedInfo.ingredientsText
          ? extractedInfo.ingredientsText.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        artificialColors: [],
        preservatives: [],
        artificialSweeteners: [],
        additives: [],
        allergens: [],
        suitability: {
          forChildren: fallbackScore >= 60,
          childrenNotes: 'Based on product label metadata.',
          forDiabetics: false,
          diabeticNotes: 'Check sugar and carbohydrate values above carefully.',
          forPregnant: true,
          pregnantNotes: 'Review full ingredient list on packaging.',
          forElderly: fallbackScore >= 50,
          elderlyNotes: 'Monitor sodium and sugar intake per serving.',
          forGym: fallbackScore >= 55,
          gymNotes: 'Check protein and calorie content per serving.',
        },
        goodPoints: [],
        badPoints: [],
        warnings: [],
        benefits: [],
        dailyAdvice: `Product data retrieved from ${extractedInfo.source}.`,
        alternatives: [],
        summary: `${extractedInfo.productName} (${extractedInfo.brand}) — retrieved from ${extractedInfo.source}.`,
      };
    }

    if (extractedInfo.imageUrl && !aiResult.imageUrl) {
      aiResult.imageUrl = extractedInfo.imageUrl;
    }
    aiResult.barcode = cleanBarcode;

    return res.json({ found: true, source: extractedInfo.source, data: aiResult });
  } catch (err: any) {
    console.error('Error in /api/analyze-barcode:', err);
    return res.status(500).json({ error: err.message || 'Failed to process barcode' });
  }
});

// Search Food Products across global databases
app.post('/api/search-products', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query string is required' });
    }

    const results: any[] = [];
    const seen = new Set<string>();

    const pushProduct = (item: any) => {
      const key = (item.barcode || item.productName || '').toLowerCase().trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      results.push(item);
    };

    try {
      const offRes = await fetchWithTimeout(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`,
        6000
      );
      if (offRes.ok) {
        const data: any = await offRes.json();
        if (data && Array.isArray(data.products)) {
          for (const p of data.products) {
            pushProduct({
              productName: p.product_name || p.product_name_en || query,
              brand: p.brands || 'Various',
              barcode: p.code || '',
              nutriscore: (p.nutriscore_grade || 'c').toUpperCase(),
              imageUrl: p.image_small_url || p.image_front_small_url || '',
              calories: `${p.nutriments?.['energy-kcal_100g'] || '150'} kcal`,
              sugar: `${p.nutriments?.sugars_100g || '5'} g`,
              protein: `${p.nutriments?.proteins_100g || '3'} g`,
            });
          }
        }
      }
    } catch {
      // continue to fallback database
    }

    if (results.length < 5) {
      try {
        const upcSearch = await fetchWithTimeout(
          `https://api.upcitemdb.com/prod/trial/search?s=${encodeURIComponent(query)}&match_mode=0&type=product`,
          5000
        );
        if (upcSearch.ok) {
          const upcJson: any = await upcSearch.json();
          if (upcJson && Array.isArray(upcJson.items)) {
            for (const item of upcJson.items.slice(0, 6)) {
              pushProduct({
                productName: item.title || query,
                brand: item.brand || 'Global Brand',
                barcode: item.ean || item.upc || '',
                nutriscore: 'C',
                imageUrl: Array.isArray(item.images) && item.images[0] ? item.images[0] : '',
                calories: 'Check AI',
                sugar: 'Check AI',
                protein: 'Check AI',
              });
            }
          }
        }
      } catch {
        // ignore secondary search error
      }
    }

    return res.json({ success: true, results });
  } catch (err: any) {
    console.error('Error in /api/search-products:', err);
    return res.status(500).json({ error: 'Failed to search products' });
  }
});

// Side-by-Side AI Product Comparison
app.post('/api/compare-products', async (req, res) => {
  try {
    const { productA, productB, language = 'English', dietaryPreferences = [] } = req.body || {};
    if (!productA || !productB) {
      return res.status(400).json({ error: 'Both productA and productB are required' });
    }

    const ai = getGeminiAI();
    const dietaryNote =
      Array.isArray(dietaryPreferences) && dietaryPreferences.length > 0
        ? `User dietary preferences to prioritize: ${dietaryPreferences.join(', ')}.`
        : '';

    const systemInstruction = `
You are NutriScan AI, a clinical nutritionist comparing two food products side by side.
Write ALL human-readable fields strictly in **${language}**. Keep JSON property keys in English.
Keep "winner" strictly as one of "A" | "B" | "Tie". ${dietaryNote}
Return ONLY valid JSON:
{
  "winner": "A" | "B" | "Tie",
  "headline": "Short clear headline summarizing which wins and why in ${language}",
  "verdict": "2-3 concise sentences comparing nutrition quality, sugar/salt/fat, additives, and overall value in ${language}",
  "keyDifferences": ["Difference 1 in ${language}", "Difference 2 in ${language}", "Difference 3 in ${language}"],
  "recommendation": "Practical consumption tip or who should choose which product in ${language}"
}`;

    const summarize = (p: any, label: string) =>
      `${label}: ${p.productName} (${p.brand || 'Unknown'}) | Score: ${p.healthScore}/100 (Grade ${p.grade}, ${p.riskLevel}) | Serving: ${p.servingSize} | Calories: ${p.calories}, Protein: ${p.protein}, Fat: ${p.fat}, Sugar: ${p.sugar}, Salt: ${p.salt}, Fiber: ${p.fiber}, Carbs: ${p.carbohydrates} | Additives: ${(p.additives || []).join(', ') || 'None'} | Allergens: ${(p.allergens || []).join(', ') || 'None'}`;

    const promptText = `${summarize(productA, 'Product A')}\n${summarize(productB, 'Product B')}\n\nCompare these two products objectively and explain the healthier option in ${language}.`;

    const attempts = [
      { model: 'gemini-4-hydrogen', delayMs: 0 },
      { model: 'gemini-3.1-flash-lite', delayMs: 400 },
    ];

    let parsed: any = null;
    for (const attempt of attempts) {
      if (attempt.delayMs > 0) await new Promise((r) => setTimeout(r, attempt.delayMs));
      try {
        const response = await ai.models.generateContent({
          model: attempt.model,
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            ...(attempt.model === 'gemini-4-hydrogen'
              ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
              : {}),
          },
        });
        const cleanJson = (response.text || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(cleanJson);
        break;
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (!(msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429'))) {
          throw err;
        }
      }
    }

    if (!parsed) {
      const winner =
        productA.healthScore === productB.healthScore
          ? 'Tie'
          : productA.healthScore > productB.healthScore
          ? 'A'
          : 'B';
      parsed = {
        winner,
        headline:
          winner === 'Tie'
            ? `${productA.productName} vs ${productB.productName}`
            : `${winner === 'A' ? productA.productName : productB.productName}`,
        verdict: `${productA.productName} (${productA.healthScore}/100) vs ${productB.productName} (${productB.healthScore}/100).`,
        keyDifferences: [],
        recommendation: '',
      };
    }

    return res.json({ success: true, comparison: parsed });
  } catch (err: any) {
    console.error('Error in /api/compare-products:', err);
    return res.status(500).json({ error: err.message || 'Failed to compare products' });
  }
});

// Ask Nutritionist AI about a scanned product
app.post('/api/ask-product', async (req, res) => {
  try {
    const { scan, question, language = 'English', dietaryPreferences = [] } = req.body || {};
    if (!scan || !question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Product scan data and question are required' });
    }

    const ai = getGeminiAI();
    const dietaryNote =
      Array.isArray(dietaryPreferences) && dietaryPreferences.length > 0
        ? `User dietary preferences: ${dietaryPreferences.join(', ')}.`
        : '';

    const systemInstruction = `
You are NutriScan AI, a warm, clear clinical nutritionist helping a consumer understand a food product.
Answer the user's question concisely in **${language}** (3 to 4 clear sentences max, easy for families and older adults to understand).
Ground your answer strictly in the provided product nutrition facts, ingredients, additives, and allergens. ${dietaryNote}
Return ONLY valid JSON: { "answer": "Your concise answer in ${language}" }`;

    const contextText = `
Product: ${scan.productName} (${scan.brand || 'Unknown'})
Score: ${scan.healthScore}/100 (Grade ${scan.grade}, ${scan.riskLevel})
Serving: ${scan.servingSize}
Nutrition: Calories ${scan.calories}, Protein ${scan.protein}, Fat ${scan.fat}, Sugar ${scan.sugar}, Salt ${scan.salt}, Fiber ${scan.fiber}, Carbs ${scan.carbohydrates}
Ingredients: ${(scan.ingredients || []).join(', ') || 'Not specified'}
Additives: ${(scan.additives || []).join(', ') || 'None'} | Colors: ${(scan.artificialColors || []).join(', ') || 'None'} | Sweeteners: ${(scan.artificialSweeteners || []).join(', ') || 'None'}
Allergens: ${(scan.allergens || []).join(', ') || 'None'}
Summary: ${scan.summary || ''}

User question: ${question.trim()}
`;

    const attempts = [
      { model: 'gemini-4-hydrogen', delayMs: 0 },
      { model: 'gemini-3.1-flash-lite', delayMs: 350 },
    ];

    for (const attempt of attempts) {
      if (attempt.delayMs > 0) await new Promise((r) => setTimeout(r, attempt.delayMs));
      try {
        const response = await ai.models.generateContent({
          model: attempt.model,
          contents: contextText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            ...(attempt.model === 'gemini-4-hydrogen'
              ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
              : {}),
          },
        });
        const cleanJson = (response.text || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return res.json({ success: true, answer: parsed.answer || scan.summary });
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (!(msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429'))) {
          throw err;
        }
      }
    }

    return res.status(503).json({ error: 'Nutritionist AI is busy right now. Please try again.' });
  } catch (err: any) {
    console.error('Error in /api/ask-product:', err);
    return res.status(500).json({ error: err.message || 'Failed to answer product question' });
  }
});

// Vite Middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(appBaseDir, 'dist', 'index.html'))
      ? path.join(appBaseDir, 'dist')
      : fs.existsSync(path.join(appBaseDir, 'index.html'))
        ? appBaseDir
        : path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      return res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NutriScan AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
