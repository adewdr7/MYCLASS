// app.js
// ===============================
// FIREBASE CORE & FIRESTORE FUNCTIONS
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcXFgMa8H8eassILqMBsNZfPmicYiNJ40",
  authDomain: "sekolah-sdnwidarasari.firebaseapp.com",
  projectId: "sekolah-sdnwidarasari",
  storageBucket: "sekolah-sdnwidarasari.firebasestorage.app",
  messagingSenderId: "9578530024",
  appId: "1:9578530024:web:7d770fa029a86a98ef755d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export semua yang dibutuhkan
export {
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  signInAnonymously
};

