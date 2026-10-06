# Storybook Wonder (Sterrenverhalen)

Web shop for personalised children's books. Customers pick a story, personalise the character, and check out; admins manage products, orders and coupons.

## Stack

- **Frontend** – Vite, React, TypeScript, Tailwind CSS, shadcn/ui (`src/`)
- **API** – Cloudflare Worker (Hono-style routes) + D1 (SQLite) (`worker/`)
- **Email / newsletter** – [Brevo](https://www.brevo.com/)
- **Address lookup** – [openpostcode.nl](https://openpostcode.nl/)
- `backend/` – an earlier Express + PostgreSQL version of the API, kept for reference

## Local development

Requires Node 20+ and npm.

```bash
# API (http://localhost:8787)
cd worker
npm install
cp .dev.vars.example .dev.vars          # set JWT_SECRET (and Brevo keys if you need email)
npx wrangler d1 create storybook-wonder # paste the id into wrangler.toml
npx wrangler d1 execute storybook-wonder --local --file=migrations/schema.sql
node create-admin.js admin@example.com 'a-strong-password' > admin.sql
npx wrangler d1 execute storybook-wonder --local --file=admin.sql
npm run dev

# Frontend (http://localhost:5173), in another terminal at the repo root
npm install
cp .env.example .env
npm run dev
```

## Deployment

Cloudflare Workers + Pages. Secrets are never committed:

```bash
cd worker
npx wrangler secret put JWT_SECRET
npx wrangler secret put BREVO_API_KEY
npx wrangler deploy
```

Set `VITE_API_URL` to your Worker URL in the Pages build settings. Full walkthrough: [docs/CLOUDFLARE_DEPLOYMENT.md](docs/CLOUDFLARE_DEPLOYMENT.md).

## Docs

- [Checkout flow](docs/CHECKOUT_FLOW.md)
- [Order management](docs/ORDER_MANAGEMENT_GUIDE.md)
- [Address lookup](docs/ADDRESS_LOOKUP_GUIDE.md)

## License

No license has been chosen yet; all rights reserved until one is added.
