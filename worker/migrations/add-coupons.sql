-- Add coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK(discount_percentage > 0 AND discount_percentage <= 100),
  valid_from TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT NULL,
  created_by INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create index for faster coupon lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- Add coupon_code column to orders table if not exists
ALTER TABLE orders ADD COLUMN coupon_code TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN shipping_cost REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN shipping_method TEXT DEFAULT 'standard';


