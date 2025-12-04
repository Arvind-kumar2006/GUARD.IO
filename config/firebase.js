import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBJUuBH5aCmHTVWemGBDEtzP-GUDt4fA4",
  authDomain: "guardio-f6f26.firebaseapp.com",
  databaseURL: "https://guardio-f6f26-default-rtdb.firebaseio.com",   // ✅ ADD THIS
  projectId: "guardio-f6f26",
  storageBucket: "guardio-f6f26.appspot.com",                         // ✅ FIXED
  messagingSenderId: "905975977884",
  appId: "1:905975977884:web:2ec3de1c754cf74f035a59",
};

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);

export default app;