import { supabase } from './supabase';

/** ضغط الصورة في المتصفح قبل الرفع: تصغير + WebP/JPEG بجودة 0.82 */
export async function compressImage(file: File, maxDim = 1200): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('تعذر ضغط الصورة');
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.82));
  if (!blob) throw new Error('تعذر ضغط الصورة');
  return blob;
}

/** رفع صورة مضغوطة إلى Supabase Storage وإرجاع الرابط العام */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const blob = await compressImage(file);
  const ext = 'webp';
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('menu-media').upload(name, blob, {
    contentType: 'image/webp',
    upsert: false,
    cacheControl: '3600',
  });
  if (error) throw error;
  const { data } = supabase.storage.from('menu-media').getPublicUrl(name);
  return data.publicUrl;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
