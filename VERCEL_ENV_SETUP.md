# Vercel Environment Variables Setup - Step by Step

## ⚠️ CRITICAL: NEXTAUTH_SECRET Error Fix

If you're seeing this error:
```
[next-auth][error][NO_SECRET] Please define a `secret` in production.
```

**This means `NEXTAUTH_SECRET` is NOT set in your Vercel project.**

## Quick Fix (5 minutes)

### Step 1: Generate a Secret Key

Open your terminal and run:
```bash
openssl rand -base64 32
```

**OR** use this online generator: https://generate-secret.vercel.app/32

Copy the generated secret (it will look something like: `aBc123XyZ456...`)

### Step 2: Add to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in to your account

2. **Select Your Project**
   - Click on your project name (e.g., "apkapp")

3. **Go to Settings**
   - Click on **"Settings"** tab (top navigation)

4. **Open Environment Variables**
   - Click on **"Environment Variables"** in the left sidebar

5. **Add NEXTAUTH_SECRET**
   - Click **"Add New"** button
   - **Key**: `NEXTAUTH_SECRET`
   - **Value**: Paste the secret you generated in Step 1
   - **Environment**: Check ALL three boxes:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **"Save"**

### Step 3: Add Other Required Variables

While you're there, make sure these are also set:

1. **NEXTAUTH_URL**
   - **Key**: `NEXTAUTH_URL`
   - **Value**: Your production URL (e.g., `https://your-app.vercel.app`)
   - **Environment**: Production, Preview, Development

2. **DATABASE_URL**
   - **Key**: `DATABASE_URL`
   - **Value**: Your MongoDB connection string
   - **Environment**: Production, Preview, Development

3. **Cloudinary Variables** (if using Cloudinary)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - **Environment**: Production, Preview, Development

### Step 4: Redeploy

**IMPORTANT**: After adding environment variables, you MUST redeploy:

1. Go to **"Deployments"** tab
2. Find your latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. Confirm the redeploy

**OR** simply push a new commit to trigger a new deployment:
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

## Verify It's Set

After redeploying:

1. Check the deployment logs:
   - Go to **Deployments** → Click on latest deployment → **"Logs"** tab
   - Look for any `NO_SECRET` errors (there should be none)

2. Test your app:
   - Visit your production URL
   - Try to access `/login` or any protected route
   - The error should be gone

## Common Mistakes

❌ **Wrong**: Setting it only in local `.env` file  
✅ **Correct**: Set it in Vercel Environment Variables

❌ **Wrong**: Setting it but not redeploying  
✅ **Correct**: Always redeploy after adding environment variables

❌ **Wrong**: Setting it only for "Production" environment  
✅ **Correct**: Set for Production, Preview, AND Development

❌ **Wrong**: Using a weak secret like "secret123"  
✅ **Correct**: Use a strong random secret (32+ characters)

## Still Having Issues?

1. **Double-check the variable name**: It must be exactly `NEXTAUTH_SECRET` (case-sensitive)

2. **Check all environments**: Make sure it's set for Production, Preview, and Development

3. **Verify redeployment**: Check that you actually redeployed after adding the variable

4. **Check Vercel logs**: Look at the deployment logs for any other errors

5. **Try regenerating**: Generate a new secret and update it in Vercel

## Security Notes

- ✅ Never commit `NEXTAUTH_SECRET` to Git
- ✅ Use different secrets for different environments (optional but recommended)
- ✅ Keep your secret secure and don't share it
- ✅ If your secret is compromised, generate a new one immediately

## Need Help?

If you're still stuck:
1. Check Vercel's documentation: https://vercel.com/docs/concepts/projects/environment-variables
2. Verify your Vercel project settings
3. Check the deployment logs for more details

