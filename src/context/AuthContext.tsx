import { migrateGuestScansToUser } from '../services/scanService'; 
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
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, name: string) => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {

  await migrateGuestScansToUser(currentUser.uid);

  setIsGuest(false);
        // Fetch or create Firestore user doc
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
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
          }
        } catch (err) {
          console.warn('Error syncing user profile:', err);
          setUserProfile({
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'NutriScan User',
            email: currentUser.email,
            photoURL: currentUser.photoURL || null,
            totalScans: 0,
            healthyScansCount: 0,
            unhealthyScansCount: 0,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
  setLoading(true);

  try {
    const result = await signInWithPopup(auth, googleProvider);

    console.log("Google login successful:", result.user.email);

    await migrateGuestScansToUser(result.user.uid);

  } catch (err: any) {
    console.error('Google Sign In Error:', err);
    throw err;

  } finally {
    setLoading(false);
  }
};

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password sign-in is disabled in Firebase console. Please sign in with Google Account, Guest Mode, or enable Email/Password in Firebase Console.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password registration is disabled in Firebase console. Please sign in with Google Account, Guest Mode, or enable Email/Password in Firebase Console.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    setIsGuest(false);
    await signOut(auth);
  };

  const enableGuestMode = () => {
    setIsGuest(true);
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
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userRef, updated, { merge: true });
      } catch (e) {
        console.warn('Failed to update user stats in Firestore:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        isGuest,
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
