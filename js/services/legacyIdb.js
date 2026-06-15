// ==================== LEGACY INDEXEDDB (one-time migration to Supabase Storage) ====================
const IDB_NAME = 'upsc_ca_screenshots';
const IDB_STORE = 'screenshots';

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = e => { e.target.result.createObjectStore(IDB_STORE); };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

async function getScreenshots(dateKey) {
  const dbh = await openIDB();
  const tx = dbh.transaction(IDB_STORE, 'readonly');
  const store = tx.objectStore(IDB_STORE);
  return new Promise(r => { const g = store.get(dateKey); g.onsuccess = () => r(g.result || []); g.onerror = () => r([]); });
}

async function getScreenshotKeys() {
  const dbh = await openIDB();
  const tx = dbh.transaction(IDB_STORE, 'readonly');
  const store = tx.objectStore(IDB_STORE);
  return new Promise(r => { const g = store.getAllKeys(); g.onsuccess = () => r(g.result || []); g.onerror = () => r([]); });
}

async function clearIDBKey(dateKey) {
  const dbh = await openIDB();
  const tx = dbh.transaction(IDB_STORE, 'readwrite');
  tx.objectStore(IDB_STORE).delete(dateKey);
  return new Promise((r,j) => { tx.oncomplete = () => r(); tx.onerror = () => j(tx.error); });
}

function dataURLToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = (header.match(/data:(.*?);base64/) || [,'image/png'])[1];
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], {type: mime});
}
