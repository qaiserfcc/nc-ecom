import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

/**
 * Facebook OAuth Callback Handler
 * Exchanges authorization code for access token and stores page tokens
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `/admin/social-content?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `/admin/social-content?error=${encodeURIComponent('No authorization code received')}`
    );
  }

  try {
    const appId = process.env.FACEBOOK_APP_ID!;
    const appSecret = process.env.FACEBOOK_APP_SECRET!;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI!;

    // Step 1: Exchange code for short-lived user access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code: code,
      })
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(error.error?.message || 'Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken,
      })
    );

    if (!longLivedResponse.ok) {
      const error = await longLivedResponse.json();
      throw new Error(error.error?.message || 'Failed to get long-lived token');
    }

    const longLivedData = await longLivedResponse.json();
    const userAccessToken = longLivedData.access_token;

    // Step 3: Get user's pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`
    );

    if (!pagesResponse.ok) {
      const error = await pagesResponse.json();
      throw new Error(error.error?.message || 'Failed to get pages');
    }

    const pagesData = await pagesResponse.json();
    const pages = pagesData.data || [];

    if (pages.length === 0) {
      return NextResponse.redirect(
        `/admin/social-content?error=${encodeURIComponent('No Facebook Pages found. Please make sure you are an admin of at least one Facebook Page.')}`
      );
    }

    // Step 4: Store page tokens in database
    let connectedCount = 0;
    for (const page of pages) {
      const pageId = page.id;
      const pageName = page.name;
      const pageAccessToken = page.access_token; // This is a long-lived page token

      // Get page details (followers count, etc.)
      const pageDetailsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=followers_count,about,category&access_token=${pageAccessToken}`
      );
      
      const pageDetails = pageDetailsResponse.ok ? await pageDetailsResponse.json() : {};

      // Store or update in social_accounts table
      await executeQuery(
        `INSERT INTO social_accounts (
          platform, account_name, account_id, access_token, 
          token_expires_at, followers_count, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (platform, account_id) 
        DO UPDATE SET 
          access_token = $4,
          token_expires_at = $5,
          followers_count = $6,
          is_active = $7,
          updated_at = NOW()`,
        [
          'facebook',
          pageName,
          pageId,
          pageAccessToken,
          null, // Page tokens don't expire if user token is valid
          pageDetails.followers_count || 0,
          true
        ]
      );

      connectedCount++;
    }

    // Redirect back to admin with success message
    return NextResponse.redirect(
      `/admin/social-content?success=${encodeURIComponent(`Successfully connected ${connectedCount} Facebook Page(s)!`)}`
    );

  } catch (error: any) {
    console.error('Facebook OAuth error:', error);
    return NextResponse.redirect(
      `/admin/social-content?error=${encodeURIComponent(error.message || 'Failed to connect Facebook Page')}`
    );
  }
}
