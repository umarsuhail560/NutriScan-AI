import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_NEW_API_KEY",
  authDomain: "nutriscan-ai-fbf9c.firebaseapp.com",
  projectId: "nutriscan-ai-fbf9c",
  storageBucket: "nutriscan-ai-fbf9c.firebasestorage.app",
  messagingSenderId: "1005796912952",
  appId: "1:1005796912952:web:24899b748b6f1389581bcd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export default app;