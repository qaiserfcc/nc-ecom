import { NextRequest, NextResponse } from 'next/server';
import { runAutomationWorker } from '@/lib/social-automation-worker';

/**
 * Cron Job Handler - Runs automation worker hourly
 * 
 * Deploy to Vercel by adding to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/social-content",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify request is from Vercel
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
      console.warn('[Social Content Cron] Unauthorized request attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Social Content Cron] Starting automation worker...');
    const startTime = Date.now();

    // Run the automation worker
    const result = await runAutomationWorker();

    const duration = Date.now() - startTime;
    console.log(`[Social Content Cron] Completed in ${duration}ms`);

    return NextResponse.json(
      {
        success: true,
        message: 'Automation worker completed successfully',
        duration: `${duration}ms`,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Social Content Cron] Error:', errorMessage);

    // Still return 200 to prevent Vercel from retrying
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

/**
 * POST endpoint for manual trigger (development/testing)
 */
export async function POST(request: NextRequest) {
  try {
    // In development, allow POST without auth
    // In production, verify secret
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      const secret = process.env.CRON_SECRET;

      if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('[Social Content Cron] Manual trigger - Starting automation worker...');
    const startTime = Date.now();

    const result = await runAutomationWorker();

    const duration = Date.now() - startTime;
    console.log(`[Social Content Cron] Manual trigger completed in ${duration}ms`);

    return NextResponse.json(
      {
        success: true,
        message: 'Automation worker triggered manually',
        duration: `${duration}ms`,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Social Content Cron] Manual trigger error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
