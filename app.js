// app.js - Memastikan sinkronisasi dan penanganan error yang lebih baik
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  runTransaction,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Pastikan config ini sesuai dengan yang ada di console Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyAcXFgMa8H8eassILqMBsNZfPmicYiNJ40",
  authDomain: "sekolah-sdnwidarasari.firebaseapp.com",
  projectId: "sekolah-sdnwidarasari",
  storageBucket: "sekolah-sdnwidarasari.firebasestorage.app",
  messagingSenderId: "9578530024",
  appId: "1:9578530024:web:7d770fa029a86a98ef755d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem('userUid', user.uid);
  }
});

async function loginWithName(nama, role) {
  try {
    // 1. Sign in secara Anonymous
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    const uid = user.uid;

    const nameRef = doc(db, 'names', nama);

    // 2. Transaksi: Klaim nama secara atomik agar tidak bisa double klik
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(nameRef);
      const data = snap.exists() ? snap.data() : null;
      
      // Jika sudah ada yang klaim dan orang itu bukan kita
      if (data && data.claimedBy && data.claimedBy !== uid) {
        throw new Error('taken');
      }
      
      // Simpan klaim ke koleksi 'names'
      tx.set(nameRef, { 
        claimedBy: uid, 
        role: role, 
        claimedAt: serverTimestamp() 
      }, { merge: true });
    });

    // 3. Simpan detail profil ke koleksi 'users'
    await setDoc(doc(db, 'users', uid), {
      nama: nama,
      role: role,
      lastLogin: new Date().toISOString(),
      nameKey: nama
    }, { merge: true });

    // 4. Simpan ke LocalStorage untuk Dashboard
    localStorage.setItem('userName', nama);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userUid', uid);

    return { success: true, uid };
  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, error: error.message };
  }
}

function subscribeNames(onChange) {
  const col = collection(db, 'names');
  return onSnapshot(col, (snap) => {
    const data = {};
    snap.forEach(d => {
        data[d.id] = d.data();
    });
    onChange(data);
  });
}

async function releaseClaim(nameKey, uid) {
  if (!nameKey || !uid) return;
  const nameRef = doc(db, 'names', nameKey);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(nameRef);
      if (!snap.exists()) return;
      const data = snap.data();
      if (data.claimedBy === uid) {
        tx.update(nameRef, { claimedBy: null, claimedAt: null });
      }
    });
  } catch (err) {
    console.error('Release Error:', err);
  }
}

async function logout() {
  const nameKey = localStorage.getItem('userName');
  const uid = localStorage.getItem('userUid');
  try {
    if (nameKey && uid) {
      await releaseClaim(nameKey, uid);
    }
    await signOut(auth);
  } finally {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

export { auth, db, loginWithName, subscribeNames, releaseClaim, logout };
