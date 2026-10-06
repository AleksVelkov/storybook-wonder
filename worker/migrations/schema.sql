-- Storybook Wonder D1 Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS newsletter_subscriptions;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  is_admin INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

-- Products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Orders table
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total_amount REAL NOT NULL,
  subtotal REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  shipping_cost REAL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  coupon_code TEXT,
  shipping_method TEXT DEFAULT 'standard' CHECK(shipping_method IN ('standard', 'pickup')),
  tracking_number TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  billing_address TEXT,
  billing_city TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  shipped_at TEXT,
  delivered_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Newsletter subscriptions table
CREATE TABLE newsletter_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_subscribed INTEGER DEFAULT 1,
  brevo_contact_id TEXT,
  subscribed_at TEXT DEFAULT (datetime('now')),
  unsubscribed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscribed ON newsletter_subscriptions(is_subscribed);

-- Triggers to automatically update updated_at timestamp
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users 
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_products_timestamp 
AFTER UPDATE ON products 
BEGIN
  UPDATE products SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK(discount_percentage > 0 AND discount_percentage <= 100),
  valid_from TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT NULL,
  max_uses_per_user INTEGER DEFAULT NULL,
  created_by INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Coupon usage tracking table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  used_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_user ON coupon_usage(coupon_id, user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);

CREATE TRIGGER update_orders_timestamp 
AFTER UPDATE ON orders 
BEGIN
  UPDATE orders SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_newsletter_timestamp 
AFTER UPDATE ON newsletter_subscriptions 
BEGIN
  UPDATE newsletter_subscriptions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

