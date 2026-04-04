import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  // TODO: Replace with your Firebase config from console
  // Firebase Console → Project Settings → General → Your apps → Web app
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "tripforge-app-2026.firebaseapp.com",
  projectId: "tripforge-app-2026",
  storageBucket: "tripforge-app-2026.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export default app;
