# Meta Pixel Configuration - Quick Reference Card

## 🎯 In 2 Steps

### Step 1: Setup (First Time Only)
```
URL: http://localhost:3000/admin/meta-pixel/init
Click: "Save Meta Pixel Configuration" button
Result: ✓ Credentials saved to database
```

### Step 2: Use (Every Time)
```
URL: http://localhost:3000/admin/meta-pixel
Auto: Form pre-populated with saved credentials
Edit: Change settings and click "Save Configuration"
```

---

## 📍 URL References

| Purpose | URL | Action |
|---------|-----|--------|
| **Setup** | `/admin/meta-pixel/init` | Click to initialize/save credentials |
| **Settings** | `/admin/meta-pixel` | View/edit configuration (auto-loads from DB) |
| **API** | `/api/admin/meta-pixel` | GET current config (JSON) |
| **API** | `/api/admin/meta-pixel/init` | POST to save config |

---

## 🔐 Your Credentials

```
Pixel ID:       932014878052619
Test Event Code: TEST15893
Access Token:   EAAWcOaIQDsEB... (in database)
```

---

## ⚡ Features

✅ Auto-load configuration from database  
✅ Saves to DB when you click "Save Configuration"  
✅ Pre-populates all form fields automatically  
✅ Admin-only access  
✅ Persists across browser sessions  

---

## 🚀 Getting Started

1. Run: `npm run dev`
2. Open: `http://localhost:3000/admin/meta-pixel/init`
3. Click: "Save Meta Pixel Configuration"
4. Visit: `http://localhost:3000/admin/meta-pixel`
5. See: ✓ Configuration pre-loaded from database

---

**Status**: ✅ Ready to Use
