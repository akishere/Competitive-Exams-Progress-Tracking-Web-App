// ==================== FIREBASE CLIENT ====================
// Firebase handles login (Authentication) and realtime progress sync (Firestore).
// Screenshot storage lives in Supabase — see supabaseClient.js.

let auth = null, db = null;
if (FIREBASE_READY) {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  db.enablePersistence().catch(() => {});
}
