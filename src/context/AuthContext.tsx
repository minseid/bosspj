"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../lib/firebase'; // Import Firebase auth and db instances
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: FirebaseUser | null;
  nickname: string | null;
  profileImageUrl: string | null; // Add profileImageUrl to context type
  login: (user: FirebaseUser) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  user: FirebaseUser | null;
  setUser: (user: FirebaseUser | null, nickname?: string | null, profileImageUrl?: string | null) => void; // Update setUser signature
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null); // New state for profileImageUrl
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUserState] = useState<FirebaseUser | null>(null); // Renamed to avoid conflict
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        // Fetch nickname and profileImageUrl from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setNickname(userData?.nickname || null);
          setProfileImageUrl(userData?.profileImageUrl || null); // Set profileImageUrl
        } else {
          console.warn("No user document found for UID:", user.uid);
          setNickname(null);
          setProfileImageUrl(null);
        }
        setUserState(user);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setNickname(null);
        setProfileImageUrl(null);
        setUserState(null);
      }
      setIsLoading(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Updated setUser function
  const setUser = (user: FirebaseUser | null, newNickname?: string | null, newProfileImageUrl?: string | null) => {
    setUserState(user);
    if (newNickname !== undefined) {
      setNickname(newNickname);
    }
    if (newProfileImageUrl !== undefined) {
      setProfileImageUrl(newProfileImageUrl);
    }
  };

  const login = (user: FirebaseUser) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    // Nickname and profileImageUrl will be fetched by onAuthStateChanged listener
    router.push('/');
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, nickname, profileImageUrl, login, logout, isLoading, user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 