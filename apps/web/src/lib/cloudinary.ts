import { uploadToCloudinary } from '@groupfit/shared/utils';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && uploadPreset);
}

/**
 * Upload a File (from input) to Cloudinary. Returns secure_url or throws.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
    );
  }
  const result = await uploadToCloudinary(cloudName, uploadPreset, file);
  return result.secure_url;
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Upload an image or PDF to Cloudinary. Uses image/upload for images and raw/upload for PDFs.
 * Returns secure_url or throws.
 * Note: For PDFs the upload preset may need to allow raw files in the Cloudinary dashboard.
 */
export async function uploadImageOrPdf(file: File): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
    );
  }
  if (isPdf(file)) {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
    const formData = new FormData();
    formData.append('upload_preset', uploadPreset);
    formData.append('file', file);
    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.status} ${text}`);
    }
    const data = (await response.json()) as { secure_url?: string; error?: { message?: string } };
    if (data.error?.message) throw new Error(data.error.message);
    if (!data.secure_url) throw new Error('Cloudinary did not return a URL');
    return data.secure_url;
  }
  return uploadImage(file);
}
