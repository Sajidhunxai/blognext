# Rank Checker Troubleshooting Guide

## "Requests from referer <empty> are blocked" Error

This error occurs when your Google API key has "HTTP referrers" restriction enabled, but you're making server-side API calls (which don't have referers).

### Step-by-Step Fix:

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Make sure you're in the correct project

2. **Find Your API Key**
   - Look for the API key that matches the first 15 characters shown in your server logs
   - The key in your `.env` file starts with: `AIzaSyDUWNuV_PSrcRa...`

3. **Click on the API Key** to edit it

4. **Check "Application restrictions" Section**
   - It should show: **"None"** (selected with a radio button)
   - If it shows **"Websites"** or **"HTTP referrers"**, that's the problem!

5. **Change to "None"**
   - Click the **"None"** radio button
   - Remove any website restrictions if they exist
   - **Click "SAVE"** at the bottom

6. **Wait 2-5 minutes** for changes to propagate

7. **Restart your Next.js dev server**
   ```bash
   # Stop the server (Ctrl+C or Cmd+C)
   # Then restart
   npm run dev
   ```

8. **Try the rank checker again**

### Verify Your API Key in Code

Check your server console logs when making a request. You should see:
```
Using Google API Key (first 15 chars): AIzaSyDUWNuV_PSrcRa...
Using Google CX: f006704366cb34552
```

Make sure this matches the API key you're editing in Google Cloud Console!

### Alternative: Create a New API Key

If the issue persists, create a fresh API key:

1. In Google Cloud Console → APIs & Services → Credentials
2. Click **"Create Credentials"** → **"API Key"**
3. **Immediately** click on the new key to edit it
4. Set **"Application restrictions"** to **"None"** (before doing anything else)
5. Set **"API restrictions"** to **"Restrict key"** → Select **"Custom Search API"**
6. Click **"Save"**
7. Copy the new API key
8. Update your `.env` file:
   ```env
   GOOGLE_API_KEY=your_new_api_key_here
   ```
9. Restart your dev server

### Important Notes:

- **Server-side API calls** (like Next.js API routes) don't send HTTP referer headers
- That's why "HTTP referrers" restriction blocks them
- **"None"** or **"IP addresses"** restrictions work for server-side calls
- Your API key is already restricted to "Custom Search API", so using "None" for application restrictions is safe

### Still Not Working?

1. Double-check you're editing the **correct API key** (compare first 15 characters)
2. Make sure you clicked **"Save"** after changing settings
3. Wait **at least 5 minutes** for Google's systems to update
4. **Restart your dev server** after changing `.env` file
5. Check the browser console and server logs for detailed error messages

