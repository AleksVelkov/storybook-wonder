-- Create cart items table to persist cart across sessions and devices
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_name_en TEXT NOT NULL,
  image TEXT,
  formats_book INTEGER DEFAULT 0,
  formats_audiobook INTEGER DEFAULT 0,
  formats_digital INTEGER DEFAULT 0,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  personalization_data TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id, formats_book, formats_audiobook, formats_digital)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id);

-- Trigger to update updated_at
CREATE TRIGGER IF NOT EXISTS update_cart_items_timestamp 
AFTER UPDATE ON cart_items 
BEGIN
  UPDATE cart_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;


