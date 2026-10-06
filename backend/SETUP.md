# Setup Guide for Storybook Wonder Backend

## Prerequisites Installation

### 1. Install PostgreSQL

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Set password for postgres user (remember this!)
   - Default port: 5432
   - Default locale: English
4. After installation, PostgreSQL should start automatically

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Verify PostgreSQL is Running

**Windows:**
- Open Services (Win + R, type `services.msc`)
- Look for "postgresql-x64-14" or similar
- Should show "Running" status

**macOS/Linux:**
```bash
# Check if PostgreSQL is running
psql --version
pg_isready
```

### 3. Create Database

**Using psql command line:**
```bash
# Connect to PostgreSQL (Windows: use SQL Shell from Start Menu)
psql -U postgres

# Then in psql:
CREATE DATABASE storybook_wonder;
\q
```

**Or using pgAdmin:**
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to local server
3. Right-click "Databases" → Create → Database
4. Name: `storybook_wonder`

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Edit `backend/.env` file and update the database password:

```env
DB_PASSWORD=your_postgres_password_here
```

Replace `your_postgres_password_here` with the password you set during PostgreSQL installation.

### 3. Run Database Migrations

```bash
npm run db:migrate
```

You should see:
```
✅ Database migration completed successfully!
```

### 4. Seed Database with Sample Data

```bash
npm run db:seed
```

This creates:
- **Admin user:** admin@storybookwonder.com / admin123
- **Test user:** customer@example.com / customer123
- **6 sample products**
- **1 sample order**

### 5. Start the Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server is running on port 3001
📍 Environment: development
🔗 Health check: http://localhost:3001/health
```

## Verify Installation

### 1. Check Health Endpoint

Open your browser and go to:
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

### 2. Test API Endpoints

#### Using cURL (Command Line):

**Get Products:**
```bash
curl http://localhost:3001/api/products
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@storybookwonder.com\",\"password\":\"admin123\"}"
```

#### Using PowerShell (Windows):

**Get Products:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/products" -Method Get
```

**Login:**
```powershell
$body = @{
    email = "admin@storybookwonder.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/users/login" -Method Post -Body $body -ContentType "application/json"
```

#### Using Browser:

Visit these URLs in your browser:
- http://localhost:3001/
- http://localhost:3001/health
- http://localhost:3001/api/products

#### Using REST Client (VS Code):

1. Install "REST Client" extension in VS Code
2. Open `backend/test-api.http`
3. Click "Send Request" above any endpoint

## Troubleshooting

### Problem: "ECONNREFUSED" error

**Solution:**
- PostgreSQL is not running
- Check services and start PostgreSQL
- Verify connection settings in `.env` file

### Problem: "database does not exist"

**Solution:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE storybook_wonder;
\q

# Then run migrations again
npm run db:migrate
```

### Problem: "password authentication failed"

**Solution:**
- Check `DB_PASSWORD` in `.env` file
- Make sure it matches your PostgreSQL password

### Problem: Port 3001 already in use

**Solution:**
- Change `PORT` in `.env` file
- Or stop other application using port 3001

## Database Management

### View Database Contents

```bash
# Connect to database
psql -U postgres -d storybook_wonder

# List tables
\dt

# View users
SELECT id, email, first_name, last_name, is_admin FROM users;

# View orders
SELECT id, order_number, status, total_amount FROM orders;

# View products
SELECT id, title, price, stock_quantity FROM products;

# Exit
\q
```

### Reset Database

If you need to start fresh:

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS storybook_wonder;"
psql -U postgres -c "CREATE DATABASE storybook_wonder;"

# Run migrations and seed
npm run db:migrate
npm run db:seed
```

## Production Deployment

### Important Security Steps:

1. **Change JWT Secret:**
   ```env
   JWT_SECRET=generate_a_long_random_secure_key_here
   ```

2. **Use Strong Database Password:**
   ```env
   DB_PASSWORD=use_a_strong_secure_password
   ```

3. **Set Production Environment:**
   ```env
   NODE_ENV=production
   ```

4. **Configure CORS:**
   ```env
   ALLOWED_ORIGINS=https://your-production-domain.com
   ```

5. **Build and Run:**
   ```bash
   npm run build
   npm start
   ```

## Support

If you encounter any issues:

1. Check that PostgreSQL is running
2. Verify database credentials in `.env`
3. Check console logs for error messages
4. Review the README.md for API documentation
5. Test individual endpoints using `test-api.http`


