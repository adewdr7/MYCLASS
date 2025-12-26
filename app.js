// app.js - updated: Firestore transaction-based name claim + realtime subscription
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  updateDoc
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

// Ensure auth state persists and store uid local for easy comparisons
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem('userUid', user.uid);
  }
});

async function loginWithName(nama, role) {
  try {
    // sign in anonymously first
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    const uid = user.uid;

    const nameRef = doc(db, 'names', nama);

    // run transaction to claim the name atomically
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(nameRef);
      const data = snap.exists() ? snap.data() : null;
      if (!data || !data.claimedBy) {
        tx.set(nameRef, { claimedBy: uid, role: role, claimedAt: serverTimestamp() }, { merge: true });
      } else {
        throw new Error('taken');
      }
    });

    // save user record
    await setDoc(doc(db, 'users', uid), {
      nama: nama,
      role: role,
      lastLogin: new Date().toISOString(),
      nameKey: nama
    }, { merge: true });

    // persist locally
    localStorage.setItem('userName', nama);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userUid', uid);

    return { success: true, uid };
  } catch (error) {
    if (error.message && error.message.toLowerCase().includes('taken')) {
      return { success: false, error: 'Nama sudah diambil' };
    }
    console.error('loginWithName error', error);
    return { success: false, error: error.message || String(error) };
  }
}

function subscribeNames(onChange) {
  const col = collection(db, 'names');
  return onSnapshot(col, (snap) => {
    const data = {};
    snap.forEach(d => data[d.id] = d.data());
    onChange(data);
  }, (err) => {
    console.error('subscribeNames error', err);
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
      if (data.claimedBy && data.claimedBy === uid) {
        tx.update(nameRef, { claimedBy: null, claimedAt: null });
      }
    });
  } catch (err) {
    console.error('releaseClaim error', err);
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
  } catch (err) {
    console.warn('logout: signOut failed', err);
  } finally {
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userUid');
    window.location.href = 'index.html';
  }
}

export { auth, db, loginWithName, subscribeNames, releaseClaim, logout };
