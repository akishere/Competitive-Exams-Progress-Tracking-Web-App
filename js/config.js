// ==================== APP CONFIGURATION ====================
// Central place for all environment config, enums, and tunable constants.
// See README.md for full setup steps (Firebase + Supabase).

// ---- Firebase (login + realtime progress sync via Firestore) ----
// Fill these in from Firebase Console -> Project Settings -> Your apps -> Web app config.
const firebaseConfig = {
  apiKey: "AIzaSyB5gYMoOzqH1VHy8u0y3CFLu4y5x5jSSB8",
  authDomain: "comp-exams-progress-tracking.firebaseapp.com",
  projectId: "comp-exams-progress-tracking",
  storageBucket: "comp-exams-progress-tracking.firebasestorage.app",
  messagingSenderId: "819930738889",
  appId: "1:819930738889:web:10c5760d81aceb6f919d18",
  measurementId: "G-4MQS3CBM6Q"
};

// The "admin" username maps to this fixed email for Firebase Auth.
// Create a user with this email + your chosen password in Firebase Console -> Authentication -> Users.
const ADMIN_EMAIL = "admin@examtracker.app";

const FIREBASE_READY = !!(firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_"));

// ---- Supabase (Current Affairs screenshot storage) ----
// Fill these in from Supabase Dashboard -> Project Settings -> API.
const SUPABASE_URL = "https://rxceivaednxhgeymnrsn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6-EY2Ph5FUYENN9i9nVbbw_OprdnArQ";
const SUPABASE_BUCKET = "ca-screenshots";

const SUPABASE_READY = !!(
  SUPABASE_URL && !SUPABASE_URL.startsWith("YOUR_") &&
  SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith("YOUR_")
);

// ---- Image compression (applied before screenshot upload) ----
const IMAGE_COMPRESSION = {
  maxDimension: 1920,   // longest side, in pixels
  quality: 0.8,         // JPEG quality 0-1
  mimeType: 'image/jpeg',
};

// ---- Current Affairs date range ----
const CA_START = new Date('2026-05-01');
const CA_END = new Date('2027-05-23');

// ---- UI enums ----
const VIEW = { SUBJECTS: 'subjects', MILESTONES: 'milestones' };
const FILTER = { ALL: 'all', STATIC: 'static', DYNAMIC: 'dynamic', PENDING: 'pending', DONE: 'done' };
