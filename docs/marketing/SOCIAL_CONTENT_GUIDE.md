# Social Media Management System - Complete Guide

## Overview

The Social Media Management System is an advanced AI-powered platform that enables automatic creation, scheduling, and posting of engaging social media content directly from your product catalog. It supports Facebook and Instagram with both free and paid promotion options.

## Features

### 1. **AI-Generated Content**
- **Vercel AI Integration**: Uses GPT-4 Turbo for intelligent content generation
- **Multi-Platform Support**: Generates platform-specific content (Facebook, Instagram, or both)
- **Content Types**: 
  - Promotional (sales-focused)
  - Educational (feature/benefits-focused)
  - Entertainment (engagement-focused)
- **Smart Hashtag Generation**: Automatically generates relevant, trending hashtags

### 2. **Content Management**
- **Draft System**: Save and refine content before posting
- **Scheduling**: Schedule posts for specific dates and times
- **Bulk Generation**: Generate multiple posts at once
- **Version History**: Track all changes and revisions
- **Analytics**: Monitor likes, comments, shares, and engagement rates

### 3. **Automation Schedule**
- **Daily/Weekly Automation**: Set up recurring content generation
- **Configurable Parameters**:
  - Number of posts per run
  - Selected platforms
  - Content type preferences
  - Hashtag preferences
  - Product image inclusion
- **Smart Scheduling**: Calculate optimal posting times

### 4. **Social Account Management**
- **Multi-Account Support**: Connect multiple Facebook and Instagram accounts
- **Token Management**: Secure storage of access tokens
- **Account Status Tracking**: Monitor active/inactive accounts
- **Followers Count**: Track audience growth

### 5. **Advertising & Promotions**
- **Free Promotion**: Post on your business page without cost
- **Paid Ads**: Create sponsored content with budget allocation
- **Campaign Management**: Set start/end dates and daily budgets
- **Target Audience**: Configure demographic targeting (age groups)
- **Ad Performance**: Track ROI and campaign metrics

### 6. **Integration APIs**
- Facebook Graph API (v18.0)
- Instagram Graph API (v18.0)
- Vercel AI API
- Your internal product database

## Getting Started

### Prerequisites

1. **Environment Variables** - Add to `.env.local`:
```bash
# Vercel AI
VERCEL_AI_MODEL=gpt-4-turbo
OPENAI_API_KEY=sk_... (if using OpenAI)

# Or use Anthropic
ANTHROPIC_API_KEY=sk_... (if using Claude)

# Database
DATABASE_URL=your_neon_database_url

# Facebook/Instagram
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

2. **Database Setup**:
```bash
# Run the migration to create tables
npm run db:init
# Or manually run:
psql $DATABASE_URL < scripts/04-create-social-content-table.sql
```

3. **Install Dependencies**:
```bash
npm install ai
```

### Database Schema

#### social_content
Stores generated posts with metadata, engagement metrics, and posting status.

**Key Fields:**
- `id` - Post ID
- `product_id` - Associated product
- `platform` - 'facebook' | 'instagram' | 'both'
- `title` - Post headline
- `content` - Post body
- `hashtags` - JSON array of hashtags
- `status` - 'draft' | 'scheduled' | 'posted' | 'failed'
- `scheduled_at` - When to post
- `posted_at` - When it was posted
- `ad_type` - 'free' | 'paid' | 'boosted'
- `ad_budget` - Budget for paid ads
- `engagement_metrics` - likes, comments, shares

#### social_accounts
Stores connected Facebook and Instagram accounts.

**Key Fields:**
- `platform` - 'facebook' | 'instagram'
- `account_id` - Platform account ID
- `access_token` - API access token
- `refresh_token` - For token refresh
- `is_active` - Account status

#### social_automation_schedule
Defines recurring automation tasks.

**Key Fields:**
- `frequency` - 'daily' | 'weekly'
- `time_of_day` - Execution time
- `generate_count` - Posts per run
- `selected_platforms` - Target platforms
- `content_type` - Content style
- `next_run_at` - Next execution time

## Admin Panel Usage

### Access Social Media Dashboard
Navigate to: **Admin → Social Media**

### Generate AI Content

1. Click **"Generate AI Content"** button
2. Select a product from your catalog
3. Choose target platform(s)
4. Select content type:
   - **Promotional**: Focus on sales and benefits
   - **Educational**: Teach features and usage
   - **Entertainment**: Humor and engagement
5. Optionally schedule for a specific date/time
6. Click **"Generate Content"**

The AI will create platform-optimized content with:
- Engaging headline/title
- Body copy tailored to platform length limits
- Relevant hashtags
- Call-to-action (CTA)

### Content Editor

Once content is generated, use the **Content Editor** to:
- Edit title and body text
- Add/remove hashtags
- Preview before posting
- Switch between platforms
- Enable paid/free advertising

**Preview Modes:**
- **Instagram Preview**: Shows how content appears on Instagram feed
- **Facebook Preview**: Shows how content appears on Facebook timeline

### Post to Social Media

1. Review generated content in preview
2. Click **"Post Now"** to publish immediately
3. Or schedule for later via the scheduling interface
4. System will:
   - Post to selected platforms
   - Update database with post metadata
   - Begin tracking engagement metrics
   - Log any errors

### Manage Connected Accounts

**In the "Connected Accounts" tab:**
- View all connected Facebook and Instagram accounts
- Monitor followers count
- Activate/deactivate accounts
- Remove accounts
- Refresh tokens when needed

### Set Up Automation

**In the "Automation Schedule" tab:**

1. Click **"Create Schedule"**
2. Configure:
   - **Name** - Schedule name (e.g., "Daily Promotional")
   - **Frequency** - Daily or weekly
   - **Time** - When to generate content (e.g., 9 AM)
   - **Generate Count** - Number of posts per run (e.g., 3)
   - **Platforms** - Facebook, Instagram, or both
   - **Content Type** - Promotional, Educational, or Entertainment
   - **AI Optimization** - Enable smart content enhancement
3. Save schedule
4. System will auto-execute at specified times

### Create Paid Ads

1. Generate content as usual
2. In Content Editor, toggle **"Enable Paid Ad"**
3. Enter budget (optional - leave empty for free promotion)
4. Select target audience (age group)
5. Set campaign duration (default: 7 days)
6. Click **"Post Now"** to start campaign

**Free vs Paid:**
- **Free**: Post on your business page, no budget required
- **Paid**: Boost post with Meta's ad system, reach wider audience

### View Analytics

**In the "Analytics" tab:**
- **Total Posts**: Count of all generated posts
- **Posted**: Count of successfully posted content
- **Scheduled**: Count of scheduled posts
- **Drafts**: Count of unsaved drafts
- **Engagement Metrics**: Real-time engagement data
- **Campaign Performance**: ROI and cost metrics

## API Reference

### Generate Content
```bash
POST /api/social-content
Content-Type: application/json

{
  "productId": 1,
  "platform": "instagram",
  "action": "generate",
  "contentType": "promotional",
  "scheduleFor": "2024-01-20T09:00:00Z"
}
```

### Create Automation Schedule
```bash
POST /api/social-automation
Content-Type: application/json

{
  "name": "Daily Promotional",
  "frequency": "daily",
  "timeOfDay": "09:00",
  "generateCount": 3,
  "selectedPlatforms": ["facebook", "instagram"],
  "contentType": "promotional"
}
```

### Post to Social Media
```bash
POST /api/social-content/post
Content-Type: application/json

{
  "contentId": 123,
  "action": "post",
  "platforms": ["instagram"]
}
```

### Update Engagement Data
```bash
PUT /api/social-content/post
Content-Type: application/json

{
  "contentId": 123,
  "engagementData": {
    "likes": 150,
    "comments": 25,
    "shares": 10
  }
}
```

## AI Content Generation

### Prompt Structure

The system uses sophisticated prompts that consider:
- Product name and description
- Target platform (Facebook/Instagram)
- Content type (Promotional/Educational/Entertainment)
- Platform-specific guidelines
- Current trends and best practices

### Content Optimization

AI automatically:
- Adjusts length for platform (Instagram: 80-150 chars, Facebook: 150-300 chars)
- Generates relevant hashtags based on product and platform
- Creates compelling CTAs
- Uses appropriate tone and language
- Incorporates emojis and formatting

### Quality Assurance

Each generated post:
- Validates content length
- Ensures hashtag relevance
- Checks CTA effectiveness
- Reviews for brand consistency
- Verifies platform compliance

## Best Practices

### 1. Content Strategy
- Mix promotional, educational, and entertainment content
- Post consistently (daily automation recommended)
- Use all available platforms for maximum reach
- Leverage peak engagement times

### 2. Hashtag Strategy
- Include 5-10 relevant hashtags
- Use mix of popular and niche hashtags
- Avoid overused hashtags for better visibility
- Update hashtag strategy based on engagement

### 3. Product Selection
- Feature new and bestselling products
- Highlight seasonal items
- Showcase customer favorites
- Rotate product selection

### 4. Audience Targeting
- Use demographic targeting for paid ads
- Test different audience segments
- Analyze which demographics engage most
- Adjust targeting based on performance

### 5. Campaign Management
- Set clear budget limits for paid campaigns
- Monitor campaign performance daily
- Pause underperforming ads
- Scale successful campaigns

### 6. Engagement Monitoring
- Check comments and respond promptly
- Engage with audience comments
- Use feedback for content improvement
- Track trending topics in your industry

## Troubleshooting

### Issue: Content Generation Fails
**Solution**: 
- Check OPENAI_API_KEY or ANTHROPIC_API_KEY
- Verify Vercel AI is configured
- Check API rate limits
- Review error logs for details

### Issue: Posts Not Publishing
**Solution**:
- Verify Facebook/Instagram account is connected
- Check access tokens are valid and not expired
- Ensure account permissions are correct
- Review error messages in post status

### Issue: Automation Not Running
**Solution**:
- Verify schedule is set to active
- Check next_run_at time
- Ensure server is running
- Review automation worker logs

### Issue: Low Engagement
**Solution**:
- Optimize post timing (test different hours)
- Improve content type mix
- Use better hashtags
- Target better audience demographics
- Increase budget for paid campaigns

## Performance Tips

### Database Optimization
- Indexes created on frequently queried fields
- Regular backups configured
- Query performance monitored

### Caching Strategy
- Content cached for faster retrieval
- Engagement metrics updated hourly
- Product data cached for quick access

### Rate Limiting
- API calls rate-limited to prevent abuse
- Batch operations for efficiency
- Token refresh automated

## Security

### Token Management
- Access tokens encrypted at rest
- Tokens never exposed in logs
- Regular token refresh schedule
- Secure token storage in database

### User Permissions
- Admin-only access to social content panel
- User attribution for audit trail
- Role-based access control
- Activity logging

## Future Enhancements

Planned features:
- [ ] TikTok integration
- [ ] YouTube Shorts support
- [ ] Content calendar view
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] A/B testing framework
- [ ] Multi-language content generation
- [ ] User-generated content integration

## Support & Contact

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in the database
3. Contact development team
4. File a bug report with error details

## License

This feature is part of the NC E-commerce platform and follows the main project license.
