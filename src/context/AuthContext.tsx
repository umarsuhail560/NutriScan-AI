import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';
import { syncUserAccountToServer } from '../services/feedbackService';

const EMAIL_SESSION_KEY = 'nutriscan_email_session';
const LOCAL_ACCOUNTS_KEY = 'nutriscan_local_accounts';

interface LocalAccountRecord {
  uid: string;
  displayName: string;
  email: string;
  passwordDigest: string;
  profile: UserProfile;
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getLocalAccounts(): Record<string, LocalAccountRecord> {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalAccount(email: string, record: LocalAccountRecord) {
  try {
    const all = getLocalAccounts();
    all[email.toLowerCase()] = record;
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(all));
  } catch {
    // ignore quota errors
  }
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  isLocalEmailAuth: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, name: string) => Promise<void>;
  resetPassword: (e: string, newPass?: string) => Promise<'email_sent' | 'updated'>;
  logout: () => Promise<void>;
  enableGuestMode: () => void;
  updateUserStats: (isHealthy: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLocalEmailAuth, setIsLocalEmailAuth] = useState<boolean>(false);
  const [firebaseEmailEnabled, setFirebaseEmailEnabled] = useState<boolean | null>(null);

  const checkCapabilities = async (): Promise<boolean> => {
    if (firebaseEmailEnabled !== null) return firebaseEmailEnabled;
    try {
      const res = await fetch('/api/auth/capabilities');
      if (res.ok) {
        const data = await res.json();
        const enabled = !!data.firebaseEmailPasswordEnabled;
        setFirebaseEmailEnabled(enabled);
        return enabled;
      }
    } catch {
      // ignore
    }
    return false;
  };

  useEffect(() => {
    checkCapabilities();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        setIsGuest(false);
        setIsLocalEmailAuth(false);
        localStorage.removeItem(EMAIL_SESSION_KEY);
        const path = `users/${currentUser.uid}`;
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const loadedProfile = userSnap.data() as UserProfile;
            setUserProfile(loadedProfile);
            void syncUserAccountToServer(loadedProfile, 'google');
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'NutriScan User',
              email: currentUser.email,
              photoURL: currentUser.photoURL || null,
              totalScans: 0,
              healthyScansCount: 0,
              unhealthyScansCount: 0,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
            void syncUserAccountToServer(newProfile, 'google');
          }
        } catch (err) {
          console.warn('Error syncing user profile:', err);
          if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
            try {
              handleFirestoreError(err, OperationType.GET, path);
            } catch {
              // fallback profile in state if Firestore fails
            }
          }
          const fallbackProfile: UserProfile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'NutriScan User',
            email: currentUser.email,
            photoURL: currentUser.photoURL || null,
            totalScans: 0,
            healthyScansCount: 0,
            unhealthyScansCount: 0,
            createdAt: new Date().toISOString(),
          };
          setUserProfile(fallbackProfile);
          void syncUserAccountToServer(fallbackProfile, 'google');
        }
      } else {
        // Restore persisted email session if any
        try {
          const savedSessionRaw = localStorage.getItem(EMAIL_SESSION_KEY);
          if (savedSessionRaw) {
            const savedProfile = JSON.parse(savedSessionRaw) as UserProfile;
            setUserProfile(savedProfile);
            setIsLocalEmailAuth(true);
            setIsGuest(false);
            void syncUserAccountToServer(savedProfile, 'email');

            // Refresh stats from backend if available
            fetch(`/api/user-data/${encodeURIComponent(savedProfile.uid)}/profile`)
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => {
                if (data?.user) {
                  setUserProfile(data.user);
                  localStorage.setItem(EMAIL_SESSION_KEY, JSON.stringify(data.user));
                }
              })
              .catch(() => {});
          } else {
            setUserProfile(null);
            setIsLocalEmailAuth(false);
          }
        } catch {
          setUserProfile(null);
          setIsLocalEmailAuth(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithLocalBackend = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: pass }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.user) {
      const profile = data.user as UserProfile;
      const digest = await sha256Hex(`${cleanEmail}:${pass}`);
      saveLocalAccount(cleanEmail, {
        uid: profile.uid,
        displayName: profile.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        passwordDigest: digest,
        profile,
      });
      localStorage.setItem(EMAIL_SESSION_KEY, JSON.stringify(profile));
      setUserProfile(profile);
      setIsGuest(false);
      setIsLocalEmailAuth(true);
      return;
    }

    // Fallback to browser local accounts if backend restarted
    if (data.code === 'USER_NOT_FOUND') {
      const localAccounts = getLocalAccounts();
      const cached = localAccounts[cleanEmail];
      if (cached) {
        const digest = await sha256Hex(`${cleanEmail}:${pass}`);
        if (cached.passwordDigest !== digest) {
          throw new Error('Incorrect password. Please check your password and try again.');
        }
        // Re-sync to server silently
        fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cached.displayName,
            email: cleanEmail,
            password: pass,
          }),
        }).catch(() => {});

        localStorage.setItem(EMAIL_SESSION_KEY, JSON.stringify(cached.profile));
        setUserProfile(cached.profile);
        setIsGuest(false);
        setIsLocalEmailAuth(true);
        return;
      }
    }

    throw new Error(data.error || 'Invalid email or password.');
  };

  const registerWithLocalBackend = async (email: string, pass: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: cleanEmail, password: pass }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account.');
    }

    const profile = data.user as UserProfile;
    const digest = await sha256Hex(`${cleanEmail}:${pass}`);
    saveLocalAccount(cleanEmail, {
      uid: profile.uid,
      displayName: profile.displayName || name.trim(),
      email: cleanEmail,
      passwordDigest: digest,
      profile,
    });
    localStorage.setItem(EMAIL_SESSION_KEY, JSON.stringify(profile));
    setUserProfile(profile);
    setIsGuest(false);
    setIsLocalEmailAuth(true);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const fbEnabled = await checkCapabilities();
      if (fbEnabled) {
        try {
          await signInWithEmailAndPassword(auth, email, pass);
          return;
        } catch (err: any) {
          if (
            err.code === 'auth/operation-not-allowed' ||
            err.code === 'auth/user-not-found' ||
            err.code === 'auth/invalid-credential'
          ) {
            await loginWithLocalBackend(email, pass);
            return;
          }
          throw err;
        }
      } else {
        await loginWithLocalBackend(email, pass);
      }
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const fbEnabled = await checkCapabilities();
      if (fbEnabled) {
        try {
          const res = await createUserWithEmailAndPassword(auth, email, pass);
          await updateProfile(res.user, { displayName: name });
          return;
        } catch (err: any) {
          if (err.code === 'auth/operation-not-allowed') {
            setFirebaseEmailEnabled(false);
            await registerWithLocalBackend(email, pass, name);
            return;
          }
          throw err;
        }
      } else {
        await registerWithLocalBackend(email, pass, name);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, newPass?: string): Promise<'email_sent' | 'updated'> => {
    const cleanEmail = email.trim().toLowerCase();
    const fbEnabled = await checkCapabilities();
    if (fbEnabled && !newPass) {
      await sendPasswordResetEmail(auth, cleanEmail);
      return 'email_sent';
    }
    if (!newPass || newPass.length < 6) {
      throw new Error('Please enter a new password (at least 6 characters).');
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, newPassword: newPass }),
    });
    const data = await res.json().catch(() => ({}));

    const localAccounts = getLocalAccounts();
    if (!res.ok) {
      if (localAccounts[cleanEmail]) {
        const digest = await sha256Hex(`${cleanEmail}:${newPass}`);
        localAccounts[cleanEmail].passwordDigest = digest;
        localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(localAccounts));
        return 'updated';
      }
      throw new Error(data.error || 'No account found with this email address.');
    }

    if (localAccounts[cleanEmail]) {
      const digest = await sha256Hex(`${cleanEmail}:${newPass}`);
      localAccounts[cleanEmail].passwordDigest = digest;
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(localAccounts));
    }
    return 'updated';
  };

  const logout = async () => {
    setIsGuest(false);
    setIsLocalEmailAuth(false);
    localStorage.removeItem(EMAIL_SESSION_KEY);
    setUserProfile(null);
    if (auth.currentUser) {
      await signOut(auth);
    }
  };

  const enableGuestMode = () => {
    setIsGuest(true);
    setIsLocalEmailAuth(false);
    localStorage.removeItem(EMAIL_SESSION_KEY);
    setUserProfile({
      uid: 'guest',
      displayName: 'Guest Explorer',
      email: 'guest@nutriscan.ai',
      photoURL: null,
      totalScans: 0,
      healthyScansCount: 0,
      unhealthyScansCount: 0,
      createdAt: new Date().toISOString(),
    });
  };

  const updateUserStats = async (isHealthy: boolean) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      totalScans: (userProfile.totalScans || 0) + 1,
      healthyScansCount: (userProfile.healthyScansCount || 0) + (isHealthy ? 1 : 0),
      unhealthyScansCount: (userProfile.unhealthyScansCount || 0) + (isHealthy ? 0 : 1),
    };
    setUserProfile(updated);

    if (firebaseUser && !isGuest) {
      const path = `users/${firebaseUser.uid}`;
      void syncUserAccountToServer(updated, 'google');
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userRef, updated, { merge: true });
      } catch (e) {
        console.warn('Failed to update user stats in Firestore:', e);
        try {
          handleFirestoreError(e, OperationType.UPDATE, path);
        } catch {
          // keep UI responsive
        }
      }
    } else if (isLocalEmailAuth && userProfile.uid) {
      void syncUserAccountToServer(updated, 'email');
      localStorage.setItem(EMAIL_SESSION_KEY, JSON.stringify(updated));
      if (userProfile.email) {
        const accounts = getLocalAccounts();
        if (accounts[userProfile.email.toLowerCase()]) {
          accounts[userProfile.email.toLowerCase()].profile = updated;
          localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
        }
      }
      fetch(`/api/user-data/${encodeURIComponent(userProfile.uid)}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalScans: updated.totalScans,
          healthyScansCount: updated.healthyScansCount,
          unhealthyScansCount: updated.unhealthyScansCount,
        }),
      }).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        isGuest,
        isLocalEmailAuth,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        enableGuestMode,
        updateUserStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
