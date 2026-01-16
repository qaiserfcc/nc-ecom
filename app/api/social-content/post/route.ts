import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

/**
 * API to handle posting individual format content to social media platforms
 * Supports Facebook & Instagram Graph APIs
 * Handles post, story, and reel formats
 */

async function postToFacebook(
  accountId: string,
  accessToken: string,
  content: {
    title: string;
    content: string;
    imageUrl?: string;
    link?: string;
  }
): Promise<{ id: string; url: string }> {
  try {
    // Using Facebook Graph API
    const body = {
      message: `${content.title}\n\n${content.content}`,
      link: content.link,
    };

    if (content.imageUrl) {
      body['picture'] = content.imageUrl;
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${accountId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to post to Facebook');
    }

    const data = await response.json();
    return {
      id: data.id,
      url: `https://facebook.com/${data.id}`,
    };
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

// POST - Post to social media
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, action, platforms } = body;

    if (!contentId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'post') {
      // Get the content
      const contentResult = await executeQuery(
        'SELECT * FROM social_content WHERE id = $1',
        [contentId]
      );

      if (!contentResult.length) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }

      const content = contentResult[0];

      // Get active social accounts for the platforms
      const accountsResult = await executeQuery(
        `SELECT * FROM social_accounts 
         WHERE platform = ANY($1) AND is_active = true`,
        [platforms || [content.platform]]
      );

      if (!accountsResult.length) {
        return NextResponse.json(
          { error: 'No active accounts found for posting' },
          { status: 400 }
        );
      }

      const results: any[] = [];
      let hasError = false;

      for (const account of accountsResult) {
        try {
          let postResult;

          if (account.platform === 'facebook') {
            postResult = await postToFacebook(account.account_id, account.access_token, {
              title: content.title,
              content: content.content,
              imageUrl: content.image_url,
            });
          } else if (account.platform === 'instagram') {
            postResult = await postToInstagram(account.account_id, account.access_token, {
              title: content.title,
              content: content.content,
              imageUrl: content.image_url,
              hashtags: content.hashtags ? JSON.parse(content.hashtags) : [],
            });
          }

          // Update content status to posted
          await executeQuery(
            `UPDATE social_content 
             SET status = 'posted', posted_at = NOW() 
             WHERE id = $1`,
            [contentId]
          );

          results.push({
            platform: account.platform,
            accountId: account.account_id,
            postId: postResult?.id,
            postUrl: postResult?.url,
            success: true,
          });
        } catch (error) {
          hasError = true;
          results.push({
            platform: account.platform,
            accountId: account.account_id,
            success: false,
            error: String(error),
          });

          // Update content status to failed
          await executeQuery(
            `UPDATE social_content 
             SET status = 'failed', error_message = $1 
             WHERE id = $2`,
            [String(error), contentId]
          );
        }
      }

      return NextResponse.json({
        contentId,
        results,
        hasError,
        message: hasError ? 'Some posts failed' : 'All posts published successfully',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error posting to social media:', error);
    return NextResponse.json(
      { error: 'Failed to post to social media' },
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
