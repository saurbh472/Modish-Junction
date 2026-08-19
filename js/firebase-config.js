// ============================================
// MODISH JUNCTION - FIREBASE CONFIGURATION
// File: js/firebase-config.js
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyCFbxP5Lc1mO6hBSJrpjpHDZ6tGu1UBW30",
  authDomain: "modish-junction.firebaseapp.com",
  projectId: "modish-junction",
  storageBucket: "modish-junction.firebasestorage.app",
  messagingSenderId: "452391719652",
  appId: "1:452391719652:web:29a21cebd91d957e2352f1",
  measurementId: "G-8RV3F7N50L"
};

let db = null;
let firebaseApp = null;

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps || !firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }
    db = firebase.firestore();
    window.db = db;
    console.log("✅ Firebase Firestore initialized for Modish Junction!");
  } else {
    console.warn("⚠️ Firebase SDK not loaded yet.");
  }
} catch (err) {
  console.error("❌ Firebase init error:", err);
}
