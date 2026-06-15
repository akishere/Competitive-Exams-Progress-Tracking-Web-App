# Exam Prep Tracker — Multi-Module Progress Tracker

A self-contained single-file webapp for tracking exam/job-search preparation across multiple "modules" (UPSC, MPPSC, M.Tech, Corporate Job Switch, ...), with login and realtime cloud sync via Firebase.

## Features
- **Login gate** (username `admin` / password you set) — your session persists until you log out
- **Multi-module navigation** — after login, pick which prep track to work on (UPSC CSE 2027 is fully built out; MPPSC, M.Tech, and Corporate Job Switch are skeletons ready to be filled in)
- **Realtime sync** — all ticks, comments, and milestone progress are saved to Firebase Firestore. Open the app on your phone and laptop and they stay in sync automatically — no more manual export/import
- **3-layer tracking**: Completed → Revision 1 → Revision 2, per subtopic, with a comments field
- **Static vs Dynamic** topic tagging
- **Weekly milestone tracker** with task-level checkboxes
- **Export/Import** — still available per-module as a JSON backup or to share progress with Claude

## One-Time Firebase Setup (free)

This app needs a free Firebase project for login + realtime storage. Takes about 5 minutes.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (free "Spark" plan — no credit card required).
2. **Enable Firestore**: in the left sidebar, go to *Build → Firestore Database → Create database*. Choose **Production mode** and any region.
3. **Enable Authentication**: go to *Build → Authentication → Get started → Sign-in method*, and enable the **Email/Password** provider.
4. **Create the admin user**: in *Authentication → Users → Add user*, create a user with:
   - Email: `admin@examtracker.app`
   - Password: `1234` (or any password you prefer — just remember it, since this is what you'll type into the app's login screen alongside username `admin`)

   > If you change the email here, also update the `ADMIN_EMAIL` constant near the top of `index.html` to match.

5. **Set Firestore security rules**: go to *Firestore Database → Rules* and replace the contents with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

   This ensures only your logged-in admin account can read/write its own data.

6. **Copy your web app config**: go to *Project settings (gear icon) → General → Your apps → Add app → Web (</> icon)*. Register the app (no need for Firebase Hosting). Copy the `firebaseConfig` object it gives you.

7. **Paste the config into `index.html`**: open `index.html`, find the `firebaseConfig` object near the top of the `<script type="text/babel">` block, and replace the placeholder values:

   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

   It's normal and safe for this config to be committed/public — Firebase web app configs aren't secrets. Your data is protected by the Authentication + Firestore rules from steps 3–5, not by hiding these values.

That's it — open `index.html`, log in with `admin` / your chosen password, and your progress will sync to Firestore in realtime.

## Run Locally

Just open `index.html` in any modern browser:

```bash
cd "/Users/boogyman/Dev/Competitive-Exams-Progress-Tracking-Web-App"
open index.html          # macOS
```

## Deploy on Netlify

1. Go to https://app.netlify.com/drop
2. Drag the folder containing `index.html` onto the page
3. Done — log in from any device with the Firebase-configured `index.html`, and your progress stays in sync across all of them.

## Modules

After logging in, you'll see a module picker:

- **UPSC CSE 2027** — fully built out: 11 subjects, 200+ subtopics, 49-week milestone plan
- **MPPSC**, **M.Tech Prep**, **Corporate Job Switch** — skeleton modules with a placeholder topic and milestone week. To flesh these out:
  - Edit `MPPSC_SUBJECTS` / `MPPSC_MILESTONES` (and the `MTECH_*` / `CORPORATE_*` equivalents) near the bottom of `index.html`, following the same structure as `SUBJECTS_DATA` / `MILESTONES_DATA`
  - Or just describe what you want to Claude and ask it to build out that module's syllabus and weekly plan

Each module's progress is stored independently in Firestore under `users/{your-uid}/modules/{moduleId}`.

## Sharing Progress with Claude

When you want Claude to analyze your progress or adjust milestones:
1. Open the module you want to discuss
2. Click **💾 Export / Import**
3. Copy the JSON and paste it into your Claude conversation

## Data Storage

All progress is stored in Firestore under `users/{uid}/modules/{moduleId}`, with documents shaped as:

```json
{ "data": { "...subtopic progress..." }, "milestones": { "...weekly task progress..." }, "updatedAt": "..." }
```

If you have existing progress from the old localStorage-only version (keys `upsc_tracker_v2` / `upsc_milestones_v2`), it will be automatically migrated into Firestore the first time you open the UPSC module after logging in.
