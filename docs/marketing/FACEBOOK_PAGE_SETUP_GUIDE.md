# Facebook Page Connection - Complete Step-by-Step Guide

## Overview
This guide will walk you through connecting your Facebook Business Page to enable automatic posting of AI-generated social content.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ A Facebook Business Page (not personal profile)
- ✅ Admin access to the Facebook Page
- ✅ A Facebook Developer Account
- ✅ Node.js and npm installed
- ✅ Your application running locally or deployed

---

## 🚀 Step 1: Create Facebook App

### 1.1 Go to Facebook Developers
1. Visit [https://developers.facebook.com/](https://developers.facebook.com/)
2. Click **"My Apps"** in top right corner
3. Click **"Create App"**

### 1.2 Choose App Type
1. Select **"Business"** as app type
2. Click **"Next"**

### 1.3 Configure Basic App Info
1. **Display Name**: `Your Business Name Social Manager` (e.g., "NC Ecom Social Manager")
2. **App Contact Email**: Your business email
3. **Business Account**: Select or create a Meta Business Account
4. Click **"Create App"**

### 1.4 Complete Security Check
1. Complete the CAPTCHA verification
2. Click **"Submit"**

---

## 🔑 Step 2: Get App Credentials

### 2.1 Get App ID and Secret
1. In your app dashboard, go to **Settings** → **Basic**
2. Copy your **App ID** (you'll need this)
3. Click **"Show"** next to **App Secret**
4. Enter your Facebook password to reveal it
5. Copy your **App Secret** (keep this secret!)

### 2.2 Configure App Domain
1. Still in **Settings** → **Basic**, scroll down to **App Domains**
2. Add your domains:
   - For local development: `localhost`
   - For production: `yourdomain.com` (without https://)

### 2.3 Set Privacy Policy URL (Required)
1. Add your Privacy Policy URL (e.g., `https://yourdomain.com/privacy`)
2. Add your Terms of Service URL (optional)
3. Click **"Save Changes"**

---

## 🔐 Step 3: Configure Facebook Login

### 3.1 Add Facebook Login Product
1. In left sidebar, find **"Products"** section
2. Find **"Facebook Login"** and click **"Set Up"**
3. Choose **"Web"** platform
4. Click **"Next"**

### 3.2 Configure OAuth Redirect URIs
1. Go to **Facebook Login** → **Settings**
2. In **Valid OAuth Redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/facebook/callback
   ```
3. For production, also add:
   ```
   https://yourdomain.com/api/auth/facebook/callback
   ```
4. Click **"Save Changes"**

### 3.3 Configure Client OAuth Settings
1. In same page, enable:
   - ✅ **Client OAuth Login**: ON
   - ✅ **Web OAuth Login**: ON
2. Click **"Save Changes"**

---

## 📱 Step 4: Add Pages API Permission

### 4.1 Add Facebook Pages Product
1. In left sidebar, under **Products**, click **"Add Products"**
2. Find **"Facebook Pages"** and click **"Set Up"**

### 4.2 Request Permissions
1. Go to **App Review** → **Permissions and Features**
2. Request these permissions:
   - ✅ **pages_manage_posts** - Required to post to your page
   - ✅ **pages_read_engagement** - Required to read post metrics
   - ✅ **pages_show_list** - Required to get list of pages
   - ✅ **publish_video** - Required to post videos (for reels)

**Note**: For development, these work immediately. For production, you'll need app review.

---

## ⚙️ Step 5: Configure Your Application

### 5.1 Update Environment Variables
1. Open your `.env.local` file (create if doesn't exist)
2. Add these variables:

```bash
# Facebook Configuration
FACEBOOK_APP_ID=your_app_id_from_step_2
FACEBOOK_APP_SECRET=your_app_secret_from_step_2

# For local development
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback

# For production (uncomment and update when deploying)
# FACEBOOK_REDIRECT_URI=https://yourdomain.com/api/auth/facebook/callback

# OpenAI for content generation
OPENAI_API_KEY=sk-proj-your_openai_key_here

# Database
DATABASE_URL=your_postgresql_connection_string
```

### 5.2 Create Facebook Auth API Routes

Your application needs these API endpoints (I'll create them for you in the next step):

1. **Login Route**: `/api/auth/facebook/login` - Initiates OAuth flow
2. **Callback Route**: `/api/auth/facebook/callback` - Handles OAuth callback
3. **Pages Route**: `/api/auth/facebook/pages` - Gets user's pages
4. **Post Route**: `/api/social-content/post` - Posts content to Facebook

---

## 🧪 Step 6: Test the Connection (Development Mode)

### 6.1 Add Test Users
1. In Facebook App dashboard, go to **Roles** → **Test Users**
2. Or use your own Facebook account (recommended)
3. Make sure your Facebook account is admin of the business page

### 6.2 Set App to Development Mode
1. In app dashboard, toggle **App Mode** to **"Development"**
2. This allows testing without app review

### 6.3 Test OAuth Flow
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/api/auth/facebook/login`

3. You should see Facebook login screen

4. Log in with your Facebook account (must be admin of the page)

5. Grant permissions when prompted

6. You'll be redirected back to your callback URL with an access token

---

## 📄 Step 7: Get Page Access Token

### 7.1 Exchange User Token for Page Token
After OAuth login, you need to:
1. Get the user access token (short-lived)
2. Exchange it for a long-lived user token
3. Get the user's pages
4. Get the page access token (can be permanent)

The API routes I'll create will handle this automatically.

### 7.2 Store Page Token
Your app will store:
- Page ID
- Page Access Token (encrypted)
- Token expiration date
- Page name and followers count

---

## 🚀 Step 8: Post Your First Content

### 8.1 Generate Content
1. Go to your admin panel: `http://localhost:3000/admin/social-content`
2. Select a product
3. Choose **Facebook** as platform
4. Click **"Generate Content"**
5. AI will create post, story, and reel formats

### 8.2 Post to Facebook
1. Review the generated content
2. Click **"Post to Facebook"** on the desired format
3. The system will:
   - Use your stored page access token
   - Upload the image/video
   - Create the post with your content
   - Return post ID and metrics

### 8.3 Verify on Facebook
1. Visit your Facebook Page
2. You should see the new post
3. Engagement metrics will sync back to your dashboard

---

## 🔄 Step 9: Refresh Long-Lived Tokens

Page access tokens can expire. To keep them fresh:

### 9.1 Set Up Token Refresh
1. Facebook user tokens expire in 60 days
2. Page tokens don't expire if the user token is valid
3. Implement a refresh mechanism to exchange tokens before expiry

### 9.2 Monitor Token Health
- Check token expiration dates in your database
- Send alerts when tokens are close to expiring
- Re-authenticate users when needed

---

## 🌐 Step 10: Go Live (Production)

### 10.1 Switch to Live Mode
1. In Facebook App dashboard, complete **App Review**
2. Submit your app for review with:
   - Privacy Policy URL
   - App Icon (1024x1024px)
   - Business verification
   - Screencast showing how you use permissions

### 10.2 App Review Process
1. Go to **App Review** → **Permissions and Features**
2. For each permission, click **"Request"**
3. Provide:
   - Detailed description of usage
   - Screencast video (show your app posting)
   - Privacy Policy link

### 10.3 Update Production Environment
1. Update your `.env.local` for production:
   ```bash
   FACEBOOK_REDIRECT_URI=https://yourdomain.com/api/auth/facebook/callback
   ```

2. Add production domain in Facebook App Settings

3. Toggle **App Mode** to **"Live"** after approval

---

## 🛠️ Troubleshooting

### Common Issues

#### "Invalid OAuth Redirect URI"
**Solution**: Make sure the redirect URI in your .env.local exactly matches what's in Facebook App Settings

#### "Permission Denied"
**Solution**: 
- Check if you're admin of the Facebook Page
- Verify app is in Development mode for testing
- Ensure you granted all requested permissions during login

#### "Token Expired"
**Solution**: 
- Re-authenticate to get a new token
- Implement automatic token refresh

#### "Cannot Post to Page"
**Solution**:
- Verify page access token is valid
- Check if page is published (not draft)
- Ensure you have pages_manage_posts permission

#### "App Not Found"
**Solution**:
- Verify FACEBOOK_APP_ID is correct
- Check app is created in developers.facebook.com
- Ensure app is not deleted

---

## 📊 Features You Can Now Use

Once connected, you can:

✅ **Auto-Post Content**
- Posts, Stories, Reels
- Images and Videos
- Scheduled posting

✅ **Track Engagement**
- Likes, Comments, Shares
- Reach and Impressions
- Engagement Rate

✅ **Manage Multiple Pages**
- Connect multiple Facebook Pages
- Post to different pages
- Track per-page analytics

✅ **Automate Posting**
- Schedule recurring posts
- AI-generated content
- Product-based campaigns

---

## 🔐 Security Best Practices

1. **Never commit .env files** to version control
2. **Encrypt page access tokens** in database
3. **Use HTTPS** in production
4. **Implement rate limiting** for API calls
5. **Log all posting activities** for audit trail
6. **Validate webhook signatures** (if using webhooks)
7. **Set token expiration alerts**

---

## 📚 Next Steps

After Facebook is connected, you can:

1. **Connect Instagram** (similar process, same app)
2. **Set up automation schedules** for daily posting
3. **Create ad campaigns** with budget allocation
4. **Analyze performance** with built-in analytics
5. **Integrate with more products** from your catalog

---

## 📖 Additional Resources

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api/)
- [Facebook Pages API Reference](https://developers.facebook.com/docs/pages/)
- [OAuth Login Flow](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow)
- [Token Management](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)
- [App Review Guidelines](https://developers.facebook.com/docs/app-review/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review Facebook's error messages in developer console
3. Check your app's logs for detailed error messages
4. Verify all environment variables are set correctly
5. Test with Graph API Explorer: https://developers.facebook.com/tools/explorer/

---

**Ready to connect?** Let me know when you've completed Step 1-4, and I'll create the necessary API routes for your application!
