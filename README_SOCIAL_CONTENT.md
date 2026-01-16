# 🎯 Social Content AI Management System

Complete AI-powered social media content management solution with Vercel AI integration, multi-platform posting (Facebook & Instagram), automated scheduling, and advanced analytics.

**Status**: ✅ Production-Ready | **Last Updated**: 2024

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                          │
│  /admin/social-content (4 tabs: Content, Accounts, etc)    │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
    ┌────────────────────────────────────────────┐
    │         API LAYER (4 Routes)               │
    │  • Content (CRUD + AI Generation)          │
    │  • Accounts (OAuth + Token Management)     │
    │  • Automation (Scheduling & Triggers)      │
    │  • Social Posting (Graph API Integration)  │
    └────────────────────────────────────────────┘
        │         │         │
        ▼         ▼         ▼
    ┌────────────────────────────────────────────┐
    │      DATABASE LAYER (PostgreSQL)           │
    │  • social_content (2M+ rows potential)     │
    │  • social_accounts (multi-platform)        │
    │  • social_automation_schedule              │
    │  • Indexes, Triggers, Full-text Search     │
    └────────────────────────────────────────────┘
        │         │         │
        ▼         ▼         ▼
    ┌────────────────────────────────────────────┐
    │    EXTERNAL SERVICES                       │
    │  • Vercel AI (GPT-4 Turbo)                │
    │  • Facebook Graph API v18.0                │
    │  • Instagram Graph API v18.0               │
    └────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1️⃣ Prerequisites
```bash
# Verify Node.js version
node -v  # v18+

# Check npm
npm -v
```

### 2️⃣ Configuration
```bash
# Copy environment template
cp .env.social-content.example .env.local

# Edit with your credentials
# Required:
# - OPENAI_API_KEY (from openai.com)
# - FACEBOOK_APP_ID (from developers.facebook.com)
# - FACEBOOK_APP_SECRET
# - DATABASE_URL (PostgreSQL connection)
# - CRON_SECRET (random string)
```

### 3️⃣ Installation & Setup
```bash
# Install dependencies
npm install

# Create database tables
psql $DATABASE_URL < scripts/04-create-social-content-table.sql

# Start development server
npm run dev
```

### 4️⃣ Access Admin Panel
- Navigate to: `http://localhost:3000/admin/social-content`
- See "Social Media" in admin sidebar
- Start generating content! 🎉

---

## 📁 Project Structure

```
External-SC/
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   └── social-content/
│   │   │       └── route.ts           # ⏰ Hourly automation trigger
│   │   ├── social-content/
│   │   │   ├── route.ts               # 📝 Content CRUD + AI Gen
│   │   │   └── post/route.ts          # 📱 Social media posting
│   │   ├── social-accounts/
│   │   │   └── route.ts               # 👤 Account management
│   │   └── social-automation/
│   │       └── route.ts               # ⏳ Schedule management
│   └── admin/
│       └── social-content/
│           └── page.tsx               # 🎨 Admin dashboard UI
├── components/
│   └── social-content-editor.tsx      # ✏️ Advanced editor
├── lib/
│   ├── social-automation-worker.ts    # 🤖 Automation engine
│   ├── social-content-utils.ts        # 🛠️ Database helpers
│   └── social-content-debug.ts        # 🐛 Testing utils
├── scripts/
│   └── 04-create-social-content-table.sql  # 🗄️ DB schema
├── .env.social-content.example        # 🔐 Environment template
├── vercel.json                        # ☁️ Vercel config
├── SOCIAL_CONTENT_GUIDE.md            # 📖 Full docs
├── SOCIAL_CONTENT_QUICKSTART.md       # 🚀 Getting started
└── README_SOCIAL_CONTENT.md           # 📋 This file
```

---

## ✨ Key Features

### 🤖 AI Content Generation
- **Smart Content Creation**: Vercel AI generates platform-optimized content
- **Structured Output**: Zod validation ensures consistent format
- **Product Intelligence**: Analyzes product descriptions for better copy
- **Multi-Platform**: Instagram vs Facebook optimized content

### 📱 Multi-Platform Support
| Platform | Character Limit | Style | Hashtags | Features |
|----------|-----------------|-------|----------|----------|
| **Instagram** | 2,200 | Hashtag-heavy, Emoji-rich | 10-30 | Stories, Reels, Carousel |
| **Facebook** | 5,000 | Narrative, CTA-focused | 5-10 | Video, Carousel, Page Posts |

### ⏰ Automation Scheduling
- **Flexible Scheduling**: Daily, weekly, custom times
- **Smart Defaults**: Optimal posting times per platform
- **Error Recovery**: Automatic retry with exponential backoff
- **Execution Tracking**: Run count, error count, last error logs
- **Next Run Calculation**: Precise scheduling with timezone support

### 💰 Advertising Features
- **Free Ads**: Organic social media posts (no budget)
- **Paid Ads**: Budget-allocated advertising campaigns
- **Target Audience**: Age group, interests, geography
- **ROI Tracking**: Monitor ad performance and spend
- **Campaign Management**: Group related ads

### 📊 Advanced Analytics
- **Engagement Metrics**: Likes, comments, shares, impressions
- **Platform Analytics**: Per-platform performance breakdown
- **Trend Analysis**: Historical engagement patterns
- **Top Performers**: Identify best-performing content
- **Content Type Analysis**: Which types generate most engagement
- **Daily Trends**: 30-day engagement trending

---

## 🎮 Admin Dashboard

### Content Tab
```
┌─ Content Management ──────────────────┐
│  [🪄 Generate] [Filter] [Sort]        │
├───────────────────────────────────────┤
│ Title          Platform  Status  Date  │
│ ─────────────────────────────────────  │
│ New Headphones  📘 Posted   2m ago     │
│ Smart Watch     📷 Draft    1h ago     │
│ USB Hub         📘 Scheduled 23h      │
│ Keyboard        📷 Failed   2d ago     │
├───────────────────────────────────────┤
│ Showing 1-50 of 245 • Next ▶          │
└───────────────────────────────────────┘
```

### Accounts Tab
```
┌─ Connected Accounts ──────────────────┐
│  [+ Connect Account]                  │
├───────────────────────────────────────┤
│ 📘 Facebook Business Page              │
│    @YourCompany • 125K followers      │
│    Connected: 3 months ago            │
│    [Toggle On/Off] [Reconnect]        │
│                                       │
│ 📷 Instagram @yourcompany             │
│    87.5K followers • 4.2% engagement  │
│    Connected: 5 weeks ago             │
│    [Toggle On/Off] [Reconnect]        │
└───────────────────────────────────────┘
```

### Automation Tab
```
┌─ Automation Schedule ─────────────────┐
│  [+ New Schedule]                     │
├───────────────────────────────────────┤
│ Type    Time    Platforms  Next Run   │
│ ─────────────────────────────────────  │
│ Daily   9:00 AM 📘📷      Today 9:00  │
│ Weekly  2:00 PM 📘        Mon 2:00 PM │
│ Daily   6:00 PM 📷        Today 6:00 PM│
├───────────────────────────────────────┤
│ Total Runs: 342 • Success Rate: 98.5% │
└───────────────────────────────────────┘
```

### Analytics Tab
```
┌─ Performance Analytics ───────────────┐
│ Metrics          This Month           │
│ ─────────────────────────────────────  │
│ Posts Generated  124                   │
│ Posts Published  118 (95%)             │
│ Total Engagement 12,450                │
│ Avg Likes        87 per post           │
│ Top Platform     📘 Facebook (65%)     │
│                                       │
│ Platform Breakdown:                   │
│ 📘 Facebook  68,450 engagement         │
│ 📷 Instagram 12,340 engagement         │
└───────────────────────────────────────┘
```

---

## 🔌 API Reference

### POST /api/social-content (Generate Content)
```bash
curl -X POST http://localhost:3000/api/social-content \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "platform": "instagram",
    "contentType": "promotional",
    "action": "generate"
  }'
```

**Response**:
```json
{
  "id": "sci_abc123",
  "contentTitle": "Premium Wireless Headphones",
  "contentBody": "Experience crystal-clear sound...",
  "hashtags": ["#headphones", "#audio", "#tech"],
  "callToAction": "Shop Now",
  "platform": "instagram",
  "status": "draft",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### POST /api/social-automation (Create Schedule)
```bash
curl -X POST http://localhost:3000/api/social-automation \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "daily",
    "timeOfDay": "09:00",
    "dayOfWeek": "monday",
    "generateCount": 3,
    "selectedPlatforms": ["instagram", "facebook"],
    "contentType": "promotional"
  }'
```

### POST /api/social-content/post (Publish Content)
```bash
curl -X POST http://localhost:3000/api/social-content/post \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "sci_abc123",
    "platforms": ["instagram", "facebook"]
  }'
```

### POST /api/cron/social-content (Manual Trigger)
```bash
curl -X POST http://localhost:3000/api/cron/social-content \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🗄️ Database Schema

### social_content
```sql
CREATE TABLE social_content (
  id                  UUID PRIMARY KEY,
  product_id          INTEGER NOT NULL,
  content_title       VARCHAR(255),
  content_body        TEXT,
  platform            VARCHAR(50),        -- instagram, facebook
  status              VARCHAR(50),        -- draft, posted, scheduled, failed
  hashtags            TEXT[],
  call_to_action      VARCHAR(255),
  engagement_estimate INTEGER,
  likes               INTEGER DEFAULT 0,
  comments            INTEGER DEFAULT 0,
  shares              INTEGER DEFAULT 0,
  impressions         INTEGER DEFAULT 0,
  ad_type             VARCHAR(50),        -- free, paid
  ad_budget           DECIMAL,
  is_paid             BOOLEAN DEFAULT false,
  error_message       TEXT,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW(),
  scheduled_at        TIMESTAMP,
  posted_at           TIMESTAMP
);

CREATE INDEX idx_social_content_status ON social_content(status);
CREATE INDEX idx_social_content_platform ON social_content(platform);
CREATE INDEX idx_social_content_created_at ON social_content(created_at DESC);
```

### social_accounts
```sql
CREATE TABLE social_accounts (
  id                UUID PRIMARY KEY,
  platform          VARCHAR(50),         -- facebook, instagram
  account_id        VARCHAR(255),        -- Platform-specific ID
  account_name      VARCHAR(255),
  display_name      VARCHAR(255),
  access_token      TEXT NOT NULL,
  refresh_token     TEXT,
  follower_count    INTEGER DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  connected_at      TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_active ON social_accounts(is_active);
```

### social_automation_schedule
```sql
CREATE TABLE social_automation_schedule (
  id                  UUID PRIMARY KEY,
  frequency           VARCHAR(50),        -- daily, weekly
  day_of_week         VARCHAR(50),        -- monday, tuesday, etc
  time_of_day         TIME NOT NULL,      -- 09:00
  generate_count      INTEGER DEFAULT 3,
  selected_platforms  TEXT[] NOT NULL,    -- [instagram, facebook]
  content_type        VARCHAR(50),        -- promotional, educational
  is_active           BOOLEAN DEFAULT true,
  next_run_at         TIMESTAMP,
  run_count           INTEGER DEFAULT 0,
  error_count         INTEGER DEFAULT 0,
  last_error          TEXT,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_automation_active ON social_automation_schedule(is_active);
CREATE INDEX idx_automation_next_run ON social_automation_schedule(next_run_at);
```

---

## 🧪 Testing

### Manual Testing with cURL

**Test 1: Generate Content**
```bash
./lib/social-content-debug.ts generateContentCurl 1 instagram promotional
```

**Test 2: Create Schedule**
```bash
./lib/social-content-debug.ts createScheduleCurl daily 09:00
```

**Test 3: Trigger Automation**
```bash
./lib/social-content-debug.ts triggerAutomationCurl $CRON_SECRET
```

### Automated Testing
```bash
npm test

# Or specific test file
npm test -- social-content.test.ts

# With coverage
npm test -- --coverage
```

### Environment Validation
```typescript
import { validateEnvironment, printEnvironmentValidation } from '@/lib/social-content-debug';

printEnvironmentValidation();
```

---

## 🚀 Deployment

### Vercel Deployment

**Step 1**: Connect repository
```bash
vercel link
```

**Step 2**: Set environment variables
```bash
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
vercel env add FACEBOOK_APP_ID
vercel env add FACEBOOK_APP_SECRET
vercel env add CRON_SECRET
```

**Step 3**: Deploy
```bash
vercel deploy
```

**Step 4**: Verify cron job
- Dashboard → Settings → Environment Variables
- Verify `vercel.json` has cron configuration
- Check Function Logs for automation execution

### Self-Hosted Deployment

**Node.js + PM2**
```bash
npm install pm2 -g

# Start app
pm2 start "npm run start" --name "social-content-app"

# Setup cron job
(crontab -l 2>/dev/null; echo "0 * * * * curl -X POST http://localhost:3000/api/cron/social-content -H 'Authorization: Bearer YOUR_CRON_SECRET'") | crontab -
```

---

## 🔐 Security

### API Key Protection
- ✅ Never commit `.env.local`
- ✅ Store in environment variables
- ✅ Rotate keys regularly
- ✅ Use least privilege access

### Database Security
- ✅ Use SSL/TLS connections
- ✅ Enable database encryption
- ✅ Regular backups
- ✅ Row-level security policies

### Social Media Tokens
- ✅ Stored encrypted in database
- ✅ Access tokens validated on use
- ✅ Refresh tokens rotated automatically
- ✅ No tokens in logs

### Rate Limiting
- ✅ API rate limits configured
- ✅ Per-user quota limits
- ✅ Burst protection
- ✅ DDoS mitigation

---

## 📊 Monitoring

### Key Metrics
```typescript
// Content generation
- Generation success rate
- Average generation time
- Tokens used per request
- Error frequency

// Social posting
- Posting success rate
- Engagement metrics
- Reach per platform
- Conversion tracking

// Automation
- Schedule execution success rate
- Average execution time
- Error recovery attempts
- Next run accuracy
```

### Logging
```typescript
import { logApiRequest, logApiResponse, logAiGeneration } from '@/lib/social-content-debug';

logApiRequest('POST', '/api/social-content', { productId: 1 });
logAiGeneration('Premium Headphones', 'instagram', true, 2450);
```

### Error Handling
```typescript
try {
  const content = await generateSocialContent(product);
} catch (error) {
  console.error('Generation failed:', error);
  await recordScheduleError(scheduleId, error.message);
  // Retry logic
}
```

---

## 🤖 AI Generation Logic

### Content Generation Flow
```
Input: Product Name, Description, Platform
  ↓
[Prompt Engineering]
  - Platform-specific instructions
  - Tone and style guidelines
  - Hashtag recommendations
  - CTA best practices
  ↓
[Vercel AI - GPT-4 Turbo]
  - generateObject() with Zod schema
  - Temperature: 0.7 (creative but consistent)
  - Max tokens: 500
  ↓
[Output Validation]
  - Schema validation
  - Character count limits
  - Hashtag count validation
  - CTA presence check
  ↓
Output: Structured Content Object
```

### Prompt Template (Instagram)
```
Generate Instagram content for:
Product: {productName}
Description: {description}

Requirements:
- Use emojis (2-4 per post)
- Include hashtags (10-30)
- Short, punchy sentences
- Call-to-action required
- Max 2,200 characters

Respond in JSON format...
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "OpenAI API Error"**
```
❌ Error: 401 Unauthorized
✅ Solution: Check OPENAI_API_KEY in .env.local
```

**Issue: "Database Connection Failed"**
```
❌ Error: ECONNREFUSED localhost:5432
✅ Solution: Verify DATABASE_URL and PostgreSQL running
```

**Issue: "Social Account Not Connected"**
```
❌ Error: Invalid OAuth token
✅ Solution: Reconnect account via admin panel
```

**Issue: "Automation Not Running"**
```
❌ Error: No scheduled tasks executed
✅ Solution: Check ENABLE_AUTOMATION_WORKER=true and verify cron
```

See `SOCIAL_CONTENT_QUICKSTART.md` for complete troubleshooting guide.

---

## 📚 Documentation

- **[Quick Start Guide](./SOCIAL_CONTENT_QUICKSTART.md)** - Setup & first steps
- **[Complete Guide](./SOCIAL_CONTENT_GUIDE.md)** - Full feature documentation
- **[API Reference](#-api-reference)** - Endpoint documentation
- **[Database Schema](#-database-schema)** - SQL structure

---

## 🎓 Learning Resources

- [Vercel AI Documentation](https://sdk.vercel.ai/)
- [OpenAI API Guide](https://platform.openai.com/docs/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 💬 Support

**For issues:**
1. Check troubleshooting section
2. Review logs: `npm run dev`
3. Verify environment variables
4. Test API manually with cURL
5. Check platform documentation

**Getting Help:**
- Review inline code comments
- Check function JSDoc
- See example implementations
- Test with debug utilities

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | ✅ Initial release with full feature set |

---

## 🎉 Features Roadmap

- [ ] Multi-language content generation
- [ ] TikTok and YouTube integration
- [ ] Advanced A/B testing
- [ ] Content calendar with drag-drop scheduling
- [ ] Team collaboration features
- [ ] Custom LLM model training
- [ ] Real-time engagement notifications
- [ ] Competitor analysis
- [ ] Influencer recommendations
- [ ] Dynamic content generation with user data

---

## 📄 License

Part of NC E-Commerce Platform - All Rights Reserved

---

**Built with ❤️ using Next.js, Vercel AI, and PostgreSQL**

*Last Updated: 2024*
