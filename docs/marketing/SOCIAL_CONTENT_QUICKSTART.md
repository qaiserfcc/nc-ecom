# 🚀 Social Content AI - Quick Start Guide

Complete implementation of AI-powered social media content management with Vercel AI integration.

## ✅ What's Included

- **Database**: PostgreSQL schema with 3 tables for content, accounts, and automation
- **AI Engine**: Vercel AI with GPT-4 Turbo for smart content generation
- **Admin Dashboard**: Complete UI for managing content, accounts, and automation
- **Social APIs**: Facebook & Instagram posting integration
- **Automation**: Hourly scheduler for automated content generation
- **Content Editor**: Advanced editor with preview modes and ad support

## 🎯 Quick Setup (5 minutes)

### 1. Copy Environment Template
```bash
cp .env.social-content.example .env.local
```

### 2. Fill in API Keys
Edit `.env.local` with:
- `OPENAI_API_KEY` - Get from openai.com
- `FACEBOOK_APP_ID` & `FACEBOOK_APP_SECRET` - Get from developers.facebook.com
- `CRON_SECRET` - Generate random string: `openssl rand -base64 32`

### 3. Install & Migrate
```bash
npm install
psql $DATABASE_URL < scripts/04-create-social-content-table.sql
```

### 4. Start Development
```bash
npm run dev
```

### 5. Access Admin Panel
Visit: `http://localhost:3000/admin/social-content`

---

## 📋 Complete Checklist

### Prerequisites
- [ ] Node.js 18+
- [ ] PostgreSQL database (Neon recommended)
- [ ] OpenAI account with API key
- [ ] Facebook Developer account

### Environment Setup
- [ ] Create `.env.local` file
- [ ] Add `OPENAI_API_KEY`
- [ ] Add `FACEBOOK_APP_ID`
- [ ] Add `FACEBOOK_APP_SECRET`
- [ ] Add `DATABASE_URL`
- [ ] Add `CRON_SECRET` (random string)

### Database
- [ ] Create PostgreSQL database
- [ ] Run migration: `psql $DATABASE_URL < scripts/04-create-social-content-table.sql`
- [ ] Verify tables created: `social_content`, `social_accounts`, `social_automation_schedule`
- [ ] Check indexes are created

### Dependencies
- [ ] Run `npm install`
- [ ] Verify `ai` package installed (v3.4.0+)
- [ ] Verify `openai` package available

### Admin Panel
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to `/admin/social-content`
- [ ] See "Social Media" in admin sidebar ✓
- [ ] See 4 tabs: Content, Accounts, Automation, Analytics

### Test AI Generation
- [ ] Click "Generate Content" button
- [ ] Select a product
- [ ] Choose platform (Instagram/Facebook)
- [ ] Choose type (Promotional/Educational/Engagement)
- [ ] Click Generate
- [ ] See AI-generated content ✓

### Test Content Editor
- [ ] Click on generated content to edit
- [ ] Edit text and hashtags
- [ ] Toggle Paid/Free ads
- [ ] See platform-specific preview ✓

### Test Automation
- [ ] Go to Automation tab
- [ ] Create schedule
- [ ] Set frequency (daily/weekly)
- [ ] Select products
- [ ] Choose platforms
- [ ] Save schedule
- [ ] View next run time ✓

### Test Social Posting
- [ ] Go to Accounts tab
- [ ] Connect Facebook account (OAuth flow)
- [ ] Connect Instagram account
- [ ] See connected accounts with status

### Deploy to Vercel
- [ ] Push code to GitHub
- [ ] Import repo in Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy
- [ ] Verify cron job configured (hourly automation)
- [ ] Monitor logs in Vercel dashboard

---

## 📁 File Structure

```
app/
  api/
    cron/
      social-content/
        route.ts              # Hourly automation trigger
    social-content/
      route.ts                # Content CRUD & AI generation
      post/route.ts           # Post to social media
    social-accounts/
      route.ts                # Account management
    social-automation/
      route.ts                # Schedule automation
  admin/
    social-content/
      page.tsx                # Admin dashboard
components/
  social-content-editor.tsx   # Content editor UI
lib/
  social-automation-worker.ts # Automation logic
scripts/
  04-create-social-content-table.sql  # Database schema
public/
  .env.social-content.example # Environment template
vercel.json                   # Vercel deployment config
```

---

## 🔑 Key Features

### AI Content Generation
```typescript
// Automatically generates optimized content for each platform
- Title (per platform)
- Content body
- Hashtags (10-30 per platform)
- Call-to-action (optional)
- Engagement metrics estimates
```

### Multi-Platform Support
- **Instagram**: 2,200 character limit, hashtag focused
- **Facebook**: 5,000 character limit, narrative style
- **Both**: Emoji optimization, tone adaptation

### Automation Scheduling
- Daily or weekly generation
- Specific time selection
- Multiple platforms at once
- Product rotation (random selection)
- Next run calculation
- Error tracking and retry logic

### Paid & Free Advertising
- Toggle paid/free mode
- Budget allocation
- Target audience (age groups)
- Campaign performance tracking

### Analytics Dashboard
- Total posts generated
- Posts published
- Engagement rates
- Platform distribution
- Revenue from ads
- Top performing content

---

## 🧪 Testing

### Manual Testing
```bash
# Test AI generation
curl -X POST http://localhost:3000/api/social-content \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "platform": "instagram",
    "contentType": "promotional",
    "action": "generate"
  }'

# Test automation schedule
curl -X POST http://localhost:3000/api/social-automation \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "daily",
    "timeOfDay": "09:00",
    "generateCount": 3,
    "selectedPlatforms": ["instagram", "facebook"],
    "contentType": "promotional"
  }'

# Manually trigger cron job
curl -X POST http://localhost:3000/api/cron/social-content \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Unit Tests
```bash
# Add test files:
# app/api/social-content/__tests__/route.test.ts
# lib/__tests__/social-automation-worker.test.ts

npm test
```

---

## 🔒 Security Checklist

- [ ] API keys in `.env.local` (never commit)
- [ ] Database URL has SSL mode enabled
- [ ] CRON_SECRET is strong and random
- [ ] Social tokens stored in database (never in code)
- [ ] Implement rate limiting on API routes
- [ ] Validate all user inputs
- [ ] Sanitize content before posting
- [ ] Monitor for abuse/spam
- [ ] Regular backups of database
- [ ] Log all automation runs

---

## 🚨 Troubleshooting

### OpenAI API Errors
**Problem**: `401 Unauthorized`
**Solution**: 
- Verify API key in `.env.local`
- Check key hasn't expired
- Ensure account has credit

**Problem**: `429 Rate Limit`
**Solution**:
- Wait before retrying
- Upgrade OpenAI plan if needed
- Implement request queuing

### Database Connection Issues
**Problem**: `ECONNREFUSED`
**Solution**:
- Verify `DATABASE_URL` is correct
- Check network connectivity
- Ensure PostgreSQL is running

**Problem**: `relation "social_content" does not exist`
**Solution**:
- Run migration: `psql $DATABASE_URL < scripts/04-create-social-content-table.sql`
- Check if schema was created: `\dt` in psql

### Facebook Authentication
**Problem**: `Invalid OAuth request`
**Solution**:
- Verify App ID and Secret
- Check redirect URI matches exactly
- Ensure Facebook Login product enabled

### Automation Not Running
**Problem**: Schedules not executing
**Solution**:
- Check `ENABLE_AUTOMATION_WORKER=true`
- Verify cron job configured
- Check logs: `npm run dev` terminal
- Manually trigger: POST `/api/cron/social-content`

---

## 📊 Monitoring

### Key Metrics to Track
- Content generation success rate
- Average generation time
- Social posting success rate
- Engagement metrics
- API error rates
- Database query performance
- Token usage (OpenAI)

### Recommended Monitoring Tools
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Performance monitoring
- **Vercel Analytics**: Built-in deployment metrics

### Logs to Review
```bash
# Development
npm run dev  # Check terminal for logs

# Production (Vercel)
# Dashboard > Deployments > Function Logs
# Or: vercel logs --tail
```

---

## 🔄 Workflow Example

1. **Admin creates automation schedule**
   - Frequency: Daily at 9 AM
   - Platforms: Instagram + Facebook
   - Products: All (random selection)
   - Type: Promotional

2. **Automation worker runs hourly** (via cron)
   - Checks all schedules
   - Finds "daily at 9 AM" is due
   - Generates content for 3 random products
   - Creates Instagram and Facebook versions

3. **AI generates optimized content**
   - Instagram: Short, hashtag-heavy, emoji-rich
   - Facebook: Longer narrative, CTA-focused
   - Both: Product benefits highlighted

4. **Content saved to database**
   - Status: `draft`
   - Platforms: instagram, facebook
   - Generated at: timestamp
   - Engagement metrics: estimated

5. **Admin reviews (optional)**
   - Can edit content
   - Can toggle platforms
   - Can adjust hashtags
   - Can enable paid advertising

6. **Content posted**
   - Posts to connected accounts
   - Status updates to `posted`
   - Tracks engagement metrics
   - Stores post IDs for analytics

7. **Analytics tracked**
   - Engagement rates
   - Reach metrics
   - Conversion tracking
   - ROI calculation

---

## 📚 Additional Resources

- [Vercel AI Documentation](https://sdk.vercel.ai/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🎓 Next Steps

1. ✅ Complete setup checklist
2. ✅ Test all features in admin panel
3. ✅ Configure social account connections
4. ✅ Create automation schedules
5. ✅ Monitor first week of automation
6. ✅ Gather analytics
7. ✅ Optimize prompts based on engagement
8. ✅ Deploy to production
9. ✅ Set up monitoring and alerts
10. ✅ Plan future enhancements

---

## 💡 Tips & Best Practices

### AI Generation Tips
- More specific product descriptions = better content
- Test different content types for engagement
- Mix promotional with educational content
- Use platform-specific hashtags
- A/B test different styles

### Automation Best Practices
- Start with 1-2 posts/day to test
- Gradually increase posting frequency
- Monitor engagement metrics
- Adjust schedule based on audience activity
- Don't auto-post controversial content

### Platform Optimization
- Instagram: 9-10 AM optimal posting time
- Facebook: 1-3 PM optimal posting time
- Tuesday-Thursday best engagement days
- Video content outperforms static images

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review logs in Vercel dashboard
3. Consult API documentation
4. Test manually with curl commands
5. Check social media platform documentation

---

**Happy generating! 🎉**
