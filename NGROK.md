# Using ngrok to Test Your App

ngrok allows you to expose your local development server to the internet, making it accessible from anywhere for testing.

## Quick Start

1. **Start your Next.js dev server** (in one terminal):
   ```bash
   npm run dev
   ```

2. **Start ngrok** (in another terminal):
   ```bash
   npm run ngrok
   ```
   
   Or directly:
   ```bash
   ngrok http 3000
   ```

3. **Copy the ngrok URL** - You'll see something like:
   ```
   Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
   ```

4. **Update your environment variables** - If you're using NextAuth, update your `.env` file:
   ```env
   NEXTAUTH_URL=https://abc123.ngrok-free.app
   ```
   Then restart your dev server.

## Important Notes

- **Free ngrok URLs change** every time you restart ngrok (unless you have a paid plan)
- **Update NEXTAUTH_URL** each time you get a new ngrok URL
- **HTTPS is enabled** by default with ngrok, which is great for testing
- **Webhook testing** - ngrok is perfect for testing webhooks and external integrations

## Alternative: Use ngrok with a fixed domain (paid)

If you have a paid ngrok account, you can use a fixed domain:
```bash
ngrok http 3000 --domain=your-domain.ngrok.io
```

## Troubleshooting

- **Port already in use**: Make sure port 3000 is available
- **NextAuth errors**: Make sure `NEXTAUTH_URL` matches your ngrok URL exactly
- **CORS issues**: ngrok handles CORS automatically, but check your Next.js config if needed

