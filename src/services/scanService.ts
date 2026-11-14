import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { FoodScan } from '../types';

const GUEST_STORAGE_KEY = 'nutriscan_guest_scans';

function getStorageKey(userId: string): string {
  if (!userId || userId === 'guest') return GUEST_STORAGE_KEY;
  return `nutriscan_scans_${userId}`;
}

export function getLocalScans(userId = 'guest'): FoodScan[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading local scans', err);
    return [];
  }
}

function setLocalScans(userId: string, scans: FoodScan[]) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(scans));
  } catch (err) {
    console.warn('Failed to write local scans:', err);
  }
}

export function saveLocalScan(scan: FoodScan, userId = 'guest'): FoodScan {
  const scans = getLocalScans(userId);
  const newScan = { ...scan, id: scan.id || `local_${Date.now()}` };
  const updated = [newScan, ...scans.filter((s) => s.id !== newScan.id)];
  setLocalScans(userId, updated);
  return newScan;
}

export function updateLocalScanFavorite(scanId: string, isFavorite: boolean, userId = 'guest') {
  const scans = getLocalScans(userId).map((s) => (s.id === scanId ? { ...s, isFavorite } : s));
  setLocalScans(userId, scans);
}

export function deleteLocalScan(scanId: string, userId = 'guest') {
  const scans = getLocalScans(userId).filter((s) => s.id !== scanId);
  setLocalScans(userId, scans);
}

function isFirebaseSignedInForUser(userId: string): boolean {
  return Boolean(auth.currentUser && userId && auth.currentUser.uid === userId);
}

// Firestore & Backend Scan Operations
export async function saveScanToFirestore(scan: Omit<FoodScan, 'id'>, userId: string): Promise<FoodScan> {
  const newScanData = {
    ...scan,
    userId,
    createdAt: new Date().toISOString(),
  };

  if (!userId || userId === 'guest') {
    return saveLocalScan({ ...newScanData, id: `guest_${Date.now()}` }, 'guest');
  }

  if (isFirebaseSignedInForUser(userId)) {
    try {
      const docRef = await addDoc(collection(db, 'scans'), newScanData);
      return { ...newScanData, id: docRef.id };
    } catch (err) {
      console.warn('Firestore write failed, using local storage fallback:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'scans');
      } catch {
        // fallback below
      }
      return saveLocalScan({ ...newScanData, id: `local_${Date.now()}` }, userId);
    }
  }

  // Local email-authenticated user: persist to backend + localStorage
  try {
    const res = await fetch(`/api/user-data/${encodeURIComponent(userId)}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newScanData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.scan) {
        saveLocalScan(data.scan, userId);
        return data.scan;
      }
    }
  } catch (err) {
    console.warn('Backend scan save failed, saving locally:', err);
  }
  return saveLocalScan({ ...newScanData, id: `local_${Date.now()}` }, userId);
}

export async function fetchUserScans(userId: string): Promise<FoodScan[]> {
  if (!userId || userId === 'guest') {
    return getLocalScans('guest');
  }

  if (isFirebaseSignedInForUser(userId)) {
    try {
      const q = query(collection(db, 'scans'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const result: FoodScan[] = [];
      snapshot.forEach((docSnap) => {
        result.push({ id: docSnap.id, ...(docSnap.data() as Omit<FoodScan, 'id'>) });
      });
      return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Firestore read failed, falling back to local storage:', err);
      try {
        handleFirestoreError(err, OperationType.LIST, 'scans');
      } catch {
        // fallback below
      }
      return getLocalScans(userId);
    }
  }

  // Local email-authenticated user
  const localScans = getLocalScans(userId);
  try {
    const res = await fetch(`/api/user-data/${encodeURIComponent(userId)}/scans`);
    if (res.ok) {
      const data = await res.json();
      const serverScans: FoodScan[] = Array.isArray(data.scans) ? data.scans : [];
      if (serverScans.length > 0) {
        setLocalScans(userId, serverScans);
        return serverScans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
  } catch {
    // use local fallback
  }
  return localScans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function toggleFavoriteScan(scanId: string, isFavorite: boolean, userId: string): Promise<void> {
  if (!userId || userId === 'guest' || scanId.startsWith('local_') || scanId.startsWith('guest_')) {
    updateLocalScanFavorite(scanId, isFavorite, userId || 'guest');
    return;
  }

  if (isFirebaseSignedInForUser(userId)) {
    const path = `scans/${scanId}`;
    try {
      const scanRef = doc(db, 'scans', scanId);
      await updateDoc(scanRef, { isFavorite });
      return;
    } catch (err) {
      console.warn('Firestore toggle favorite failed, updating local storage:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, path);
      } catch {
        // fallback
      }
      updateLocalScanFavorite(scanId, isFavorite, userId);
      return;
    }
  }

  updateLocalScanFavorite(scanId, isFavorite, userId);
  fetch(`/api/user-data/${encodeURIComponent(userId)}/scans/${encodeURIComponent(scanId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isFavorite }),
  }).catch(() => {});
}

export async function deleteScanFromFirestore(scanId: string, userId: string): Promise<void> {
  if (!userId || userId === 'guest' || scanId.startsWith('local_') || scanId.startsWith('guest_')) {
    deleteLocalScan(scanId, userId || 'guest');
    return;
  }

  if (isFirebaseSignedInForUser(userId)) {
    const path = `scans/${scanId}`;
    try {
      const scanRef = doc(db, 'scans', scanId);
      await deleteDoc(scanRef);
      return;
    } catch (err) {
      console.warn('Firestore delete failed, deleting local storage:', err);
      try {
        handleFirestoreError(err, OperationType.DELETE, path);
      } catch {
        // fallback
      }
      deleteLocalScan(scanId, userId);
      return;
    }
  }

  deleteLocalScan(scanId, userId);
  fetch(`/api/user-data/${encodeURIComponent(userId)}/scans/${encodeURIComponent(scanId)}`, {
    method: 'DELETE',
  }).catch(() => {});
}

function getActiveAnalysisPreferences() {
  const language = localStorage.getItem('nutriscan_lang') || 'English';
  let dietaryPreferences: string[] = [];
  try {
    const raw = localStorage.getItem('nutriscan_dietary');
    if (raw) dietaryPreferences = JSON.parse(raw);
  } catch {
    dietaryPreferences = [];
  }
  return { language, dietaryPreferences };
}

// Backend API Service Calls
export async function analyzeImageWithAI(imageBase64: string, mimeType = 'image/jpeg', userPrompt?: string) {
  const { language, dietaryPreferences } = getActiveAnalysisPreferences();
  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, userPrompt, language, dietaryPreferences }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to analyze product image');
  }

  const result = await response.json();
  return result.data;
}

export async function analyzeBarcodeWithAI(barcode: string) {
  const { language, dietaryPreferences } = getActiveAnalysisPreferences();
  const response = await fetch('/api/analyze-barcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barcode, language, dietaryPreferences }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to analyze barcode');
  }

  return await response.json();
}

export async function searchProductsQuery(queryStr: string) {
  const response = await fetch('/api/search-products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: queryStr }),
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  const data = await response.json();
  return data.results || [];
}

export interface ProductComparisonResult {
  winner: 'A' | 'B' | 'Tie';
  headline: string;
  verdict: string;
  keyDifferences: string[];
  recommendation: string;
}

export async function compareProductsWithAI(
  productA: FoodScan,
  productB: FoodScan
): Promise<ProductComparisonResult> {
  const { language, dietaryPreferences } = getActiveAnalysisPreferences();
  const response = await fetch('/api/compare-products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productA, productB, language, dietaryPreferences }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to compare products');
  }

  const result = await response.json();
  return result.comparison;
}

export async function askProductQuestionWithAI(scan: FoodScan, question: string): Promise<string> {
  const { language, dietaryPreferences } = getActiveAnalysisPreferences();
  const response = await fetch('/api/ask-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scan, question, language, dietaryPreferences }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to get AI nutritionist answer');
  }

  const result = await response.json();
  return result.answer;
}

