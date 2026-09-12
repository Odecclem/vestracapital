"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  UserCredential
} from "firebase/auth";
import { doc, setDoc, onSnapshot, serverTimestamp, DocumentData } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserCredential>;
  register: (email: string, pass: string, fullName: string, referredBy?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  is2faVerified: boolean;
  setIs2faVerified: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [is2faVerified, setIs2faVerified] = useState(false);

  useEffect(() => {
    let unsubscribeDoc: () => void;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user role/data from Firestore
        unsubscribeDoc = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData(null);
          }
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string, fullName: string, referredBy: string = "") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const currentUser = userCredential.user;

    // Update profile with name
    await updateProfile(currentUser, { displayName: fullName });

    // Generate a random 8-character referral code
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create user document in Firestore
    await setDoc(doc(db, "users", currentUser.uid), {
      uid: currentUser.uid,
      fullName,
      email,
      role: "user",
      walletBalance: 0,
      totalInvested: 0,
      totalProfit: 0,
      kycStatus: "unverified",
      twoFactorEnabled: false,
      referralCode,
      referredBy,
      createdAt: serverTimestamp(),
    });

    return userCredential;
  };

  const logout = () => {
    setIs2faVerified(false);
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const changePassword = (newPassword: string) => {
    if (!auth.currentUser) return Promise.reject(new Error("No user signed in."));
    return updatePassword(auth.currentUser, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, register, logout, resetPassword, changePassword, is2faVerified, setIs2faVerified }}>
      {children}
    </AuthContext.Provider>
  );
};
