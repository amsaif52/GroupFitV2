# Profile picture storage (design)

When implementing profile picture uploads, use **object storage with direct upload** to keep cost and API load low.

## Recommended: Cloudflare R2 or Backblaze B2

- **Cloudflare R2:** S3-compatible, **no egress fees**, ~$0.015/GB/month. Free tier: 10 GB storage, 1M Class A ops/month. Best default choice.
- **Backblaze B2:** Very cheap storage; use with Cloudflare for free egress if needed. S3-compatible API.

Store only the **file URL** in the database; do not stream file bytes through the API.

## Flow

1. **Client** requests an upload URL (e.g. `POST /auth/profile/upload-avatar` or reuse/extend `fileUpload`).
2. **API** (Nest):
   - Authenticates the user (JWT).
   - Generates a **presigned PUT or POST URL** for a path like `avatars/{userId}/{uuid}.jpg` in the bucket.
   - Returns `{ uploadUrl, publicUrl }` to the client (e.g. expiry 5–15 minutes).
3. **Client** uploads the image **directly to R2/B2** using the presigned URL (no file through your API).
4. **Client** calls the API to **save the profile image URL** (e.g. `PATCH /auth/profile` with `profileImageUrl: publicUrl`). Optionally the API can confirm the object exists in the bucket before saving.

## Schema

Add to `User` in Prisma when implementing:

- `profileImageUrl String? @map("profile_image_url")` — full URL to the image in R2/B2 (or via CDN).

Expose this in the auth profile / JWT payload and in any user-detail responses so web and RN can show the avatar.

## Implementation notes

- **Existing stub:** `customer/fileUpload` and `trainer/fileUpload` currently return `{ profilepath: '', filecode: '' }`. Replace or add:
  - An endpoint that returns a presigned URL for avatar upload, and
  - An endpoint (or existing profile update) to set `User.profileImageUrl` after upload.
- **Validation:** Limit file type (e.g. image/jpeg, image/png) and size (e.g. 2–5 MB) in the presigned URL path or in a separate validation step.
- **CDN:** Serve images via a custom domain or R2 public URL; optionally put Cloudflare (or similar) in front for caching.

## Env (when implemented)

- R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and optionally `R2_PUBLIC_URL` (base URL for saved image links).
- B2: B2 key id/secret and bucket name; use S3-compatible client with B2 endpoint.

No secrets or file bytes need to be sent to the client; only short-lived presigned URLs.
