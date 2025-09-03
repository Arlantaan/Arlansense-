# 🔥 Firebase Google Sign-in Setup Checklist

## ❌ Common Issue: "Google Sign-in not working on admin page"

### 📋 **Required Firebase Console Setup:**

1. **Enable Google Authentication:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project: `newsense-27a7a`
   - Go to **Authentication** → **Sign-in method**
   - Click on **Google** provider
   - **Enable** the toggle
   - Set **Project support email** (required)

2. **Add Authorized Domains:**
   - In the same Google provider settings
   - Add your domains to **Authorized domains**:
     - `localhost` (for local testing)
     - `127.0.0.1` (for local testing)
     - Your actual domain when deployed

3. **Check Project Configuration:**
   - Go to **Project Settings** → **General**
   - Verify **Project ID**: `newsense-27a7a`
   - Verify **Web API Key** matches your config

## 🔧 **Troubleshooting Steps:**

### If you get "operation-not-allowed" error:
- Google Sign-in is not enabled in Firebase Console
- Follow step 1 above

### If you get "unauthorized-domain" error:
- Your current domain is not in the authorized domains list
- Add your domain to authorized domains (step 2)

### If popup gets blocked:
- Allow popups for your site
- Try in a different browser

### If nothing happens when clicking "Sign in with Google":
- Open browser dev tools (F12)
- Check Console for error messages
- Share the exact error message

## 📧 **Admin Accounts:**
Currently allowed admin emails:
- `haddybubacarr@gmail.com`
- `abdullaalami1@gmail.com`

## 🧪 **Test Steps:**
1. Open admin.html
2. Click "Sign in with Google"
3. Should open Google account selector
4. Select your admin email
5. Should redirect back and show admin dashboard

## 🆘 **Still Not Working?**
Share the exact error message from browser console (F12 → Console tab)