// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAqX11Q5XVKDEq6_Cg9DjIPjLpAnD05_Q",
  authDomain: "sheild-427ef.firebaseapp.com",
  projectId: "sheild-427ef",
  storageBucket: "sheild-427ef.firebasestorage.app",
  messagingSenderId: "1077899900122",
  appId: "1:1077899900122:web:5eaddb25faff0ba4a821e3",
  measurementId: "G-C1NRQKC9CV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export database
export { db };
