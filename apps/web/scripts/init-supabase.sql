-- Create products table for Timeless Templates
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image TEXT NOT NULL,
  description TEXT,
  download_url TEXT,
  store_id TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on store_id for faster queries
CREATE INDEX IF NOT EXISTS products_store_id_idx ON products(store_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products(created_at DESC);

-- Insert sample data
INSERT INTO products (name, price, image, description, category) VALUES
(
  'Elegant Ceremony Script',
  49.99,
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
  'Beautiful ceremony details and vow templates for your special moment',
  'Ceremony'
),
(
  'Modern Reception Design',
  59.99,
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop',
  'Contemporary reception layouts, menu designs, and table setups',
  'Reception'
),
(
  'Premium Guest Book',
  39.99,
  'https://images.unsplash.com/photo-1583708844611-e9e4a78dbe1a?w=800&h=600&fit=crop',
  'Elegant guest book pages, signatures section, and memory keepsakes',
  'Stationery'
);

-- Enable RLS (Row Level Security) if needed for multi-tenant support
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (optional - remove if you need auth)
-- CREATE POLICY "Products are viewable by everyone" 
--   ON products FOR SELECT 
--   USING (true);

-- Create policy for authenticated users to manage products
-- CREATE POLICY "Users can manage their own products"
--   ON products FOR ALL
--   USING (store_id = current_user_id())
--   WITH CHECK (store_id = current_user_id());
