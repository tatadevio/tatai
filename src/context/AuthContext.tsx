"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut, getRedirectResult } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  showLogin: boolean;
  setShowLogin: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  showLogin: false,
  setShowLogin: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const firebaseAuth = getFirebaseAuth();

        // Process Google redirect result first, THEN subscribe to auth state
        try {
          const result = await getRedirectResult(firebaseAuth);
          if (result?.user) {
            setUser(result.user);
            setLoading(false);
          }
        } catch {}

        unsub = onAuthStateChanged(firebaseAuth, (u) => {
          setUser(u);
          setLoading(false);
        });
      } catch {
        setLoading(false);
      }
    })();
    return () => unsub?.();
  }, []);

  async function logout() {
    try {
      await signOut(getFirebaseAuth());
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, showLogin, setShowLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
