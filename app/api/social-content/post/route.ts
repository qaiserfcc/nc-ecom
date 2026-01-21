import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

/**
 * API to handle posting individual format content to social media platforms
 * Supports Facebook & Instagram Graph APIs
 * Handles post, story, and reel formats
 */

async function postToFacebook(
  pageId: string,
  accessToken: string,
  format: string,
  content: {
    title?: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    hashtags?: string[];
    cta?: string;
  }
): Promise<{ id: string; url: string }> {
  try {
    let postResult;

    if (format === 'reel' || (format === 'story' && content.mediaType === 'video')) {
      // Post video (Reel or Video Story)
      const videoResponse = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/videos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_url: content.mediaUrl,
            description: `${content.title || ''}\n\n${content.content}\n\n${content.hashtags?.join(' ') || ''}`,
            access_token: accessToken,
          }),
        }
      );

      if (!videoResponse.ok) {
        const error = await videoResponse.json();
        throw new Error(error.error?.message || 'Failed to post video to Facebook');
      }

      postResult = await videoResponse.json();
      return {
        id: postResult.id,
        url: `https://facebook.com/${postResult.id}`,
      };
    } else {
      // Post photo or text (Post or Image Story)
      const message = [
        content.title,
        content.content,
        content.hashtags?.join(' '),
        content.cta,
      ]
        .filter(Boolean)
        .join('\n\n');

      const body: any = {
        message,
        access_token: accessToken,
      };

      if (content.mediaUrl && content.mediaType === 'image') {
        body.url = content.mediaUrl;
      }

      const endpoint = content.mediaUrl
        ? `https://graph.facebook.com/v18.0/${pageId}/photos`
        : `https://graph.facebook.com/v18.0/${pageId}/feed`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to post to Facebook');
      }

      postResult = await response.json();
      return {
        id: postResult.id,
        url: `https://facebook.com/${postResult.id}`,
      };
    }
  } catch (error) {
    console.error('Facebook posting error:', error);
    throw error;
  }
}

async function postToInstagram(
  accountId: string,
  accessToken: string,
  content: {
    title: string;
    content: string;
    imageUrl?: string;
    hashtags?: string[];
  }
): Promise<{ id: string; url: string }> {
  try {
    // Using Instagram Graph API
    const caption = `${content.title}\n\n${content.content}\n\n${
      content.hashtags?.join(' ') || ''
    }`;

    const response = await fetch(
      `https://graph.instagram.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: content.imageUrl,
          caption,
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create Instagram post');
    }

    const data = await response.json();

    // Publish the media
    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: data.id,
          access_token: accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      throw new Error('Failed to publish Instagram post');
    }

    const publishedData = await publishResponse.json();
    return {
      id: publishedData.id,
      url: `https://instagram.com/p/${publishedData.id}`,
    };
  } catch (error) {
    console.error('Instagram posting error:', error);
    throw error;
  }
}

// GET - Fetch post details
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      'SELECT * FROM social_content WHERE id = $1',
      [id]
    );

    if (!result.length) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// POST - Post individual format to social media
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, formatId, platform, format } = body;

    if (!contentId || !formatId || !platform || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: contentId, formatId, platform, format' },
        { status: 400 }
      );
    }

    // Get the format content
    const formatResult = await executeQuery(
      'SELECT * FROM social_content_formats WHERE id = $1 AND social_content_id = $2',
      [formatId, contentId]
    );

    if (!formatResult.rows || formatResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Format content not found' },
        { status: 404 }
      );
    }

    const formatContent = formatResult.rows[0];

    // Get active social account for the platform
    const accountResult = await executeQuery(
      `SELECT * FROM social_accounts 
       WHERE platform = $1 AND is_active = true
       LIMIT 1`,
      [platform]
    );

    if (!accountResult.rows || accountResult.rows.length === 0) {
      return NextResponse.json(
        { 
          error: `No active ${platform} account found. Please connect your ${platform} account first.`,
          needsAuth: true 
        },
        { status: 400 }
      );
    }

    const account = accountResult.rows[0];

    try {
      let postResult;

      // Parse content from JSON
      const contentData = typeof formatContent.content === 'string' 
        ? JSON.parse(formatContent.content) 
        : formatContent.content;

      if (platform === 'facebook') {
        postResult = await postToFacebook(
          account.account_id,
          account.access_token,
          formatContent.format,
          {
            title: contentData.title || formatContent.title,
            content: contentData.content,
            mediaUrl: formatContent.media_url,
            mediaType: formatContent.media_type,
            hashtags: contentData.hashtags || formatContent.hashtags,
            cta: contentData.cta,
          }
        );
      } else if (platform === 'instagram') {
        postResult = await postToInstagram(
          account.account_id,
          account.access_token,
          {
            title: contentData.title || formatContent.title,
            content: contentData.content,
            imageUrl: formatContent.media_url,
            hashtags: contentData.hashtags || formatContent.hashtags,
          }
        );
      }

      // Update format status to posted
      await executeQuery(
        `UPDATE social_content_formats 
         SET status = 'posted', 
             posted_at = NOW(),
             external_id = $1
         WHERE id = $2`,
        [postResult?.id, formatId]
      );

      return NextResponse.json({
        success: true,
        platform,
        format,
        postId: postResult?.id,
        postUrl: postResult?.url,
        message: `Successfully posted ${format} to ${platform}!`,
      });

    } catch (error: any) {
      // Update format status to failed
      await executeQuery(
        `UPDATE social_content_formats 
         SET status = 'failed', 
             error_message = $1 
         WHERE id = $2`,
        [error.message || String(error), formatId]
      );

      throw error;
    }

  } catch (error: any) {
    console.error('Error posting to social media:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to post to social media' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update posted content with analytics
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, engagementData } = body;

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const { likes, comments, shares } = engagementData || {};

    const result = await executeQuery(
      `UPDATE social_content 
       SET likes_count = $1, 
           comments_count = $2, 
           shares_count = $3,
           engagement_rate = (($1 + $2 + $3)::float / 1000 * 100)
       WHERE id = $4
       RETURNING *`,
      [likes || 0, comments || 0, shares || 0, contentId]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating engagement data:', error);
    return NextResponse.json({ error: 'Failed to update engagement data' }, { status: 500 });
  }
}
