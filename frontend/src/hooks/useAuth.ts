import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      const msg = `Auth error: ${error.code || "unknown"} — ${error.message || "Sign-in failed"}`;
      setAuthError(msg);
      console.error(msg, err);
      // Show it to the user so we can debug
      alert(msg);
    }
  };

  const signOut = () => firebaseSignOut(auth);

  return { user, loading, authError, signInWithGoogle, signOut };
}
