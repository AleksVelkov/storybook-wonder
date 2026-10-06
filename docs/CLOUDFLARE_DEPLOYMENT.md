# Cloudflare Deployment Guide

Complete guide for deploying Storybook Wonder to Cloudflare Pages (frontend) and Cloudflare Workers (backend API) with D1 Database.

## Why Cloudflare?

- ✅ **Free tier**: Generous limits for small projects
- ✅ **Global CDN**: Lightning-fast worldwide
- ✅ **D1 Database**: SQLite at the edge
- ✅ **Zero cold starts**: Always warm
- ✅ **Simple deployment**: Git-based or CLI
- ✅ **Built-in SSL**: Automatic HTTPS

## Prerequisites

1. Cloudflare account (free): https://dash.cloudflare.com/sign-up
2. Node.js 18+ installed
3. Git installed

## Part 1: Deploy Backend API (Cloudflare Workers + D1)

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window for authentication.

### Step 3: Create D1 Database

```bash
cd worker
wrangler d1 create storybook-wonder
```

You'll see output like:
```
✅ Successfully created DB 'storybook-wonder'

[[d1_databases]]
binding = "DB"
database_name = "storybook-wonder"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`!**

### Step 4: Update wrangler.toml

Edit `worker/wrangler.toml` and replace `YOUR_DATABASE_ID_HERE` with your actual database ID:

**Note**: If you're using Wrangler v4+, the config uses `compatibility_flags = ["nodejs_compat"]` instead of the old `node_compat = true`.

```toml
[[d1_databases]]
binding = "DB"
database_name = "storybook-wonder"
database_id = "paste-your-database-id-here"
```

### Step 5: Configure Environment Variables

In `worker/wrangler.toml`, update the `[vars]` section:

```toml
[vars]
ENVIRONMENT = "production"
JWT_SECRET = "set via `wrangler secret put JWT_SECRET`"
JWT_EXPIRES_IN = "7d"
BREVO_API_KEY = "your-brevo-api-key"
BREVO_LIST_ID = "2"
ALLOWED_ORIGINS = "https://yourdomain.pages.dev"
```

**Important**: Generate a strong JWT secret! You can use:
```bash
openssl rand -base64 32
```

### Step 6: Run Database Migrations

```bash
# Create tables in production
wrangler d1 execute storybook-wonder --file=./migrations/schema.sql

# Seed with sample data (optional)
wrangler d1 execute storybook-wonder --file=./migrations/seed.sql
```

### Step 7: Install Dependencies

```bash
npm install
```

### Step 8: Test Locally

```bash
npm run dev
```

Visit http://localhost:8787/health to verify it works!

### Step 9: Deploy to Cloudflare Workers

```bash
npm run deploy
```

You'll see output like:
```
✨ Deployment complete! ✨
https://storybook-wonder-api.your-subdomain.workers.dev
```

**Copy this URL** - this is your API endpoint!

### Step 10: Test Production API

```bash
curl https://your-worker-url.workers.dev/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## Part 2: Deploy Frontend (Cloudflare Pages)

### Method A: Deploy via Cloudflare Dashboard (Recommended)

#### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Prepare for Cloudflare deployment"
git push origin main
```

#### Step 2: Connect to Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Click **Pages** in the sidebar
3. Click **Create a project**
4. Click **Connect to Git**
5. Authorize Cloudflare to access your repository
6. Select your **storybook-wonder** repository

#### Step 3: Configure Build Settings

**Build settings:**
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty)

**Environment variables:**
- `VITE_API_URL` = `https://your-worker-url.workers.dev`
  (Use the Worker URL from Part 1, Step 9)

#### Step 4: Deploy

Click **Save and Deploy**

Cloudflare will build and deploy your site. You'll get a URL like:
```
https://storybook-wonder.pages.dev
```

#### Step 5: Update CORS

Go back to `worker/wrangler.toml` and update `ALLOWED_ORIGINS`:

```toml
ALLOWED_ORIGINS = "https://storybook-wonder.pages.dev,https://yourdomain.com"
```

Then redeploy the worker:
```bash
cd worker
npm run deploy
```

### Method B: Deploy via Wrangler CLI

#### Step 1: Create Pages Project

```bash
# In project root
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=storybook-wonder
```

#### Step 2: Add Environment Variable

```bash
npx wrangler pages deployment list --project-name=storybook-wonder

# Set environment variable for production
npx wrangler pages deployment env-var set VITE_API_URL https://your-worker-url.workers.dev
```

## Part 3: Connect Frontend to Backend

### Update Frontend .env

Create `.env.production`:

```env
VITE_API_URL=https://your-worker-url.workers.dev
```

### Update API Calls

If you have hardcoded API URLs, replace them with:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
```

### Redeploy Frontend

```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

Cloudflare Pages will automatically redeploy!

## Part 4: Custom Domain (Optional)

### Add Custom Domain to Pages

1. Go to **Cloudflare Pages** → Your project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `www.yourdomain.com`)
4. Follow DNS instructions
5. Wait for DNS propagation (usually 5-15 minutes)

### Add Custom Domain to Worker

1. Go to **Cloudflare Workers** → Your worker → **Triggers**
2. Click **Add Custom Domain**
3. Enter subdomain (e.g., `api.yourdomain.com`)
4. Update `ALLOWED_ORIGINS` in `wrangler.toml`:
   ```toml
   ALLOWED_ORIGINS = "https://www.yourdomain.com"
   ```
5. Redeploy worker: `npm run deploy`

## Testing Your Deployment

### Test Backend API

```bash
# Health check
curl https://your-worker-url.workers.dev/health

# Get products
curl https://your-worker-url.workers.dev/api/products

# Register user
curl -X POST https://your-worker-url.workers.dev/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}'
```

### Test Frontend

Visit your Cloudflare Pages URL and test:
- Browse products
- Newsletter subscription
- User registration
- Creating orders

## D1 Database Management

### View Database

```bash
# List databases
wrangler d1 list

# Execute queries
wrangler d1 execute storybook-wonder --command="SELECT * FROM users LIMIT 10"
```

### Backup Database

```bash
# Export to SQL file
wrangler d1 execute storybook-wonder --command="SELECT * FROM users" > backup.sql
```

### Local Development with D1

```bash
# Create local DB
wrangler d1 execute storybook-wonder --local --file=./migrations/schema.sql
wrangler d1 execute storybook-wonder --local --file=./migrations/seed.sql

# Run worker locally
npm run dev
```

## Continuous Deployment

### Automatic Deployments

**Frontend:** Cloudflare Pages automatically deploys when you push to GitHub!

**Backend:** Deploy worker when needed:
```bash
cd worker
npm run deploy
```

### Preview Deployments

Cloudflare Pages creates preview deployments for pull requests automatically!

## Monitoring & Analytics

### View Logs

**Worker logs:**
```bash
wrangler tail
```

**Pages logs:**
Go to Cloudflare Dashboard → Pages → Your project → Deployments

### Analytics

- **Pages Analytics**: Dashboard → Pages → Your project → Analytics
- **Worker Analytics**: Dashboard → Workers → Your worker → Metrics

## Limits (Free Tier)

### Cloudflare Workers
- **100,000 requests/day**
- **10ms CPU time per request**
- **128MB memory**

### D1 Database
- **5GB storage**
- **5 million reads/day**
- **100,000 writes/day**

### Cloudflare Pages
- **500 builds/month**
- **Unlimited bandwidth**
- **Unlimited sites**

## Troubleshooting

### "Database not found"
- Make sure you ran `wrangler d1 create` and copied the ID to `wrangler.toml`
- Run migrations: `wrangler d1 execute storybook-wonder --file=./migrations/schema.sql`

### CORS Errors
- Check `ALLOWED_ORIGINS` in `wrangler.toml`
- Must match your Pages URL exactly (including https://)
- Redeploy worker after changing

### "Invalid token" errors
- JWT_SECRET must be the same in `wrangler.toml`
- Don't change JWT_SECRET after users are registered (or they'll need to re-login)

### Build failures
- Check environment variables in Pages settings
- Make sure `VITE_API_URL` is set
- Check build logs in Cloudflare Dashboard

### 502 errors
- Check worker logs: `wrangler tail`
- Check D1 database is accessible
- Verify migrations ran successfully

## Cost Estimate

For a small-medium webshop:
- **Cloudflare Workers**: FREE (under 100k req/day)
- **D1 Database**: FREE (under limits)
- **Cloudflare Pages**: FREE
- **Custom domain**: FREE (if domain registered)
- **SSL certificate**: FREE (automatic)

**Total: $0/month** 🎉

## Production Checklist

- [ ] Generate strong JWT_SECRET
- [ ] Update ALLOWED_ORIGINS with your domain
- [ ] Configure Brevo API if using newsletter
- [ ] Run database migrations in production
- [ ] Test all API endpoints
- [ ] Test frontend functionality
- [ ] Add custom domain (optional)
- [ ] Set up monitoring/alerts
- [ ] Test payment integration (if applicable)
- [ ] Configure error tracking (Sentry, etc.)

## Resources

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- D1 Database Docs: https://developers.cloudflare.com/d1/
- Wrangler CLI Docs: https://developers.cloudflare.com/workers/wrangler/

## Support

If you encounter issues:
1. Check Cloudflare status: https://www.cloudflarestatus.com/
2. View worker logs: `wrangler tail`
3. Check Cloudflare Community: https://community.cloudflare.com/
4. Cloudflare Discord: https://discord.gg/cloudflaredev

Happy deploying! 🚀

