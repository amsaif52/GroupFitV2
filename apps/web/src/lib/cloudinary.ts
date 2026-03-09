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
