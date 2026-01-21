import { NextRequest, NextResponse } from 'next/server';

/**
 * Facebook OAuth Login Initiator
 * Redirects user to Facebook to authorize the app
 */
export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: 'Facebook credentials not configured. Please set FACEBOOK_APP_ID and FACEBOOK_REDIRECT_URI in .env.local' },
      { status: 500 }
    );
  }

  // Permissions needed for posting to pages
  const scope = [
    'pages_show_list',        // Get list of pages user manages
    'pages_read_engagement',  // Read page engagement metrics
    'pages_manage_posts',     // Create and manage posts
    'publish_video',          // Post videos (for reels)
    'business_management',    // Manage business account
  ].join(',');

  // Build Facebook OAuth URL
  const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  facebookAuthUrl.searchParams.set('client_id', appId);
  facebookAuthUrl.searchParams.set('redirect_uri', redirectUri);
  facebookAuthUrl.searchParams.set('scope', scope);
  facebookAuthUrl.searchParams.set('response_type', 'code');
  facebookAuthUrl.searchParams.set('state', generateRandomState());

  // Redirect to Facebook
  return NextResponse.redirect(facebookAuthUrl.toString());
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
