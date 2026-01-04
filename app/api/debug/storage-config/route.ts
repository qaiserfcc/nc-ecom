import { NextResponse } from "next/server"

export async function GET() {
  const blobToken = process.env.VERCEL_BLOB_TOKEN || process.env.BLOB_READ_WRITE_TOKEN
  
  const config = {
    hasVercelBlobToken: !!blobToken,
    hasAwsS3: !!(process.env.AWS_S3_BUCKET && process.env.AWS_REGION),
    storageType: blobToken
      ? 'vercel-blob' 
      : process.env.AWS_S3_BUCKET 
      ? 's3' 
      : 'local',
    environment: process.env.VERCEL_ENV || 'development',
    blobTokenFound: blobToken ? 'yes (token present)' : 'no',
  }

  return NextResponse.json(config)
}
