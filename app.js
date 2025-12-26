// app.js
// ===============================
// FIREBASE CORE (SIMPLE VERSION)
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInAnonymously,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// 🔥 FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAcXFgMa8H8eassILqMBsNZfPmicYiNJ40",
  authDomain: "sekolah-sdnwidarasari.firebaseapp.com",
  projectId: "sekolah-sdnwidarasari",
  storageBucket: "sekolah-sdnwidarasari.firebasestorage.app",
  messagingSenderId: "9578530024",
  appId: "1:9578530024:web:7d770fa029a86a98ef755d"
};

// ===============================
// INITIALIZE
// ===============================
const app = initializeApp(firebaseConfig);

// ===============================
// SERVICES
// ===============================
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// FUNGSI BANTUAN
// ===============================

// Fungsi untuk login dengan nama
async function loginWithName(nama, role) {
  try {
    // Simpan data user ke localStorage
    localStorage.setItem('userName', nama);
    localStorage.setItem('userRole', role);
    
    // Login anonymous ke Firebase
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    
    // Simpan data user ke Firestore
    await setDoc(doc(db, "users", user.uid), {
      nama: nama,
      role: role,
      lastLogin: new Date().toISOString()
    });
    
    return { success: true, uid: user.uid };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
}

// Fungsi untuk cek apakah user sudah login
function checkAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Fungsi logout
function logout() {
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  window.location.href = 'index.html';
}

// ===============================
// EXPORT
// ===============================
export {
  auth,
  db,
  loginWithName,
  checkAuth,
  logout,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs
};
