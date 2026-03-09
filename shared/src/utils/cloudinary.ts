/**
 * Cloudinary direct (unsigned) upload from client.
 * Use an unsigned upload preset in Cloudinary dashboard so the client can upload without API secret.
 * Works in browser (File) and React Native (asset URI).
 */

export type CloudinaryFileInput = File | { uri: string; type?: string; name?: string };

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id?: string;
  width?: number;
  height?: number;
}

/**
 * Upload an image to Cloudinary using unsigned preset.
 * @param cloudName - Your Cloudinary cloud name
 * @param uploadPreset - Unsigned upload preset name
 * @param file - Browser: File from input; RN: { uri: string (file:// or content URI), type?, name? }
 * @returns Promise with secure_url (and optionally public_id, dimensions)
 */
export async function uploadToCloudinary(
  cloudName: string,
  uploadPreset: string,
  file: CloudinaryFileInput
): Promise<CloudinaryUploadResult> {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('upload_preset', uploadPreset);

  if (file instanceof File) {
    formData.append('file', file);
  } else {
    // React Native: append with uri + type + name
    formData.append('file', {
      uri: file.uri,
      type: file.type ?? 'image/jpeg',
      name: file.name ?? 'image.jpg',
    } as unknown as Blob);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    error?: { message?: string };
  };

  if (data.error?.message) {
    throw new Error(data.error.message);
  }
  if (!data.secure_url) {
    throw new Error('Cloudinary did not return a URL');
  }

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
  };
}
