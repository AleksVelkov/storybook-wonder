# Storybook Wonder - Cloudflare Worker API

Backend API built with Hono and Cloudflare D1 Database.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create D1 Database

```bash
wrangler d1 create storybook-wonder
```

Copy the `database_id` from the output and update `wrangler.toml`.

### 3. Run Migrations

```bash
# Local development
npm run db:migrate:local
npm run db:seed:local

# Production
npm run db:migrate
npm run db:seed
```

### 4. Run Locally

```bash
npm run dev
```

Visit http://localhost:8787/health

### 5. Deploy

```bash
npm run deploy
```

## Database Commands

```bash
# Create database
npm run db:create

# Run migrations (local)
npm run db:migrate:local

# Seed data (local)
npm run db:seed:local

# Run migrations (production)
npm run db:migrate

# Seed data (production)
npm run db:seed

# Query database
wrangler d1 execute storybook-wonder --command="SELECT * FROM users"
```

## Configuration

Edit `wrangler.toml` to configure:
- Database binding
- Environment variables
- JWT secret
- CORS origins
- Brevo API credentials

## API Endpoints

### Health
- `GET /health` - Health check

### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Get profile (auth required)
- `PUT /api/users/profile` - Update profile (auth required)
- `GET /api/users` - List users (admin only)
- `GET /api/users/:id` - Get user (admin only)
- `PATCH /api/users/:id/toggle-status` - Toggle user status (admin only)

### Products
- `GET /api/products` - List products (public)
- `GET /api/products/:id` - Get product (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `PATCH /api/products/:id/stock` - Update stock (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe (public)
- `POST /api/newsletter/unsubscribe` - Unsubscribe (public)
- `GET /api/newsletter` - List subscriptions (admin only)
- `GET /api/newsletter/stats` - Get statistics (admin only)
- `DELETE /api/newsletter/:email` - Delete subscription (admin only)

## Development

### Local Development

```bash
npm run dev
```

The API runs on http://localhost:8787

### View Logs

```bash
wrangler tail
```

### Test Database Queries

```bash
wrangler d1 execute storybook-wonder --command="SELECT * FROM users LIMIT 5"
```

## Deployment

```bash
npm run deploy
```

Your API will be available at:
```
https://storybook-wonder-api.your-subdomain.workers.dev
```

## Admin user

```bash
node create-admin.js admin@example.com 'a-strong-password' > admin.sql
wrangler d1 execute storybook-wonder --remote --file=admin.sql
```

## Environment Variables

Secrets (`wrangler secret put JWT_SECRET`, `wrangler secret put BREVO_API_KEY`; for local dev put them in `worker/.dev.vars`):
- `JWT_SECRET` - Secret for JWT signing
- `BREVO_API_KEY` - Brevo API key for newsletter/emails

Plain vars in `wrangler.toml`:
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `ALLOWED_ORIGINS` - CORS allowed origins
- `BREVO_LIST_ID` - Brevo list ID

## Security

- Passwords hashed with PBKDF2
- JWT authentication
- CORS protection
- Admin-only routes
- SQL injection protection (parameterized queries)

## Resources

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Hono Framework](https://hono.dev/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)


