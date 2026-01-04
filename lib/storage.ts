/**
 * Storage abstraction layer
 * Supports multiple storage backends:
 * - Local filesystem (development)
 * - AWS S3 (production)
 * - Vercel Blob (alternative production)
 */

export interface StorageConfig {
  type: 'local' | 's3' | 'vercel-blob'
  local?: {
    uploadDir: string
  }
  s3?: {
    region: string
    bucket: string
    accessKeyId: string
    secretAccessKey: string
  }
  vercelBlob?: {
    token: string
  }
}

export interface UploadResult {
  url: string
  path: string
  size: number
}

class StorageProvider {
  private config: StorageConfig

  constructor(config: StorageConfig) {
    this.config = config
  }

  private getConfig(): StorageConfig {
    // Auto-detect storage type based on environment variables
    if (process.env.AWS_S3_BUCKET && process.env.AWS_REGION) {
      console.log('[Storage] Detected AWS S3 configuration')
      return {
        type: 's3',
        s3: {
          region: process.env.AWS_REGION,
          bucket: process.env.AWS_S3_BUCKET,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      }
    }

    if (process.env.VERCEL_BLOB_TOKEN) {
      console.log('[Storage] Detected Vercel Blob configuration')
      return {
        type: 'vercel-blob',
        vercelBlob: {
          token: process.env.VERCEL_BLOB_TOKEN,
        },
      }
    }

    // Default to local storage
    console.log('[Storage] Using local filesystem storage')
    return {
      type: 'local',
      local: {
        uploadDir: process.env.UPLOAD_DIR || './public/uploads',
      },
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string = 'application/octet-stream'
  ): Promise<UploadResult> {
    const config = this.getConfig()

    // Log which storage backend is being used (helpful for debugging)
    console.log(`[Storage] Using ${config.type} storage for file: ${filename}`)

    switch (config.type) {
      case 's3':
        return this.uploadToS3(buffer, filename, mimeType)
      case 'vercel-blob':
        return this.uploadToVercelBlob(buffer, filename, mimeType)
      case 'local':
      default:
        return this.uploadToLocal(buffer, filename)
    }
  }

  private async uploadToLocal(buffer: Buffer, filename: string): Promise<UploadResult> {
    const { promises: fs } = await import('fs')
    const path = await import('path')

    const config = this.getConfig()
    if (!config.local) throw new Error('Local storage config missing')

    const uploadDir = config.local.uploadDir
    try {
      await fs.mkdir(uploadDir, { recursive: true })
    } catch {
      // Directory might already exist
    }

    const filepath = path.join(uploadDir, filename)
    await fs.writeFile(filepath, buffer)

    return {
      url: `/uploads/${filename}`,
      path: filepath,
      size: buffer.length,
    }
  }

  private async uploadToS3(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<UploadResult> {
    const config = this.getConfig()
    if (!config.s3) throw new Error('S3 config missing')

    // Dynamically import AWS SDK v3 to avoid issues in non-S3 environments
    let S3Client, PutObjectCommand
    try {
      const awsModule = await import('@aws-sdk/client-s3')
      S3Client = awsModule.S3Client
      PutObjectCommand = awsModule.PutObjectCommand
    } catch (error) {
      throw new Error(
        'AWS SDK not installed. Run: npm install @aws-sdk/client-s3\n' +
        'Or switch to Vercel Blob storage by setting VERCEL_BLOB_TOKEN environment variable'
      )
    }

    const s3Client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    })

    const key = `uploads/${filename}`

    const command = new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
    })

    await s3Client.send(command)

    const bucketRegion = config.s3.region || 'us-east-1'
    const url = `https://${config.s3.bucket}.s3.${bucketRegion}.amazonaws.com/${key}`

    return {
      url,
      path: key,
      size: buffer.length,
    }
  }

  private async uploadToVercelBlob(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<UploadResult> {
    const config = this.getConfig()
    if (!config.vercelBlob) throw new Error('Vercel Blob config missing')

    // Dynamically import Vercel Blob SDK
    const { put } = await import('@vercel/blob')

    const result = await put(`uploads/${filename}`, buffer, {
      access: 'public',
      contentType: mimeType,
    })

    return {
      url: result.url,
      path: result.pathname,
      size: buffer.length,
    }
  }
}

// Export singleton instance
let storageInstance: StorageProvider | null = null

export function getStorage(): StorageProvider {
  if (!storageInstance) {
    storageInstance = new StorageProvider({
      type: 'local', // Default, will be overridden by getConfig()
    })
  }
  return storageInstance
}

export async function uploadImageBuffer(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<UploadResult> {
  return getStorage().uploadBuffer(buffer, filename, mimeType)
}

// Helper to get the appropriate image URL
export function getImageUrl(storagePath: string): string {
  const config = new StorageProvider({ type: 'local' }).getConfig()

  // If it's already a full URL (from S3 or Vercel Blob), return as-is
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath
  }

  // If it's already a local path, return as-is
  if (storagePath.startsWith('/uploads/')) {
    return storagePath
  }

  // Otherwise, prepend /uploads/
  return `/uploads/${storagePath}`
}
