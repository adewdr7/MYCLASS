// app.js - FIXED VERSION
// Tujuan:
// 1. Nama guru KONSISTEN (tidak hilang, tidak berubah)
// 2. Tester mode STABIL
// 3. Semua halaman pakai satu sumber data (single source of truth)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  runTransaction,
  serverTimestamp,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   FIREBASE INIT
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyAcXFgMa8H8eassILqMBsNZfPmicYiNJ40",
  authDomain: "sekolah-sdnwidarasari.firebaseapp.com",
  projectId: "sekolah-sdnwidarasari",
  storageBucket: "sekolah-sdnwidarasari.firebasestorage.app",
  messagingSenderId: "9578530024",
  appId: "1:9578530024:web:7d770fa029a86a98ef755d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem("userUid", user.uid);
  }
});

/* =========================
   LOGIN DENGAN NAMA (FIX)
========================= */
/**
 * @param {string} nama - Nama guru / murid (KHUSUS)
 * @param {string} role - admin | guru | murid
 * @param {boolean} isTester - mode tester
 */
export async function loginWithName(nama, role, isTester = false) {
  try {
    const credential = await signInAnonymously(auth);
    const uid = credential.user.uid;

    // 🔒 STANDARISASI NAMA (INI KUNCI SEMUA FILTER MAPEL)
    const FIXED_NAME = nama.trim().toUpperCase();

    // Kunci nama HANYA jika bukan tester
    if (!isTester) {
      const nameRef = doc(db, "names", FIXED_NAME);

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(nameRef);
        const data = snap.exists() ? snap.data() : null;

        if (data?.claimedBy && data.claimedBy !== uid) {
          throw new Error("Nama sudah digunakan");
        }

        tx.set(
          nameRef,
          {
            claimedBy: uid,
            role,
            claimedAt: serverTimestamp()
          },
          { merge: true }
        );
      });
    }

    // Simpan profil user (dashboard & audit)
    await setDoc(
      doc(db, "users", uid),
      {
        nama: FIXED_NAME,
        role,
        isTester,
        lastLogin: new Date().toISOString()
      },
      { merge: true }
    );

    // ✅ SINGLE SOURCE OF TRUTH (LOCAL)
    localStorage.setItem("userName", FIXED_NAME);
    localStorage.setItem("userRole", role);
    localStorage.setItem("isTester", String(isTester));
    localStorage.setItem("userUid", uid);

    return { success: true, uid };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: err.message };
  }
}

/* =========================
   CONTEXT HELPER (PENTING)
========================= */
export function getCurrentUserContext() {
  return {
    name: (localStorage.getItem("userName") || "").toUpperCase(),
    role: localStorage.getItem("userRole"),
    isTester: localStorage.getItem("isTester") === "true",
    uid: localStorage.getItem("userUid")
  };
}

/* =========================
   SUBSCRIBE NAMES (OPTIONAL)
========================= */
export function subscribeNames(onChange) {
  const col = collection(db, "names");
  return onSnapshot(col, (snap) => {
    const data = {};
    snap.forEach((d) => {
      data[d.id] = d.data();
    });
    onChange(data);
  });
}

/* =========================
   LOGOUT (AMAN)
========================= */
export async function logout() {
  try {
    await signOut(auth);
  } finally {
    localStorage.clear();
    window.location.href = "index.html";
  }
}
