import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { FeedbackItem, RegisteredAccountSummary, UserProfile } from '../types';

const GUEST_SENDER_KEY = 'nutriscan_guest_sender_id';
const ADMIN_TOKEN_KEY = 'nutriscan_admin_token';

export function getOrCreateGuestSenderId(): string {
  try {
    let existing = localStorage.getItem(GUEST_SENDER_KEY);
    if (!existing) {
      const rand =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
          : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      existing = `guest_${rand}`;
      localStorage.setItem(GUEST_SENDER_KEY, existing);
    }
    return existing;
  } catch {
    return `guest_${Date.now()}`;
  }
}

export function getEffectiveSenderIdentity(
  userProfile: UserProfile | null,
  isGuest: boolean,
  isLocalEmailAuth: boolean
): {
  senderUid: string;
  senderName: string;
  senderEmail: string;
  senderType: 'google' | 'email' | 'guest';
} {
  if (userProfile && !isGuest && userProfile.uid !== 'guest') {
    const isGoogle = !isLocalEmailAuth && Boolean(auth.currentUser);
    return {
      senderUid: userProfile.uid,
      senderName: userProfile.displayName || userProfile.email?.split('@')[0] || 'NutriScan User',
      senderEmail: userProfile.email || 'user@nutriscan.ai',
      senderType: isGoogle ? 'google' : 'email',
    };
  }
  return {
    senderUid: getOrCreateGuestSenderId(),
    senderName: 'Guest User',
    senderEmail: 'guest@nutriscan.ai',
    senderType: 'guest',
  };
}

export async function syncUserAccountToServer(
  profile: UserProfile,
  provider: 'google' | 'email'
): Promise<void> {
  if (!profile?.uid || profile.uid === 'guest') return;
  try {
    await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: profile.uid,
        displayName: profile.displayName || profile.email?.split('@')[0] || 'NutriScan User',
        email: profile.email || '',
        photoURL: profile.photoURL || null,
        provider,
        totalScans: profile.totalScans || 0,
        healthyScansCount: profile.healthyScansCount || 0,
        unhealthyScansCount: profile.unhealthyScansCount || 0,
        createdAt: profile.createdAt || new Date().toISOString(),
      }),
    });
  } catch {
    // Non-fatal network sync
  }
}

export async function submitUserFeedback(params: {
  senderUid: string;
  senderName: string;
  senderEmail: string;
  senderType: 'google' | 'email' | 'guest';
  message: string;
}): Promise<FeedbackItem> {
  const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const payload: FeedbackItem = {
    id: feedbackId,
    senderUid: params.senderUid,
    senderName: params.senderName,
    senderEmail: params.senderEmail,
    senderType: params.senderType,
    message: params.message.trim(),
    status: 'pending',
    adminReply: null,
    repliedAt: null,
    createdAt: now,
  };

  // Persist to Express backend store (ensures Admin always receives it across auth modes)
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit feedback');
  }

  const data = await response.json();

  // Also mirror to Firestore /feedback/{id} if user is signed into Firebase Auth
  if (auth.currentUser && auth.currentUser.uid === params.senderUid) {
    try {
      await setDoc(doc(db, 'feedback', feedbackId), payload);
    } catch (err) {
      console.warn('Firestore feedback mirror skipped:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, `feedback/${feedbackId}`);
      } catch {
        // Backend already saved it safely
      }
    }
  }

  return data.item || payload;
}

export async function fetchMyFeedback(senderUid: string): Promise<FeedbackItem[]> {
  if (!senderUid) return [];

  const merged = new Map<string, FeedbackItem>();

  try {
    const res = await fetch(`/api/feedback/my?senderUid=${encodeURIComponent(senderUid)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          merged.set(item.id, item);
        }
      }
    }
  } catch {
    // ignore fetch error
  }

  // Also check sender's own Firestore feedback docs if signed into Firebase
  if (auth.currentUser && auth.currentUser.uid === senderUid) {
    try {
      const q = query(collection(db, 'feedback'), where('senderUid', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        const fb = docSnap.data() as FeedbackItem;
        const prev = merged.get(fb.id);
        if (!prev || (fb.adminReply && !prev.adminReply)) {
          merged.set(fb.id, fb);
        }
      });
    } catch {
      // ignore offline or unverified errors
    }
  }

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// --- Admin Authentication & Actions ---

export function getSavedAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function verifyAdminPasscode(passcode: string): Promise<{
  verified: boolean;
  token?: string;
  adminName?: string;
}> {
  const res = await fetch('/api/admin/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });

  if (!res.ok) {
    return { verified: false };
  }

  const data = await res.json();
  if (data.verified && data.token) {
    try {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    } catch {
      // ignore storage errors
    }
    return { verified: true, token: data.token, adminName: data.adminName || 'Umar Suhail' };
  }
  return { verified: false };
}

export interface AdminOverviewResponse {
  adminName: string;
  accounts: RegisteredAccountSummary[];
  feedback: FeedbackItem[];
  stats: {
    totalAccounts: number;
    totalFeedback: number;
    pendingFeedback: number;
    totalScansStored: number;
  };
}

export async function fetchAdminOverview(): Promise<AdminOverviewResponse> {
  const token = getSavedAdminToken();
  if (!token) {
    throw new Error('ADMIN_UNAUTHORIZED');
  }

  const res = await fetch('/api/admin/overview', {
    headers: {
      'x-admin-token': token,
    },
  });

  if (res.status === 401) {
    clearAdminSession();
    throw new Error('ADMIN_UNAUTHORIZED');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load admin overview');
  }

  const serverData = (await res.json()) as AdminOverviewResponse;

  // If browser is ALSO signed in as Firebase bootstrapped admin (umarsuhail560@gmail.com), merge any Firestore-only users/feedback
  if (auth.currentUser?.email === 'umarsuhail560@gmail.com' && auth.currentUser?.emailVerified) {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const accountMap = new Map<string, RegisteredAccountSummary>();
      for (const acc of serverData.accounts) accountMap.set(acc.uid, acc);

      usersSnap.forEach((docSnap) => {
        const u = docSnap.data() as UserProfile;
        if (u?.uid && !accountMap.has(u.uid)) {
          accountMap.set(u.uid, {
            uid: u.uid,
            displayName: u.displayName || 'NutriScan User',
            email: u.email || '',
            photoURL: u.photoURL || null,
            provider: 'google',
            totalScans: u.totalScans || 0,
            healthyScansCount: u.healthyScansCount || 0,
            unhealthyScansCount: u.unhealthyScansCount || 0,
            createdAt: u.createdAt || new Date().toISOString(),
            lastActiveAt: u.createdAt || new Date().toISOString(),
          });
        }
      });

      const mergedAccounts = Array.from(accountMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      serverData.accounts = mergedAccounts;
      serverData.stats.totalAccounts = mergedAccounts.length;
    } catch {
      // Server overview already has synced accounts
    }
  }

  return serverData;
}

export async function replyToUserFeedback(feedbackId: string, reply: string): Promise<FeedbackItem> {
  const token = getSavedAdminToken();
  if (!token) {
    throw new Error('ADMIN_UNAUTHORIZED');
  }

  const res = await fetch(`/api/admin/feedback/${encodeURIComponent(feedbackId)}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
    },
    body: JSON.stringify({ reply }),
  });

  if (res.status === 401) {
    clearAdminSession();
    throw new Error('ADMIN_UNAUTHORIZED');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send reply');
  }

  const data = await res.json();

  // Mirror reply to Firestore if signed in as Firebase admin
  if (auth.currentUser?.email === 'umarsuhail560@gmail.com' && auth.currentUser?.emailVerified) {
    try {
      await updateDoc(doc(db, 'feedback', feedbackId), {
        adminReply: reply.trim(),
        repliedAt: data.item?.repliedAt || new Date().toISOString(),
        status: 'replied',
      });
    } catch {
      // ignore if doc only exists in backend store
    }
  }

  return data.item;
}
