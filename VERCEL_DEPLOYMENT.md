# Vercel Deployment Guide

## Environment Variables on Vercel

When deploying to Vercel, you need to set the following environment variables in your Vercel project settings.

### Required Environment Variables

1. **NEXTAUTH_URL**
   - **Production**: Set to your Vercel deployment URL
     ```
     https://blognext-rosy.vercel.app
     ```
   - **Preview/Development**: Vercel automatically provides `VERCEL_URL` environment variable
   - **Custom Domain**: If you have a custom domain, use that instead
     ```
     https://yourdomain.com
     ```

2. **NEXTAUTH_SECRET**
   - Generate a random secret key (at least 32 characters)
   - You can generate one using:
     ```bash
     openssl rand -base64 32
     ```
   - Or use an online generator: https://generate-secret.vercel.app/32

3. **DATABASE_URL**
   - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/database-name`

4. **Cloudinary Variables** (if using Cloudinary)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_UPLOAD_PRESET` (optional, for unsigned uploads)

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `NEXTAUTH_URL`
   - **Value**: `https://your-app-name.vercel.app`
   - **Environment**: Select all (Production, Preview, Development)
4. Repeat for all required variables

## Automatic NEXTAUTH_URL Setup (Recommended)

Instead of manually setting `NEXTAUTH_URL`, you can use Vercel's automatic `VERCEL_URL`:

### Option 1: Update your code to use VERCEL_URL

You can modify your code to automatically use Vercel's URL:

```typescript
// In your auth configuration or wherever you use NEXTAUTH_URL
const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.NEXTAUTH_URL || 'http://localhost:3000';
```

### Option 2: Use Vercel's Environment Variable

In Vercel dashboard, set:
- **Name**: `NEXTAUTH_URL`
- **Value**: `https://$VERCEL_URL` (for preview deployments)
- Or set it to your production domain: `https://yourdomain.com`

## Important Notes

### For Production
- Set `NEXTAUTH_URL` to your **production domain** (custom domain or `.vercel.app` domain)
- Example: `https://blognext-rosy.vercel.app` or `https://yourdomain.com` (if using custom domain)

### For Preview Deployments
- Vercel provides `VERCEL_URL` automatically (e.g., `your-app-git-branch-username.vercel.app`)
- You can use `https://$VERCEL_URL` or set `NEXTAUTH_URL` dynamically

### For Custom Domains
- If you have a custom domain configured in Vercel, use that:
  ```
  NEXTAUTH_URL=https://yourdomain.com
  ```

## Troubleshooting

### NextAuth not working on Vercel?
1. **Check NEXTAUTH_URL**: Make sure it matches your actual deployment URL exactly
2. **Check NEXTAUTH_SECRET**: Must be set and consistent across deployments
3. **Check HTTPS**: Vercel uses HTTPS by default, so `NEXTAUTH_URL` must start with `https://`
4. **Check CORS**: If using OAuth providers, add your Vercel URL to their allowed callback URLs

### Common Issues

**Issue**: "Invalid redirect URI"
- **Solution**: Make sure `NEXTAUTH_URL` matches exactly what you configured in OAuth providers

**Issue**: Session not persisting
- **Solution**: Ensure `NEXTAUTH_SECRET` is set and consistent

**Issue**: Works locally but not on Vercel
- **Solution**: Double-check all environment variables are set in Vercel dashboard

## Quick Setup Checklist

- [ ] Set `NEXTAUTH_URL` to your production URL
- [ ] Set `NEXTAUTH_SECRET` (generate a secure random string)
- [ ] Set `DATABASE_URL` (MongoDB connection string)
- [ ] Set Cloudinary variables (if using Cloudinary)
- [ ] Verify all variables are set for Production, Preview, and Development environments
- [ ] **Prisma Client**: The `postinstall` script in `package.json` will automatically run `prisma generate` during build
- [ ] Redeploy after setting environment variables

## Prisma Setup on Vercel

The project includes a `postinstall` script that automatically runs `prisma generate` after dependencies are installed. This ensures Prisma Client is generated during Vercel's build process.

**No additional configuration needed** - this is handled automatically by the `postinstall` script in `package.json`.

## Example Vercel Environment Variables

```
NEXTAUTH_URL=https://blognext-rosy.vercel.app
NEXTAUTH_SECRET=your-generated-secret-key-here
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

