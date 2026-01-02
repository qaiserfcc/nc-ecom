import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Verify required environment variables
if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL not set. Some tests may fail.')
}
