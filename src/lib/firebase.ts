import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAqBaqZunbkRgeER_iK18OI2rgumx0XIoQ",
  authDomain: "swu-demo-b20f8.firebaseapp.com",
  projectId: "swu-demo-b20f8",
  storageBucket: "swu-demo-b20f8.firebasestorage.app",
  messagingSenderId: "894523011470",
  appId: "1:894523011470:web:a25ad209f62ddb425b74df",
  measurementId: "G-61B0JP12C4"
};

// Initialize Firebase (Singleton pattern to prevent re-initialization)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
