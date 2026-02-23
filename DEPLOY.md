# Deploy to GoDaddy via GitHub Actions

This project builds on GitHub and deploys to GoDaddy shared hosting via FTP.

## Setup

### 1. Add GitHub Secrets

In your repo: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret | Description |
|--------|-------------|
| `FTP_SERVER` | FTP host (e.g. `ftp.caliberon.com` or your GoDaddy FTP host) |
| `FTP_USERNAME` | FTP username from cPanel |
| `FTP_PASSWORD` | FTP password |
| `FTP_SERVER_DIR` | Remote path (e.g. `/public_html/caliberon.com/blognext`) |
| `DATABASE_URL` | MongoDB connection string |
| `NEXTAUTH_SECRET` | NextAuth secret (run `openssl rand -base64 32` to generate) |
| `NEXTAUTH_URL` | Your site URL (e.g. `https://caliberon.com`) |
| `NEXT_PUBLIC_CANONICAL_URL` | Same as NEXTAUTH_URL |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### 2. Configure Node.js on GoDaddy

In cPanel → **Setup Node.js App**:

- **Application root**: Point to the folder where files are deployed (e.g. `blognext`)
- **Application startup file**: `server.js`
- **Application URL**: Your domain/subdomain
- **Node.js version**: 18 or 20

### 3. Deploy

- **Auto**: Push to `main` branch → workflow runs automatically
- **Manual**: Actions tab → "Build and Deploy to GoDaddy" → Run workflow

### 4. Restart after deploy

If the app doesn’t pick up changes, restart it in cPanel (Node.js App → Stop → Start) or create `tmp/restart.txt` if your host uses Passenger.
