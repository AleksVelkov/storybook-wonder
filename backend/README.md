# Storybook Wonder Backend API

A comprehensive backend API for the Storybook Wonder webshop built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- 🔐 JWT-based authentication
- 👥 User management (registration, login, profile updates)
- 📦 Order management with status tracking
- 🛍️ Product catalog management
- 🔒 Role-based access control (Admin/User)
- 📊 Order statistics and analytics
- ✅ Input validation and sanitization
- 🛡️ Security best practices (Helmet, CORS, Rate limiting)
- 🗃️ PostgreSQL database with transactions
- 📝 Comprehensive error handling

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL 14+
- npm or yarn or bun

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your database and JWT settings:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=storybook_wonder
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret_key_change_this
   PORT=3001
   ```

4. **Create PostgreSQL database:**
   ```bash
   createdb storybook_wonder
   ```
   Or using psql:
   ```sql
   CREATE DATABASE storybook_wonder;
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Seed the database with sample data (optional):**
   ```bash
   npm run db:seed
   ```
   
   This creates:
   - Admin user: `admin@storybookwonder.com` / `admin123`
   - Test user: `customer@example.com` / `customer123`
   - Sample products and orders

## Running the Application

### Development mode (with hot reload):
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3001`

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### Health Check

#### GET /health
Check API and database status.

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

### User Endpoints

#### POST /api/users/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "postal_code": "10001",
  "country": "USA"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_admin": false,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/users/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_admin": false,
    "last_login": "2024-01-01T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/users/profile
Get current user's profile. **[Requires Auth]**

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "postal_code": "10001",
  "country": "USA",
  "is_admin": false,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "last_login": "2024-01-01T12:00:00.000Z"
}
```

#### PUT /api/users/profile
Update current user's profile. **[Requires Auth]**

**Request Body:**
```json
{
  "first_name": "Jane",
  "phone": "+0987654321",
  "address": "456 Oak Ave"
}
```

#### GET /api/users
Get all users (paginated). **[Requires Admin]**

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by email, first name, or last name

**Response:** `200 OK`
```json
{
  "users": [...],
  "total": 50,
  "page": 1,
  "totalPages": 3
}
```

#### GET /api/users/:id
Get user by ID. **[Requires Admin]**

#### PUT /api/users/:id
Update user by ID. **[Requires Admin]**

#### PATCH /api/users/:id/toggle-status
Toggle user active status. **[Requires Admin]**

#### DELETE /api/users/:id
Delete user by ID. **[Requires Admin]**

---

### Order Endpoints

#### POST /api/orders
Create a new order. **[Requires Auth]**

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ],
  "shipping_address": "123 Main St",
  "shipping_city": "New York",
  "shipping_postal_code": "10001",
  "shipping_country": "USA",
  "billing_address": "123 Main St",
  "billing_city": "New York",
  "billing_postal_code": "10001",
  "billing_country": "USA",
  "notes": "Please deliver before noon"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 1,
  "order_number": "ORD-1704110400000-1",
  "status": "pending",
  "total_amount": 74.97,
  "currency": "USD",
  "shipping_address": "123 Main St",
  "shipping_city": "New York",
  "shipping_postal_code": "10001",
  "shipping_country": "USA",
  "created_at": "2024-01-01T12:00:00.000Z",
  "items": [
    {
      "id": 1,
      "order_id": 1,
      "product_id": 1,
      "product_name": "The Adventures of Emma",
      "quantity": 2,
      "unit_price": 24.99,
      "total_price": 49.98
    }
  ]
}
```

#### GET /api/orders/my-orders
Get current user's orders. **[Requires Auth]**

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

#### GET /api/orders/:id
Get order by ID. **[Requires Auth]**
- Users can only view their own orders
- Admins can view any order

#### PATCH /api/orders/:id/cancel
Cancel an order. **[Requires Auth]**
- Users can cancel their own pending/processing orders
- Admins can cancel any order
- Automatically restores product stock

#### GET /api/orders
Get all orders (paginated). **[Requires Admin]**

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (pending, processing, shipped, delivered, cancelled, refunded)

**Response:** `200 OK`
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 1,
      "user_email": "user@example.com",
      "user_name": "John Doe",
      "order_number": "ORD-1704110400000-1",
      "status": "processing",
      "total_amount": 74.97,
      "created_at": "2024-01-01T12:00:00.000Z",
      "items": [...]
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 2
}
```

#### PATCH /api/orders/:id/status
Update order status. **[Requires Admin]**

**Request Body:**
```json
{
  "status": "shipped",
  "notes": "Shipped via FedEx, tracking: 123456789"
}
```

**Valid statuses:**
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`
- `refunded`

#### DELETE /api/orders/:id
Delete order by ID. **[Requires Admin]**

#### GET /api/orders/stats/overview
Get order statistics. **[Requires Admin]**

**Response:** `200 OK`
```json
{
  "total_orders": 150,
  "pending_orders": 10,
  "processing_orders": 25,
  "shipped_orders": 30,
  "delivered_orders": 80,
  "cancelled_orders": 5,
  "total_revenue": 15000.50
}
```

---

### Newsletter Endpoints

#### POST /api/newsletter/subscribe
Subscribe to newsletter. **[Public]**

**Request Body:**
```json
{
  "email": "user@example.com",
  "first_name": "John",      // optional
  "last_name": "Doe"          // optional
}
```

**Response:** `201 Created`
```json
{
  "message": "Successfully subscribed to newsletter",
  "subscription": {
    "email": "user@example.com",
    "subscribed_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST /api/newsletter/unsubscribe
Unsubscribe from newsletter. **[Public]**

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Successfully unsubscribed from newsletter"
}
```

#### GET /api/newsletter
Get all newsletter subscriptions (paginated). **[Requires Admin]**

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page (default: 50)
- `subscribed` (optional): Filter by subscription status (true/false)

**Response:** `200 OK`
```json
{
  "subscriptions": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_subscribed": true,
      "brevo_contact_id": "123456",
      "subscribed_at": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 3
}
```

#### GET /api/newsletter/stats
Get newsletter statistics. **[Requires Admin]**

**Response:** `200 OK`
```json
{
  "total_subscriptions": 150,
  "active_subscriptions": 145,
  "unsubscribed": 5,
  "new_today": 3,
  "new_this_week": 15,
  "new_this_month": 48
}
```

#### POST /api/newsletter/sync-brevo
Sync local subscriptions with Brevo. **[Requires Admin]**

**Response:** `200 OK`
```json
{
  "message": "Sync completed",
  "synced": 10,
  "errors": 0
}
```

#### DELETE /api/newsletter/:email
Delete subscription by email. **[Requires Admin]**

---

### Product Endpoints

#### GET /api/products
Get all products (paginated). **[Public]**

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `isActive` (optional): Filter by active status (true/false)

**Response:** `200 OK`
```json
{
  "products": [
    {
      "id": 1,
      "title": "The Adventures of Emma",
      "description": "A magical story about...",
      "price": 24.99,
      "currency": "USD",
      "image_url": "/book-emma.jpg",
      "stock_quantity": 100,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 6,
  "page": 1,
  "totalPages": 1
}
```

#### GET /api/products/:id
Get product by ID. **[Public]**

#### POST /api/products
Create a new product. **[Requires Admin]**

**Request Body:**
```json
{
  "title": "New Storybook",
  "description": "An amazing tale...",
  "price": 29.99,
  "currency": "USD",
  "image_url": "/book-new.jpg",
  "stock_quantity": 50,
  "is_active": true
}
```

#### PUT /api/products/:id
Update product by ID. **[Requires Admin]**

#### PATCH /api/products/:id/stock
Update product stock quantity. **[Requires Admin]**

**Request Body:**
```json
{
  "quantity": 10
}
```
Note: Can be positive (add stock) or negative (remove stock)

#### DELETE /api/products/:id
Delete product by ID. **[Requires Admin]**

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content to return
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Database Schema

### Newsletter Subscriptions Table
- `id` - Primary key
- `email` - Unique email address
- `first_name`, `last_name` - Subscriber name (optional)
- `is_subscribed` - Subscription status
- `brevo_contact_id` - Brevo contact ID (for sync)
- `subscribed_at` - Subscription timestamp
- `unsubscribed_at` - Unsubscribe timestamp
- `created_at`, `updated_at` - Timestamps

### Users Table
- `id` - Primary key
- `email` - Unique user email
- `password_hash` - Hashed password
- `first_name`, `last_name` - User name
- `phone`, `address`, `city`, `postal_code`, `country` - Contact information
- `is_admin` - Admin flag
- `is_active` - Account status
- `created_at`, `updated_at`, `last_login` - Timestamps

### Products Table
- `id` - Primary key
- `title` - Product name
- `description` - Product description
- `price` - Product price
- `currency` - Currency code
- `image_url` - Product image
- `stock_quantity` - Available stock
- `is_active` - Product status
- `created_at`, `updated_at` - Timestamps

### Orders Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `order_number` - Unique order identifier
- `status` - Order status enum
- `total_amount` - Order total
- `currency` - Currency code
- Shipping and billing address fields
- `notes` - Order notes
- `created_at`, `updated_at`, `shipped_at`, `delivered_at` - Timestamps

### Order Items Table
- `id` - Primary key
- `order_id` - Foreign key to orders
- `product_id` - Foreign key to products
- `product_name` - Product name snapshot
- `quantity` - Quantity ordered
- `unit_price` - Price per unit at time of order
- `total_price` - Total for this item
- `created_at` - Timestamp

---

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ Error handling without data leaks

---

## Development

### Database Commands

```bash
# Run migrations (create tables)
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### Development Server

```bash
# Start with hot reload
npm run dev
```

### Build for Production

```bash
# Compile TypeScript
npm run build

# Run production build
npm start
```

---

## Testing the API

You can test the API using:

1. **cURL:**
   ```bash
   # Register a user
   curl -X POST http://localhost:3001/api/users/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}'

   # Login
   curl -X POST http://localhost:3001/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'

   # Get products
   curl http://localhost:3001/api/products
   ```

2. **Postman/Insomnia:** Import the endpoints and test interactively

3. **Browser:** For GET endpoints without authentication

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | storybook_wonder |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `PORT` | API server port | 3001 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:5173 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `BREVO_API_KEY` | Brevo API key for newsletter | - |
| `BREVO_LIST_ID` | Brevo list ID for subscribers | - |

---

## License

MIT

---

## Support

For issues or questions, please contact the development team.

