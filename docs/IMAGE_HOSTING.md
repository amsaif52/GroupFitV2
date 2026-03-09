# Image hosting for admin assets (icons, activity types, contact icons)

Admin settings let you store **icon URLs** for activity categories, contact links, etc. To keep cost low, host images on one of these:

## Low-cost / free options

1. **Cloudflare R2**
   - S3-compatible object storage, **no egress fees**.
   - Free tier: 10 GB storage, 1M Class B ops/month.
   - Good for production: upload via API or dashboard, use the public URL in the admin.

2. **Vercel Blob** (if you deploy on Vercel)
   - Simple API, pay per GB stored and egress.
   - Free tier available; fits small apps and icons well.

3. **AWS S3 + CloudFront**
   - S3 for storage; CloudFront CDN reduces egress cost and speeds up delivery.
   - Free tier: 5 GB S3, 50 GB CloudFront egress for 12 months.

4. **Imgix / Cloudinary** (image CDNs)
   - Optional resizing/optimization; free tiers available.
   - Paste the CDN URL into the admin “Icon URL” field.

## Flow today

- Admin enters a **URL** (e.g. `https://your-bucket.r2.dev/icons/cardio.png`) in Activity Type or Contact Us.
- No file upload in the app yet: upload images to your chosen provider, then paste the public URL.

## Adding upload later

To support “Attach icon” file upload, you’d add an API that accepts a file, uploads it to R2/S3/Vercel Blob, and returns the public URL for the admin to save.
