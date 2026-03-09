'use client';

import { useRef, useState } from 'react';

import { uploadImage, isCloudinaryConfigured } from '@/lib/cloudinary';

type Props = {
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
  disabled?: boolean;
};

export function CloudinaryUploadButton({
  onUpload,
  accept = 'image/*',
  label = 'Upload image',
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUpload(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const configured = isCloudinaryConfigured();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-hidden
      />
      <button
        type="button"
        disabled={disabled || uploading || !configured}
        onClick={() => configured && inputRef.current?.click()}
        className="gf-admin-btn gf-admin-btn--secondary"
        style={{ padding: '8px 12px', fontSize: 13 }}
        title={
          !configured
            ? 'Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env to enable uploads'
            : undefined
        }
      >
        {uploading ? 'Uploading…' : label}
      </button>
      {!configured && (
        <span style={{ fontSize: 12, color: 'var(--groupfit-grey)' }}>
          Set Cloudinary env to enable
        </span>
      )}
      {error && <span style={{ fontSize: 13, color: 'var(--groupfit-error)' }}>{error}</span>}
    </div>
  );
}
