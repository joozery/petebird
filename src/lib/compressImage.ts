'use client';

/**
 * Downscales a photo in the browser before upload. Phone cameras produce
 * 4000px+ images that easily exceed the 5MB upload limit, so admins on
 * mobile would get "file too large" errors. SVGs/GIFs and small files are
 * passed through untouched, and any decode failure falls back to the original.
 */
export async function compressImage(file: File, maxSize = 2000, quality = 0.85): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  if (file.size <= 800 * 1024) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const toBlob = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    // WebP keeps PNG transparency; older Safari can't encode it and returns PNG instead.
    let blob = await toBlob('image/webp');
    if (!blob || blob.type !== 'image/webp') {
      if (file.type === 'image/png') return file; // don't flatten transparency into JPEG
      blob = await toBlob('image/jpeg');
    }
    if (!blob || blob.size >= file.size) return file;

    const ext = blob.type === 'image/webp' ? '.webp' : '.jpg';
    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], base + ext, { type: blob.type });
  } catch {
    return file;
  }
}
