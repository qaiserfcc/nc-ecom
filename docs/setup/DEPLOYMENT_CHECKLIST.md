# ✅ Deployment Checklist

## Pre-Deployment (Local)

- [x] Build verification
  ```bash
  npm run build  # ✅ Passed in 28.6s
  ```

- [ ] Environment variables configured
  ```bash
  # Add to .env.local:
  RESEND_API_KEY=re_xxxxxxxxxxxxx
  FROM_EMAIL=hello@ncecom.com
  FROM_NAME=NC Ecom
  CRON_SECRET=your-random-32-char-secret
  ```

- [ ] Database migrations ready
  ```bash
  # Prepared: scripts/04-marketing-features.sql
  # Tables to create: email_campaigns, email_campaign_recipients, abandoned_carts, marketing_events
  ```

## Resend Setup

- [ ] Create Resend account at https://resend.com/signup
- [ ] Generate API key at https://resend.com/api-keys
- [ ] Verify sender email at https://resend.com/emails (required for sending)
- [ ] Add verified email to `.env.local` as `FROM_EMAIL`

## Vercel Deployment

- [ ] Commit all changes
  ```bash
  git add -A
  git commit -m "feat: Resend email integration & abandoned cart cron"
  ```

- [ ] Push to main branch
  ```bash
  git push origin main
  ```

- [ ] Verify Vercel deployment succeeds
  - Check: https://vercel.com/dashboard
  - Look for green checkmark on latest deployment

- [ ] Add environment variables in Vercel
  - Project Settings → Environment Variables
  - Add: RESEND_API_KEY, FROM_EMAIL, FROM_NAME, CRON_SECRET

## Post-Deployment

- [ ] Run database migrations
  ```bash
  psql $DATABASE_URL < scripts/04-marketing-features.sql
  ```

- [ ] Test campaign sending
  ```bash
  curl -X POST https://your-domain.com/api/marketing/campaigns/test \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "subject": "Test",
      "html_content": "Hello {{name}}"
    }'
  ```

- [ ] Verify cron is scheduled
  - Vercel Dashboard → Project → Crons
  - Should see: `/api/cron/abandoned-carts` with `*/15 * * * *` schedule

- [ ] Monitor first cron run
  - Wait 15 minutes or trigger manually:
    ```bash
    curl -X GET https://your-domain.com/api/cron/abandoned-carts \
      -H "Authorization: Bearer $CRON_SECRET"
    ```

## Verification Steps

### Email Delivery
1. Send test email via `/api/marketing/campaigns/test`
2. Check inbox for email
3. Verify in Resend Dashboard: https://resend.com/emails

### Campaign Sending
1. Create campaign in admin UI
2. Add subscribers manually or via API
3. Send campaign
4. Check `email_campaign_recipients` table for delivery status
5. Verify recipients in Resend dashboard

### Abandoned Cart Recovery
1. Create pending order in database (status='pending')
2. Wait >1 hour or manually trigger cron
3. Check user inbox for reminder #1
4. Monitor recovery status in `abandoned_carts` table

## Monitoring

### Real-time
- **Resend Dashboard**: https://resend.com/emails (all sent emails)
- **Vercel Logs**: https://vercel.com/dashboard (cron execution)
- **Database**: Query `marketing_events` table for cron logs

### Daily
- Check abandoned_carts recovery rate
- Review failed email counts in email_campaign_recipients
- Monitor bounce/complaint rates in Resend

### Weekly
- Analyze cart recovery revenue
- Review campaign engagement metrics
- Check cron job success rate

## Troubleshooting

### Emails not sending?
1. Verify RESEND_API_KEY is set correctly
2. Check sender email is verified in Resend
3. Review Resend error logs: https://resend.com/emails
4. Test with `/api/marketing/campaigns/test` endpoint

### Cron not running?
1. Verify CRON_SECRET is set in Vercel
2. Check Vercel Dashboard → Crons for errors
3. Manually trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://domain/api/cron/abandoned-carts`
4. Check application logs in Vercel

### Database errors?
1. Verify migrations ran successfully
2. Check table existence: `\dt abandoned_carts` in psql
3. Verify DATABASE_URL is correct in Vercel

## Rollback Plan

If issues occur:

1. Pause cron in vercel.json (comment out abandoned-carts cron)
2. Disable email sending (set RESEND_API_KEY to empty)
3. Revert to previous deployment
4. Fix and re-deploy

## Success Indicators

✅ All indicators should be present:
- [ ] Build passed without errors
- [ ] Resend API key valid and working
- [ ] First test email received in inbox
- [ ] Cron appears in Vercel dashboard
- [ ] Database migrations completed
- [ ] First campaign sent successfully
- [ ] Abandoned cart reminder generated

---

**Status**: Ready for deployment ✅
**Build**: Passing ✅
**Type Safety**: Full TypeScript ✅
**Documentation**: Complete ✅
