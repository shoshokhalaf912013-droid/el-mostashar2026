import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBMk7oip2zhhkp4sbdWANg3oPzlxraEot4",
  authDomain: "el-mostashar2026.firebaseapp.com",
  projectId: "el-mostashar2026",
  storageBucket: "el-mostashar2026.firebasestorage.app", // ✅ FIX
  messagingSenderId: "637095910340",
  appId: "1:637095910340:web:7f147768d6cc8de0532291",
  measurementId: "G-6BHS2EJXEB"
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app, "el-mostashar2026");
export const storage = getStorage(app);
