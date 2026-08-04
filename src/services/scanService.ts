import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FoodScan } from '../types';

const LOCAL_STORAGE_KEY = 'nutriscan_guest_scans';

// Fallback to local storage for guest / offline mode
export function getLocalScans(): FoodScan[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading local scans', err);
    return [];
  }
}

export function saveLocalScan(scan: FoodScan): FoodScan {
  const scans = getLocalScans();
  const newScan = { ...scan, id: scan.id || `local_${Date.now()}` };
  const updated = [newScan, ...scans];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return newScan;
}

export function updateLocalScanFavorite(scanId: string, isFavorite: boolean) {
  const scans = getLocalScans().map((s) => (s.id === scanId ? { ...s, isFavorite } : s));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scans));
}

export function deleteLocalScan(scanId: string) {
  const scans = getLocalScans().filter((s) => s.id !== scanId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scans));
}

// Firestore operations
export async function saveScanToFirestore(scan: Omit<FoodScan, 'id'>, userId: string): Promise<FoodScan> {
  const newScanData = {
    ...scan,
    userId,
    createdAt: new Date().toISOString(),
  };

  if (!userId || userId === 'guest') {
    return saveLocalScan({ ...newScanData, id: `guest_${Date.now()}` });
  }

  try {
    const docRef = await addDoc(collection(db, 'scans'), newScanData);
    return { ...newScanData, id: docRef.id };
  } catch (err) {
    console.warn('Firestore write failed, using local storage fallback:', err);
    return saveLocalScan({ ...newScanData, id: `local_${Date.now()}` });
  }
}

export async function fetchUserScans(userId: string): Promise<FoodScan[]> {
  if (!userId || userId === 'guest') {
    return getLocalScans();
  }

  try {
    const q = query(
      collection(db, 'scans'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const result: FoodScan[] = [];
    snapshot.forEach((docSnap) => {
      result.push({ id: docSnap.id, ...(docSnap.data() as Omit<FoodScan, 'id'>) });
    });
    // Sort in memory to avoid needing a composite index
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Firestore read failed, falling back to local storage:', err);
    return getLocalScans();
  }
}

export async function toggleFavoriteScan(scanId: string, isFavorite: boolean, userId: string): Promise<void> {
  if (!userId || userId === 'guest' || scanId.startsWith('local_') || scanId.startsWith('guest_')) {
    updateLocalScanFavorite(scanId, isFavorite);
    return;
  }

  try {
    const scanRef = doc(db, 'scans', scanId);
    await updateDoc(scanRef, { isFavorite });
  } catch (err) {
    console.warn('Firestore toggle favorite failed, updating local storage:', err);
    updateLocalScanFavorite(scanId, isFavorite);
  }
}

export async function deleteScanFromFirestore(scanId: string, userId: string): Promise<void> {
  if (!userId || userId === 'guest' || scanId.startsWith('local_') || scanId.startsWith('guest_')) {
    deleteLocalScan(scanId);
    return;
  }

  try {
    const scanRef = doc(db, 'scans', scanId);
    await deleteDoc(scanRef);
  } catch (err) {
    console.warn('Firestore delete failed, deleting local storage:', err);
    deleteLocalScan(scanId);
  }
}

// Backend API Service Calls
export async function analyzeImageWithAI(imageBase64: string, mimeType = 'image/jpeg', userPrompt?: string) {
  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, userPrompt }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to analyze product image');
  }

  const result = await response.json();
  return result.data;
}

export async function analyzeBarcodeWithAI(barcode: string) {
  const response = await fetch('/api/analyze-barcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barcode }),
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
