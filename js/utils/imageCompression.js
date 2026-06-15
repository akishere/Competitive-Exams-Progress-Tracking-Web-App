// ==================== IMAGE COMPRESSION ====================
// Resizes + re-encodes an image client-side before upload, the same way
// Google Drive shrinks photo backups: scale down to a max dimension and
// re-encode as JPEG at a reasonable quality, keeping the image visually
// crisp while drastically cutting file size.

function compressImage(file, options = {}) {
  const maxDimension = options.maxDimension || IMAGE_COMPRESSION.maxDimension;
  const quality = options.quality || IMAGE_COMPRESSION.quality;
  const mimeType = options.mimeType || IMAGE_COMPRESSION.mimeType;

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round(height * (maxDimension / width));
          width = maxDimension;
        } else {
          width = Math.round(width * (maxDimension / height));
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Image compression failed')),
        mimeType,
        quality
      );
    };
    img.onerror = err => { URL.revokeObjectURL(url); reject(err); };
    img.src = url;
  });
}

// Swaps a filename's extension to match the compressed output (.jpg).
function compressedFileName(filename) {
  return filename.replace(/\.[^.]+$/, '') + '.jpg';
}
