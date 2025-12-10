# NEXTAUTH_SECRET Setup Guide

## Error: Missing NEXTAUTH_SECRET

If you're seeing this error:
```
[next-auth][error][NO_SECRET] Please define a `secret` in production.
```

This means the `NEXTAUTH_SECRET` environment variable is not set in your production environment.

## Quick Fix for Vercel

1. **Generate a Secret Key:**
   ```bash
   openssl rand -base64 32
   ```
   
   Or use this online generator: https://generate-secret.vercel.app/32

2. **Add to Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Click **Add New**
   - **Name**: `NEXTAUTH_SECRET`
   - **Value**: Paste the generated secret
   - **Environment**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

3. **Redeploy:**
   - After adding the variable, trigger a new deployment
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment

## For Other Platforms

### Netlify
1. Go to **Site settings** → **Environment variables**
2. Add `NEXTAUTH_SECRET` with your generated value
3. Redeploy

### Railway
1. Go to your project → **Variables**
2. Add `NEXTAUTH_SECRET` with your generated value
3. Redeploy

### Docker/Manual Deployment
Add to your `.env` file:
```env
NEXTAUTH_SECRET=your-generated-secret-here
```

## Important Notes

- **Never commit** `NEXTAUTH_SECRET` to version control
- Use a **different secret** for each environment (production, staging, development)
- The secret should be **at least 32 characters** long
- Keep it **secure** and don't share it publicly

## Verify It's Set

After setting the variable and redeploying, check your deployment logs to ensure there are no `NO_SECRET` errors.

## Still Having Issues?

1. Double-check the variable name is exactly `NEXTAUTH_SECRET` (case-sensitive)
2. Ensure it's set for the correct environment (Production/Preview/Development)
3. Make sure you've redeployed after adding the variable
4. Check Vercel logs for any other errors

