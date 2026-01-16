import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Format-specific content schema
const formatContentSchema = z.object({
  post: z.object({
    title: z.string().optional(),
    content: z.string(),
    hashtags: z.array(z.string()).optional(),
    cta: z.string().optional(),
  }),
  story: z.object({
    title: z.string().optional(),
    content: z.string(),
    hashtags: z.array(z.string()).optional(),
    cta: z.string().optional(),
  }),
  reel: z.object({
    title: z.string(),
    content: z.string(),
    hashtags: z.array(z.string()).optional(),
    cta: z.string(),
    videoDescription: z.string(),
  }),
});

type FormatContent = z.infer<typeof formatContentSchema>;

// Generate media (placeholder - integrate with image generation service)
async function generateMediaForProduct(productName: string, format: 'image' | 'video'): Promise<{ mediaUrl: string; mediaType: string }> {
  // Placeholder for actual image/video generation
  // TODO: Integrate with:
  // - Stable Diffusion API for images
  // - D-ID or similar for video generation
  // - Or use Unsplash/Pexels API for stock images
  
  const placeholderImages: Record<string, string> = {
    'image': 'https://via.placeholder.com/1200x630?text=' + encodeURIComponent(productName),
    'video': 'https://via.placeholder.com/1280x720?text=Video+Content',
  };

  return {
    mediaUrl: placeholderImages[format],
    mediaType: format,
  };
}

// Generate format-specific content
async function generateFormatContent(
  productName: string,
  productDescription: string,
  platform: 'facebook' | 'instagram',
  contentType: 'promotional' | 'educational' | 'entertainment'
): Promise<FormatContent> {
  const modelName = process.env.OPENAI_MODEL || process.env.VERCEL_AI_MODEL || 'gpt-4o-mini';
  const model = openai(modelName);

  const platformSpecs: Record<string, Record<string, string>> = {
    facebook: {
      post: 'Posts: 150-300 characters, encourages engagement and discussion',
      story: 'Stories: 15-30 second text overlay format, urgent/timely content',
      reel: 'Reels: 15-90 second video content, highly engaging and shareable',
    },
    instagram: {
      post: 'Posts: 80-150 characters, visually descriptive with lifestyle focus',
      story: 'Stories: 15-30 second text/visual overlay format, authentic and casual',
      reel: 'Reels: 15-90 second video content, trending audio and creative cuts',
    },
  };

  const prompt = `You are a professional social media content creator specializing in ${platform} marketing.

Create engaging ${contentType} content for this product:
Product Name: ${productName}
Description: ${productDescription}

Generate THREE different formats for ${platform}:

1. POST FORMAT: ${platformSpecs[platform].post}
2. STORY FORMAT: ${platformSpecs[platform].story}
3. REEL FORMAT: ${platformSpecs[platform].reel}

For each format, provide:
- title: A catchy headline (max 100 chars, optional for story/post)
- content: The main content specific to that format
- hashtags: Relevant hashtags array (5-10 for posts, 2-3 for stories/reels)
- cta: Call to action text
- videoDescription (reel only): Brief description of video visuals

Requirements:
- Make content platform and format appropriate
- Include clear CTAs
- Use relevant, trending hashtags
- Keep tone professional yet friendly
- Focus on benefits and value proposition
- Make content shareable and engaging

Return a JSON object with three keys: post, story, reel - each containing the content for that format.`;

  try {
    const result = await generateObject({
      model,
      schema: formatContentSchema,
      prompt,
    });

    return result.object;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate social content');
  }
}

// POST - Create social content with all format variations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, action, contentType } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId' },
        { status: 400 }
      );
    }

    // Get product details
    const productResult = await executeQuery(
      'SELECT id, name, description FROM products WHERE id = $1',
      [productId]
    );

    if (!productResult.length) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productResult[0];

    if (action === 'generate') {
      // Generate content and media for both platforms
      const facebookContent = await generateFormatContent(product.name, product.description, 'facebook', contentType || 'promotional');
      const instagramContent = await generateFormatContent(product.name, product.description, 'instagram', contentType || 'promotional');

      // Generate media
      const imageMedia = await generateMediaForProduct(product.name, 'image');
      const videoMedia = await generateMediaForProduct(product.name, 'video');

      // Insert main social content record
      const contentResult = await executeQuery(
        `INSERT INTO social_content 
        (product_id, platform, title, content, hashtags, status, media_url, media_type, 
         facebook_post, facebook_story, facebook_reel,
         instagram_post, instagram_story, instagram_reel, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          productId,
          'both',
          facebookContent.post.title || instagramContent.post.title || 'Generated Content',
          facebookContent.post.content,
          JSON.stringify([...new Set([...(facebookContent.post.hashtags || []), ...(instagramContent.post.hashtags || [])])]),
          'draft',
          imageMedia.mediaUrl,
          imageMedia.mediaType,
          JSON.stringify(facebookContent.post),
          JSON.stringify(facebookContent.story),
          JSON.stringify(facebookContent.reel),
          JSON.stringify(instagramContent.post),
          JSON.stringify(instagramContent.story),
          JSON.stringify(instagramContent.reel),
          null,
        ]
      );

      const socialContentId = contentResult[0].id;

      // Insert format-specific records in social_content_formats table
      const formats = [
        { platform: 'facebook', format: 'post', content: facebookContent.post },
        { platform: 'facebook', format: 'story', content: facebookContent.story },
        { platform: 'facebook', format: 'reel', content: facebookContent.reel },
        { platform: 'instagram', format: 'post', content: instagramContent.post },
        { platform: 'instagram', format: 'story', content: instagramContent.story },
        { platform: 'instagram', format: 'reel', content: instagramContent.reel },
      ];

      for (const fmt of formats) {
        await executeQuery(
          `INSERT INTO social_content_formats 
          (social_content_id, platform, format, title, content, hashtags, cta, media_url, media_type, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            socialContentId,
            fmt.platform,
            fmt.format,
            fmt.content.title || null,
            fmt.content.content,
            JSON.stringify(fmt.content.hashtags || []),
            fmt.content.cta || null,
            fmt.format === 'reel' ? videoMedia.mediaUrl : imageMedia.mediaUrl,
            fmt.format === 'reel' ? 'video' : 'image',
            'draft',
          ]
        );
      }

      return NextResponse.json({
        ...contentResult[0],
        formats: formats.map(f => ({
          platform: f.platform,
          format: f.format,
          content: f.content,
        })),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error creating social content:', error);
    return NextResponse.json({ error: 'Failed to create social content' }, { status: 500 });
  }
}

// GET - Fetch social content with format details
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get('id');

    if (contentId) {
      // Get single content with all formats
      const content = await executeQuery(
        'SELECT * FROM social_content WHERE id = $1',
        [parseInt(contentId)]
      );

      if (!content.length) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }

      const formats = await executeQuery(
        'SELECT * FROM social_content_formats WHERE social_content_id = $1 ORDER BY platform, format',
        [parseInt(contentId)]
      );

      return NextResponse.json({
        ...content[0],
        formats,
      });
    }

    // Get list of all content
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const data = await executeQuery(
      'SELECT * FROM social_content ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await executeQuery('SELECT COUNT(*) as count FROM social_content');
    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      data,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching social content:', error);
    return NextResponse.json({ error: 'Failed to fetch social content' }, { status: 500 });
  }
}

// DELETE - Delete social content and related formats
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Delete will cascade to social_content_formats due to FK
    await executeQuery('DELETE FROM social_content WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social content:', error);
    return NextResponse.json({ error: 'Failed to delete social content' }, { status: 500 });
  }
}
