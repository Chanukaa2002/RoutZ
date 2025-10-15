import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY || "AIzaSyB8x1Uzl518GL0TcAIFAZxgYqK7SP8NTdk",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "routz-26b7e.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "routz-26b7e",
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "routz-26b7e.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "876265950393",
  appId:
    process.env.FIREBASE_APP_ID || "1:876265950393:web:86e6e33239f3b52abb1f68",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
