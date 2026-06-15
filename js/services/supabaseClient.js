// ==================== SUPABASE CLIENT (Current Affairs screenshot storage) ====================
// Images are compressed client-side (see utils/imageCompression.js) before upload,
// so the originals never leave the browser at full size.

const supabaseClient = SUPABASE_READY ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Uploads a (compressed) screenshot and returns its public URL.
async function uploadCaFile(uid, moduleId, dateKey, blobOrFile, filename) {
  const compressed = await compressImage(blobOrFile);
  const finalName = compressedFileName(filename);
  const path = `${uid}/${moduleId}/${dateKey}/${Date.now()}_${finalName}`;

  const { error } = await supabaseClient.storage
    .from(SUPABASE_BUCKET)
    .upload(path, compressed, { contentType: IMAGE_COMPRESSION.mimeType });
  if (error) throw error;

  return supabaseClient.storage.from(SUPABASE_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function deleteCaFile(url) {
  const path = caFilePathFromUrl(url);
  if (!path) return;
  try { await supabaseClient.storage.from(SUPABASE_BUCKET).remove([path]); } catch {}
}

// Builds a URL that forces the browser to download the file (Content-Disposition: attachment)
// instead of displaying it inline.
function getCaDownloadUrl(url, filename) {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}download=${encodeURIComponent(filename || '')}`;
}

function caFilePathFromUrl(url) {
  const marker = `/object/public/${SUPABASE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
}
