import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBJUuBH5aCmHTVWemGBDEtzP-GUDt4fA4",
  authDomain: "guardio-f6f26.firebaseapp.com",
  projectId: "guardio-f6f26",
  storageBucket: "guardio-f6f26.firebasestorage.app",
  messagingSenderId: "905975977884",
  appId: "1:905975977884:web:2ec3de1c754cf74f035a59",
};
// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;

