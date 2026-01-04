import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    hasVercelBlobToken: !!process.env.VERCEL_BLOB_TOKEN,
    hasAwsS3: !!(process.env.AWS_S3_BUCKET && process.env.AWS_REGION),
    storageType: process.env.VERCEL_BLOB_TOKEN 
      ? 'vercel-blob' 
      : process.env.AWS_S3_BUCKET 
      ? 's3' 
      : 'local',
    environment: process.env.VERCEL_ENV || 'development',
  }

  return NextResponse.json(config)
}
