import { migrateGuestScansToUser } from '../services/scanService';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserStats: (isHealthy: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser) {
        try {
          // Migrate any old guest scans to the Google user's account.
          await migrateGuestScansToUser(currentUser.uid);

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

      console.log('Google login successful:', result.user.email);

      await migrateGuestScansToUser(result.user.uid);
    } catch (err) {
      console.error('Google Sign In Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setUserProfile(null);
  };

  const updateUserStats = async (isHealthy: boolean) => {
    if (!userProfile || !firebaseUser) return;

    const updated: UserProfile = {
      ...userProfile,
      totalScans: (userProfile.totalScans || 0) + 1,
      healthyScansCount:
        (userProfile.healthyScansCount || 0) + (isHealthy ? 1 : 0),
      unhealthyScansCount:
        (userProfile.unhealthyScansCount || 0) + (isHealthy ? 0 : 1),
    };

    setUserProfile(updated);

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);

      await setDoc(userRef, updated, {
        merge: true,
      });
    } catch (err) {
      console.warn(
        'Failed to update user stats in Firestore:',
        err
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        signInWithGoogle,
        logout,
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