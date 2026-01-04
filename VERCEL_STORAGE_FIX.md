# Vercel Production Fix: Cloud Storage Setup

## Problem
You're getting `EROFS: read-only file system` error on Vercel because the app tries to write files to `/var/task/public/uploads`, but Vercel's serverless environment has a read-only filesystem.

## Solution
The app now supports **3 storage backends**:
1. **Local Filesystem** (development)
2. **AWS S3** (production recommended)
3. **Vercel Blob Storage** (alternative)

## Setup Instructions

### Option 1: AWS S3 (Recommended for Production)

#### 1. Create S3 Bucket
```bash
aws s3 mb s3://your-ecom-uploads --region us-east-1
```

#### 2. Create IAM User with S3 Permissions
- Go to AWS IAM Console
- Create new user: `ecom-app-s3-user`
- Attach policy: `AmazonS3FullAccess` (or create custom policy for specific bucket)
- Create access keys and save:
  - Access Key ID
  - Secret Access Key

#### 3. Add Environment Variables to Vercel
In your Vercel dashboard (Project Settings → Environment Variables):

```
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-ecom-uploads
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

#### 4. Update Database URLs
If your images have `/uploads/filename` paths, they'll automatically work with S3:
- Old: `/uploads/product-1-uuid.webp`
- New: `https://your-ecom-uploads.s3.us-east-1.amazonaws.com/uploads/product-1-uuid.webp`

#### 5. Install AWS SDK (Local Development)
```bash
npm install @aws-sdk/client-s3
```

### Option 2: Vercel Blob Storage

#### 1. Enable Blob Storage
- Go to Vercel dashboard
- Project Settings → Storage → Create Database
- Select "Blob"

#### 2. Add Environment Variable
The `VERCEL_BLOB_TOKEN` is automatically set by Vercel.

#### 3. No Installation Needed
Vercel Blob is included in Next.js on Vercel.

### Option 3: Local Filesystem (Development Only)

```
UPLOAD_DIR=./public/uploads
```

**Note:** This only works locally. Don't use in production on Vercel.

## File Storage

The updated code in `lib/storage.ts`:
- ✅ Auto-detects which storage backend to use based on env vars
- ✅ Falls back to local storage if no cloud config found
- ✅ Handles all image uploads transparently
- ✅ Works with both new and existing image URLs

## Updated Files

### `lib/storage.ts` (New)
- `StorageProvider` class with multi-backend support
- `uploadImageBuffer()` function for easy uploads
- Auto-detection of storage type from environment

### `app/api/products/optimize-images/route.ts` (Updated)
- Now uses `uploadImageBuffer()` instead of `fs.writeFile()`
- Works on Vercel with any cloud storage backend
- Maintains backward compatibility with local storage

## Testing

### Local Development
```bash
npm run dev
# Uses local storage by default
# Files go to ./public/uploads/
```

### Production (Vercel)
```bash
# Make sure env vars are set in Vercel dashboard
# Deploy as normal: git push
# Image uploads now go to AWS S3 (or Vercel Blob)
```

## Database Migration

Existing images with `/uploads/` paths will:
1. Continue to work locally (resolved to `./public/uploads/`)
2. Work on Vercel with S3 if you have S3 bucket configured
3. Can be re-optimized via `/api/products/optimize-images` to get full S3 URLs

## Security Best Practices

### AWS S3
- ✅ Use IAM user with minimal permissions (S3 only)
- ✅ Enable bucket versioning for recovery
- ✅ Enable server-side encryption (AES-256)
- ✅ Block public ACL on the bucket
- ✅ Use CloudFront CDN for fast image delivery

### Vercel Blob
- ✅ Uses Vercel's infrastructure
- ✅ Automatic CDN + caching
- ✅ No extra configuration needed

## Cost Estimation

### AWS S3
- Storage: ~$0.023/GB/month
- Upload: Free
- Download: ~$0.09/GB (first 1GB/month free)

### Vercel Blob
- Storage: $0.50/month + $0.50/GB (metered)
- Included 20GB/month in Pro plan

## Troubleshooting

### Images showing as 404
- Check that environment variables are set in Vercel
- Verify S3 bucket policy allows public read (if needed)
- Check bucket name spelling

### "Access Denied" errors
- Verify AWS credentials are correct
- Check IAM user has S3 permissions
- Ensure bucket exists in specified region

### Still seeing EROFS error
- Verify env vars are properly set in Vercel dashboard
- Check that S3 or Vercel Blob config is complete
- Redeploy after adding env vars

## Rollback to Local Storage (Not Recommended)

If you need to test locally without cloud:
```bash
# Leave AWS/Vercel Blob env vars unset
# Ensure ./public/uploads/ directory exists with write permissions
npm run dev
```

---

**Next Steps:**
1. Set up AWS S3 bucket or Vercel Blob
2. Add environment variables to Vercel
3. Redeploy your app
4. Test image uploads on the admin panel

For more details, see the code in `lib/storage.ts`.
