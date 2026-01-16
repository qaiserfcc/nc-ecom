import { executeQuery } from '@/lib/db';
import { generateObject } from 'ai';
import { z } from 'zod';

const socialContentSchema = z.object({
  title: z.string().min(10).max(255),
  content: z.string().min(20).max(2200),
  hashtags: z.array(z.string()).optional(),
});

type SocialContent = z.infer<typeof socialContentSchema>;

/**
 * Social media content automation worker
 * Runs scheduled automation tasks to generate and manage social content
 */

async function generateContentForProduct(
  productId: number,
  productName: string,
  productDescription: string,
  platform: 'facebook' | 'instagram' | 'both',
  contentType: string
): Promise<SocialContent> {
  const model = process.env.VERCEL_AI_MODEL || 'gpt-4-turbo';

  const prompt = `
You are a professional social media content creator specializing in ${platform} marketing for e-commerce.

Create engaging ${contentType} social media content for this product:
Product Name: ${productName}
Description: ${productDescription}

Platform Specifications:
${
  platform === 'facebook' || platform === 'both'
    ? `- Facebook: Create longer-form content (150-300 characters) that encourages discussion, saves, and shares. Include conversational elements.`
    : ''
}
${
  platform === 'instagram' || platform === 'both'
    ? `- Instagram: Create concise, visually descriptive content (80-150 characters) with emoji usage. Focus on lifestyle and aspirational benefits.`
    : ''
}

Content Type: ${contentType}
${contentType === 'promotional' ? '- Focus on sales angle, limited time offers, and immediate benefits' : ''}
${contentType === 'educational' ? '- Focus on how to use the product, features, and customer success stories' : ''}
${contentType === 'entertainment' ? '- Focus on humor, trending topics, and relatable content' : ''}

Requirements:
✓ Create authentic, engaging content that resonates with target audience
✓ Include a compelling call-to-action (CTA) - "Shop Now", "Learn More", "Tag a friend", etc.
✓ Include 5-10 relevant, trending hashtags
✓ Keep professional yet friendly tone
✓ Highlight unique benefits and value proposition
✓ Make content highly shareable and viral-worthy
✓ Use modern language and current trends
✓ Avoid generic marketing speak

Return a JSON object with:
{
  "title": "Catchy headline/title for the post (max 100 characters)",
  "content": "The main post content (platform-appropriate length)",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "cta": "The call-to-action text"
}
`;

  try {
    const result = await generateObject({
      model,
      schema: socialContentSchema,
      prompt,
      temperature: 0.8, // More creative
    });

    return result.object;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate social content');
  }
}

async function processAutomationSchedule(scheduleId: number) {
  try {
    // Get the automation schedule
    const scheduleResult = await executeQuery(
      'SELECT * FROM social_automation_schedule WHERE id = $1 AND is_active = true',
      [scheduleId]
    );

    if (!scheduleResult.length) {
      console.log(`Schedule ${scheduleId} not found or inactive`);
      return;
    }

    const schedule = scheduleResult[0];

    // Get random products to generate content for
    const productsResult = await executeQuery(
      `SELECT id, name, description FROM products 
       ORDER BY RANDOM() LIMIT $1`,
      [schedule.generate_count]
    );

    if (!productsResult.length) {
      console.log('No products found');
      return;
    }

    const platforms = schedule.selected_platforms || ['facebook', 'instagram'];
    let successCount = 0;
    let errorCount = 0;

    for (const product of productsResult) {
      for (const platform of platforms) {
        try {
          const generatedContent = await generateContentForProduct(
            product.id,
            product.name,
            product.description,
            platform,
            schedule.content_type || 'promotional'
          );

          // Insert generated content
          await executeQuery(
            `INSERT INTO social_content 
            (product_id, platform, title, content, hashtags, status, created_by)
            VALUES ($1, $2, $3, $4, $5, 'draft', $6)`,
            [
              product.id,
              platform,
              generatedContent.title,
              generatedContent.content,
              JSON.stringify(generatedContent.hashtags || []),
              schedule.created_by,
            ]
          );

          successCount++;
        } catch (error) {
          console.error(`Error generating content for product ${product.id}:`, error);
          errorCount++;
        }
      }
    }

    // Calculate next run time
    const now = new Date();
    let nextRunAt = new Date(now);

    if (schedule.frequency === 'daily') {
      nextRunAt.setDate(nextRunAt.getDate() + 1);
      if (schedule.time_of_day) {
        const [hours, minutes] = schedule.time_of_day.split(':').map(Number);
        nextRunAt.setHours(hours, minutes, 0, 0);
      } else {
        nextRunAt.setHours(8, 0, 0, 0);
      }
    } else if (schedule.frequency === 'weekly' && schedule.day_of_week !== null) {
      let daysUntilTarget = (schedule.day_of_week - now.getDay() + 7) % 7 || 7;
      nextRunAt.setDate(nextRunAt.getDate() + daysUntilTarget);
      if (schedule.time_of_day) {
        const [hours, minutes] = schedule.time_of_day.split(':').map(Number);
        nextRunAt.setHours(hours, minutes, 0, 0);
      } else {
        nextRunAt.setHours(8, 0, 0, 0);
      }
    }

    // Update schedule with run results
    await executeQuery(
      `UPDATE social_automation_schedule 
       SET last_run_at = NOW(), 
           next_run_at = $1, 
           run_count = run_count + 1,
           error_count = error_count + $2
       WHERE id = $3`,
      [nextRunAt, errorCount, scheduleId]
    );

    console.log(
      `✓ Automation schedule ${scheduleId} processed: ${successCount} posts generated, ${errorCount} errors`
    );
  } catch (error) {
    console.error('Error processing automation schedule:', error);
    
    // Update error count
    await executeQuery(
      `UPDATE social_automation_schedule 
       SET error_count = error_count + 1,
           last_error = $1
       WHERE id = $2`,
      [String(error), scheduleId]
    );
  }
}

/**
 * Main automation worker function
 * Runs periodically (every hour) to check and execute due schedules
 */
export async function runAutomationWorker() {
  try {
    console.log('🚀 Starting social media automation worker...');

    // Get all schedules that are due to run
    const dueSchedules = await executeQuery(
      `SELECT id FROM social_automation_schedule 
       WHERE is_active = true 
       AND (next_run_at IS NULL OR next_run_at <= NOW())
       ORDER BY next_run_at ASC`
    );

    if (!dueSchedules.length) {
      console.log('No schedules due to run');
      return;
    }

    console.log(`Found ${dueSchedules.length} schedules to process`);

    // Process each schedule
    for (const schedule of dueSchedules) {
      await processAutomationSchedule(schedule.id);
    }

    console.log('✓ Automation worker completed');
  } catch (error) {
    console.error('❌ Error in automation worker:', error);
  }
}

export async function generateAdContent(
  productId: number,
  adType: 'free' | 'paid' | 'boosted',
  platforms: string[],
  budget?: number
) {
  try {
    // Get product details
    const productResult = await executeQuery(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    if (!productResult.length) {
      throw new Error('Product not found');
    }

    const product = productResult[0];
    const contentType = 'promotional'; // Ads are always promotional

    for (const platform of platforms) {
      const generatedContent = await generateContentForProduct(
        product.id,
        product.name,
        product.description,
        platform as 'facebook' | 'instagram',
        contentType
      );

      // Insert ad content
      const adStartDate = new Date();
      const adEndDate = new Date();
      adEndDate.setDate(adEndDate.getDate() + 7); // Default 7-day campaign

      await executeQuery(
        `INSERT INTO social_content 
        (product_id, platform, title, content, hashtags, status, ad_type, ad_budget, ad_start_date, ad_end_date, ad_status)
        VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8, $9, 'pending')`,
        [
          product.id,
          platform,
          generatedContent.title,
          generatedContent.content,
          JSON.stringify(generatedContent.hashtags || []),
          adType,
          budget || null,
          adStartDate,
          adEndDate,
        ]
      );
    }

    console.log(`✓ Generated ${platforms.length} ad(s) for product ${productId}`);
  } catch (error) {
    console.error('Error generating ad content:', error);
    throw error;
  }
}
