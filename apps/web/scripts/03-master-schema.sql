-- Master Schema for E-Commerce Platform
-- Copy and paste this entirely into your Supabase SQL Editor and click RUN.

-- 1. STORES
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS (Custom Profile Table)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER STORE ASSIGNMENTS
CREATE TABLE IF NOT EXISTS user_store_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  category TEXT,
  sku TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  image TEXT,
  video_url TEXT,
  customizable BOOLEAN DEFAULT false,
  customization_options JSONB DEFAULT '{}'::jsonb,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC NOT NULL,
  method TEXT,
  status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DELIVERIES
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  order_id UUID REFERENCES orders(id),
  delivery_person_id UUID REFERENCES users(id),
  current_status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DELIVERY STATUS HISTORY
CREATE TABLE IF NOT EXISTS delivery_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Demo Store & Products
-- Using DO block to safely retrieve the store ID
DO $$
DECLARE
  new_store_id UUID;
BEGIN
  -- 1. Create a demo store
  INSERT INTO stores (name, description, is_active)
  VALUES ('Timeless Templates Official', 'Premium digital products and templates.', true)
  RETURNING id INTO new_store_id;

  -- 2. Create products linked to the store
  INSERT INTO products (store_id, name, price, image, description, category, is_active) VALUES
  (new_store_id, 'Elegant Ceremony Script', 49.99, 'https://images.unsplash.com/photo-1519741497674-611481863552', 'Beautiful ceremony details', 'Ceremony', true),
  (new_store_id, 'Modern Reception Design', 59.99, 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf', 'Contemporary reception layouts', 'Reception', true);
END $$;
