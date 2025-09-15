// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAp8MOYmHXbgBffdUgT71a86Ax0E5qouso",
  authDomain: "star-app-aefc8.firebaseapp.com",
  projectId: "star-app-aefc8",
  storageBucket: "star-app-aefc8.appspot.com",
  messagingSenderId: "538762449009",
  appId: "1:538762449009:web:f0f33d42f17c2518124bd0",
  measurementId: "G-NNF8J0Q4LG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // ✅ Add this
export const db = getFirestore(app);
