# Facebook Page Connection - Quick Reference

## 🎯 What You Need

1. **Facebook App** - Created at https://developers.facebook.com/
2. **Environment Variables** in `.env.local`:
   ```bash
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback
   ```

## 🚀 Quick Steps

### 1. Create Facebook App (5 minutes)
- Go to https://developers.facebook.com/ → My Apps → Create App
- Choose "Business" type
- Fill in app name and email
- Go to Settings → Basic → Copy App ID and App Secret

### 2. Configure Facebook Login (2 minutes)
- Products → Add Product → Facebook Login → Set Up
- Facebook Login → Settings → Valid OAuth Redirect URIs:
  ```
  http://localhost:3000/api/auth/facebook/callback
  ```
- Enable: Client OAuth Login ✅ and Web OAuth Login ✅

### 3. Request Permissions (1 minute)
- App Review → Permissions and Features → Request:
  - ✅ pages_manage_posts
  - ✅ pages_read_engagement
  - ✅ pages_show_list
  - ✅ publish_video

### 4. Add Environment Variables (1 minute)
Create/update `.env.local`:
```bash
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abc123def456...
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql://...
```

### 5. Connect Your Page (1 minute)
1. Start your app: `npm run dev`
2. Visit: http://localhost:3000/api/auth/facebook/login
3. Log in with Facebook account (must be page admin)
4. Approve permissions
5. Done! Page is connected

### 6. Test Posting (1 minute)
1. Go to: http://localhost:3000/admin/social-content
2. Select a product
3. Click "Generate Content"
4. Click "Post to Facebook" on any format
5. Check your Facebook Page!

## 🔧 API Routes Created

| Route | Purpose |
|-------|---------|
| `/api/auth/facebook/login` | Initiate OAuth login |
| `/api/auth/facebook/callback` | Handle OAuth callback |
| `/api/auth/facebook/pages` | List connected pages |
| `/api/social-content/post` | Post content to Facebook |

## 📊 Features Available

Once connected:
- ✅ Auto-post to Facebook Page
- ✅ Post images and videos
- ✅ Track engagement (likes, comments, shares)
- ✅ Schedule posts
- ✅ Multiple page support
- ✅ AI-generated content

## 🐛 Troubleshooting

**"Invalid OAuth Redirect URI"**
→ Check redirect URI matches exactly in both `.env.local` and Facebook App Settings

**"No Facebook Pages found"**
→ Make sure you're admin of at least one Facebook Business Page

**"Permission denied"**
→ Set app to Development mode in Facebook dashboard

**"Failed to connect"**
→ Check `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` are correct

## 📞 Need Help?

See detailed guide in `FACEBOOK_PAGE_SETUP_GUIDE.md`

## ⚡ Pro Tips

1. **Development Mode**: Keep app in Development mode until ready to launch
2. **Multiple Pages**: OAuth will connect ALL pages you manage
3. **Token Lifespan**: Page tokens don't expire (as long as user token is valid)
4. **Testing**: Use your own Facebook account as test user
5. **Going Live**: Submit for App Review when ready for production

---

**Total Setup Time: ~10 minutes** ⏱️
