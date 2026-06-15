# Exam Prep Tracker — Multi-Module Progress Tracker

A multi-file, no-build React webapp for tracking exam/job-search preparation across multiple "modules" (UPSC, MPPSC, M.Tech, Corporate Job Switch, ...), with login and realtime cloud sync via Firebase, and Current Affairs screenshot storage via Supabase.

## Features
- **Login gate** (username `admin` / password you set) — your session persists until you log out
- **Multi-module navigation** — after login, pick which prep track to work on (UPSC CSE 2027 is fully built out; MPPSC, M.Tech, and Corporate Job Switch are skeletons ready to be filled in)
- **Realtime sync** — all ticks, comments, and milestone progress are saved to Firebase Firestore. Open the app on your phone and laptop and they stay in sync automatically — no more manual export/import
- **3-layer tracking**: Completed → Revision 1 → Revision 2, per subtopic, with a comments field
- **Static vs Dynamic** topic tagging
- **Weekly milestone tracker** with task-level checkboxes
- **Current Affairs heatmap** with a daily log, notes, and screenshot uploads (compressed client-side, stored in Supabase, downloadable per month)
- **Export/Import** — still available per-module as a JSON backup or to share progress with Claude

## Project Structure

The app is plain React (`React.createElement`, no JSX) loaded via CDN `<script type="text/babel" src="...">` tags — no build step, but **a local static file server is required** (see [Run Locally](#run-locally)).

```
index.html                      # shell: CDN scripts, stylesheet link, ordered script tags
css/styles.css                  # all styling
js/
  config.js                     # Firebase + Supabase config, enums (VIEW, FILTER), constants
  main.js                       # entry point — ReactDOM.render(RootApp)
  utils/
    dateUtils.js                # date helpers (dateToKey, getDaysInRange, getMonthsInRange)
    dataKeys.js                 # getSubtopicKey
    imageCompression.js         # canvas-based image resize/compress before upload
  services/
    firebaseClient.js           # Firebase init (auth, firestore)
    supabaseClient.js           # Supabase init + screenshot upload/delete/download helpers
    legacyIdb.js                # one-time IndexedDB → Supabase migration helpers
  data/
    pyqData.js                  # PYQ_DATA — past-year questions, keyword-matched to subtopics
    upscData.js                 # SUBJECTS_DATA + MILESTONES_DATA (UPSC, fully built out)
    mppscData.js, mtechData.js, corporateData.js  # skeleton modules
    modules.js                  # MODULES registry (combines all the above)
  hooks/
    useModuleData.js            # Firestore realtime sync hook (debounced writes)
  components/
    AppHeader.js, Sidebar.js, TopicList.js, CurrentAffairsHeatmap.js,
    MilestonesView.js, ExportModal.js, TrackerApp.js   # per-module tracker UI
    AuthScreens.js, ModuleSelector.js, ModuleTracker.js, RootApp.js   # login + module routing
```

## One-Time Firebase Setup (free)

This app needs a free Firebase project for login + realtime storage. Takes about 5 minutes.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (free "Spark" plan — no credit card required).
2. **Enable Firestore**: in the left sidebar, go to *Build → Firestore Database → Create database*. Choose **Production mode** and any region.
3. **Enable Authentication**: go to *Build → Authentication → Get started → Sign-in method*, and enable the **Email/Password** provider.
4. **Create the admin user**: in *Authentication → Users → Add user*, create a user with:
   - Email: `admin@examtracker.app`
   - Password: `1234` (or any password you prefer — just remember it, since this is what you'll type into the app's login screen alongside username `admin`)

   > If you change the email here, also update the `ADMIN_EMAIL` constant in `js/config.js` to match.

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

7. **Paste the config into `js/config.js`**: open `js/config.js` and replace the placeholder values in the `firebaseConfig` object:

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

## One-Time Supabase Setup (free) — for Current Affairs screenshots

Screenshots attached to Current Affairs days are uploaded to [Supabase Storage](https://supabase.com/) (compressed client-side first, like Google Drive does for photo backups — smaller files, still clear). Takes about 5 minutes.

1. Go to [supabase.com](https://supabase.com/) and create a free project (no credit card required).
2. **Create a storage bucket**: in the left sidebar, go to *Storage → New bucket*. Name it `ca-screenshots` and toggle **Public bucket** on (so screenshot URLs can be viewed/downloaded directly).

   > If you use a different bucket name, update `SUPABASE_BUCKET` in `js/config.js` to match.

3. **Set storage policies**: this app is single-admin (gated by the Firebase login above) and uses Supabase's public **anon key** rather than Supabase Auth, so the storage bucket needs policies that allow the `anon` role to upload/delete. Go to *Storage → Policies* (or *SQL Editor*) and run:

   ```sql
   create policy "ca-screenshots anon read"
   on storage.objects for select
   to anon
   using ( bucket_id = 'ca-screenshots' );

   create policy "ca-screenshots anon upload"
   on storage.objects for insert
   to anon
   with check ( bucket_id = 'ca-screenshots' );

   create policy "ca-screenshots anon delete"
   on storage.objects for delete
   to anon
   using ( bucket_id = 'ca-screenshots' );
   ```

4. **Copy your project URL and anon key**: go to *Project Settings → API*. Copy the **Project URL** and the **anon public** key.
5. **Paste them into `js/config.js`**:

   ```js
   const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
   const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
   const SUPABASE_BUCKET = "ca-screenshots";
   ```

   The anon key is meant to be public in client-side apps (same model as the Firebase config above) — access is controlled by the storage policies in step 3, not by hiding this value.

If Supabase isn't configured yet, the rest of the app (login, progress tracking, milestones, PYQs) still works fine — only the Current Affairs screenshot upload/download will be inactive.

## Run Locally

The app is split across multiple `js/**/*.js` files loaded via `<script src="...">`, which browsers block under `file://`. Serve the folder over HTTP instead:

```bash
cd "/Users/boogyman/Dev/Competitive-Exams-Progress-Tracking-Web-App"
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Any static file server works (e.g. `npx serve`, VS Code's "Live Server" extension, etc.) — the app needs no build/compile step.

## Deploy on Netlify

1. Go to https://app.netlify.com/drop
2. Drag the **whole project folder** (containing `index.html`, `css/`, `js/`) onto the page
3. Done — log in from any device, and your progress stays in sync across all of them.

## Modules

After logging in, you'll see a module picker:

- **UPSC CSE 2027** — fully built out: 11 subjects, 200+ subtopics, 49-week milestone plan
- **MPPSC**, **M.Tech Prep**, **Corporate Job Switch** — skeleton modules with a placeholder topic and milestone week. To flesh these out:
  - Edit `js/data/mppscData.js` (and the `mtechData.js` / `corporateData.js` equivalents), following the same structure as `js/data/upscData.js`
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

### Current Affairs Screenshots

Screenshots attached to a Current Affairs day are compressed in the browser (resized to a max of 1920px and re-encoded as JPEG — same idea as Google Drive's photo backup compression, so they stay clear but take a fraction of the space) and uploaded to **Supabase Storage** at `{uid}/{moduleId}/{date}/...`. Their public URLs are saved into that day's entry in Firestore (`data["ca_day_YYYY-MM-DD"].screenshots`), so screenshots are available on every device you log in from.

Each month in the Current Affairs view has its own **⬇ Download** button that downloads every screenshot for that month as an attachment.

If you used an earlier version of this app, screenshots stored locally in the browser's IndexedDB are automatically uploaded to Supabase the first time you open the UPSC module after Supabase is set up.
