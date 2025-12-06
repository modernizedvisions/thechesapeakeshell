CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  slug TEXT,
  description TEXT,
  price_cents INTEGER,
  category TEXT,
  image_url TEXT,
  -- Extended fields for inventory + Stripe wiring
  image_urls_json TEXT,
  is_active INTEGER DEFAULT 1,
  is_one_off INTEGER DEFAULT 1,
  is_sold INTEGER DEFAULT 0,
  quantity_available INTEGER DEFAULT 1,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  collection TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  stripe_payment_intent_id TEXT,
  total_cents INTEGER,
  customer_email TEXT,
  shipping_name TEXT,
  shipping_address_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  product_id TEXT,
  quantity INTEGER,
  price_cents INTEGER
);
