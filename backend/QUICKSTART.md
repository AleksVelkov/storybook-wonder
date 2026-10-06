# Quick Start Guide

## Prerequisites Check
Before you begin, make sure you have:
- [x] Node.js 18+ installed
- [x] PostgreSQL 14+ installed and running
- [x] Git (optional, for cloning)

## 5-Minute Setup

### Step 1: Install PostgreSQL (if not installed)

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the postgres user password!

**Check if PostgreSQL is running:**
- Open Services (Win + R → type `services.msc`)
- Look for "postgresql" service - should show "Running"

### Step 2: Create Database

Open Command Prompt or PowerShell:

```powershell
# Connect to PostgreSQL (enter password when prompted)
psql -U postgres

# In psql, run:
CREATE DATABASE storybook_wonder;
\q
```

### Step 3: Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
# Edit .env file and set your PostgreSQL password
# Change DB_PASSWORD=postgres to your actual password

# Run migrations (create tables)
npm run db:migrate

# Seed sample data (optional but recommended)
npm run db:seed

# Start the server
npm run dev
```

### Step 4: Verify It Works

Open your browser and visit:
```
http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Step 5: Test the API

**Get Products (Public):**
```
http://localhost:3001/api/products
```

**Login as Admin:**

Using PowerShell:
```powershell
$body = @{
    email = "admin@storybookwonder.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/users/login" -Method Post -Body $body -ContentType "application/json"
```

Using cURL:
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@storybookwonder.com\",\"password\":\"admin123\"}"
```

## Default Accounts

After running `npm run db:seed`, you'll have:

**Admin Account:**
- Email: `admin@storybookwonder.com`
- Password: `admin123`
- Can manage users, orders, and products

**Customer Account:**
- Email: `customer@example.com`
- Password: `customer123`
- Can browse products and place orders

## Common Commands

```bash
# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Reset database
npm run db:migrate
npm run db:seed
```

## Troubleshooting

### PostgreSQL not running
**Windows:** Start menu → search "Services" → find "postgresql" → right-click → Start

### Can't connect to database
1. Check `.env` file has correct DB_PASSWORD
2. Verify PostgreSQL is running
3. Make sure database `storybook_wonder` exists:
   ```bash
   psql -U postgres -l
   ```

### Port 3001 already in use
Edit `.env` and change `PORT=3001` to another port like `PORT=3002`

## Newsletter Setup (Optional)

If you want to enable newsletter functionality with Brevo:

1. Sign up at https://www.brevo.com/ (free tier available)
2. Get your API key from SMTP & API section
3. Create a contact list and note the List ID
4. Update `.env`:
   ```env
   BREVO_API_KEY=xkeysib-your-api-key
   BREVO_LIST_ID=2
   ```
5. Run newsletter migration:
   ```bash
   npm run db:migrate:newsletter
   ```
6. See `NEWSLETTER_SETUP.md` for detailed instructions

## Next Steps

1. **Explore the API**
   - Open `test-api.http` in VS Code with REST Client extension
   - Try different endpoints
   - Test authentication and authorization

2. **Read Full Documentation**
   - `README.md` - Complete API documentation
   - `SETUP.md` - Detailed setup instructions
   - `test-api.http` - API testing examples

3. **Connect Your Frontend**
   - API runs on `http://localhost:3001`
   - Use JWT token for authenticated requests
   - See API endpoints in README.md

4. **Admin Dashboard**
   - Login as admin to access:
     - User management: GET `/api/users`
     - Order management: GET `/api/orders`
     - Order statistics: GET `/api/orders/stats/overview`
     - Product management: POST/PUT/DELETE `/api/products`

## API Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/register` | POST | No | Create account |
| `/api/users/login` | POST | No | Login |
| `/api/users/profile` | GET | Yes | Get profile |
| `/api/products` | GET | No | List products |
| `/api/orders` | POST | Yes | Create order |
| `/api/orders/my-orders` | GET | Yes | My orders |
| `/api/orders` | GET | Admin | All orders |
| `/api/users` | GET | Admin | All users |

## Security Notes

**For Production:**
1. Change `JWT_SECRET` in `.env` to a long random string
2. Use a strong database password
3. Set `NODE_ENV=production`
4. Configure `ALLOWED_ORIGINS` for your frontend domain
5. Use HTTPS

## Support

Need help? Check:
- `README.md` - Full API documentation
- `SETUP.md` - Detailed setup guide
- `test-api.http` - API testing examples

## Congratulations! 🎉

Your Storybook Wonder backend is now running!

Start building your amazing webshop frontend and connect it to this powerful API.

