import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  // TODO: Replace with your Firebase config from console
  // Firebase Console → Project Settings → General → Your apps → Web app
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "travelforge-app.firebaseapp.com",
  projectId: "travelforge-app",
  storageBucket: "travelforge-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// App Check — bot/abuse protection for the generateItinerary callable.
// No-op until VITE_RECAPTCHA_SITE_KEY is set, so current deploys keep working
// until enforcement is flipped on server-side (enforceAppCheck on the function).
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
if (recaptchaSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export default app;
