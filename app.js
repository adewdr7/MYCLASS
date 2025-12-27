// app.js — FINAL FIX VERSION
// Stable anonymous auth + name claiming + shared context

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
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
export const auth = getAuth(app);
export const db = getFirestore(app);

const APP_ROOT = ["artifacts", "sekolah-sdnwidarasari"];

/* =========================
   AUTH READY PROMISE
========================= */
let authReadyResolve;
export const authReady = new Promise((res) => (authReadyResolve = res));

onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem("userUid", user.uid);
    authReadyResolve(user);
  }
});

/* =========================
   LOGIN + CLAIM NAME
========================= */
export async function loginWithName(nama, role, isTester = false) {
  try {
    const cred = await signInAnonymously(auth);
    const uid = cred.user.uid;
    const FIXED_NAME = nama.trim().toUpperCase();

    // 🔒 Klaim nama (kecuali tester)
    if (!isTester) {
      const nameRef = doc(db, ...APP_ROOT, "claimed_names", FIXED_NAME);

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(nameRef);
        if (snap.exists()) {
          throw new Error("taken");
        }
        tx.set(nameRef, {
          claimedBy: uid,
          role,
          createdAt: serverTimestamp()
        });
      });
    }

    // 👤 Simpan profil user
    await setDoc(
      doc(db, ...APP_ROOT, "users", uid),
      {
        name: FIXED_NAME,
        role,
        isTester,
        lastLogin: serverTimestamp()
      },
      { merge: true }
    );

    // 🧠 Context lokal
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
   CONTEXT HELPER
========================= */
export function getCurrentUserContext() {
  return {
    name: localStorage.getItem("userName"),
    role: localStorage.getItem("userRole"),
    isTester: localStorage.getItem("isTester") === "true",
    uid: localStorage.getItem("userUid")
  };
}

/* =========================
   SUBSCRIBE CLAIMED NAMES
   (LOGIN PAGE)
========================= */
export async function subscribeNames(onChange) {
  await authReady;

  const colRef = collection(db, ...APP_ROOT, "claimed_names");
  return onSnapshot(colRef, (snap) => {
    const data = {};
    snap.forEach((d) => (data[d.id] = d.data()));
    onChange(data);
  });
}

/* =========================
   LOGOUT
========================= */
export async function logout() {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
}
