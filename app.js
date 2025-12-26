// app.js - Versi Update: Satu Nama Satu Login Permanen + Dukungan Akun Tester
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

/**
 * @param {string} nama - Nama yang dipilih
 * @param {string} role - Role (admin/murid)
 * @param {boolean} isTester - Jika true, tidak akan mengunci nama di database
 */
async function loginWithName(nama, role, isTester = false) {
  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    const uid = user.uid;

    // HANYA kunci nama jika BUKAN akun tester
    if (!isTester) {
      const nameRef = doc(db, 'names', nama);

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(nameRef);
        const data = snap.exists() ? snap.data() : null;
        
        // Cek jika sudah diklaim orang lain
        if (data && data.claimedBy && data.claimedBy !== uid) {
          throw new Error('taken');
        }
        
        tx.set(nameRef, { 
          claimedBy: uid, 
          role: role, 
          claimedAt: serverTimestamp() 
        }, { merge: true });
      });
    }

    // Simpan profil ke users (untuk data dashboard)
    await setDoc(doc(db, 'users', uid), {
      nama: nama,
      role: role,
      lastLogin: new Date().toISOString(),
      nameKey: nama,
      isTester: isTester
    }, { merge: true });

    localStorage.setItem('userName', nama);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userUid', uid);
    localStorage.setItem('isTester', isTester);

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

// Fungsi ini sengaja dikosongkan/dinonaktifkan untuk mendukung "Satu Login Permanen"
async function releaseClaim(nameKey, uid) {
  // Jika ingin benar-benar mengunci, jangan lakukan apa-apa di sini
  console.log("Release claim dinonaktifkan untuk mode pengembangan satu-login.");
}

async function logout() {
  // Kita tidak memanggil releaseClaim agar status di Firestore tetap 'claimed'
  try {
    await signOut(auth);
  } finally {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

export { auth, db, loginWithName, subscribeNames, releaseClaim, logout };
