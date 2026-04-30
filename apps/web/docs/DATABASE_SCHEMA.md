# Database Schema Documentation

## Table of Contents
1. [Overview](#overview)
2. [Core Tables](#core-tables)
3. [User & Authentication Tables](#user--authentication-tables)
4. [Product Tables](#product-tables)
5. [Order & Payment Tables](#order--payment-tables)
6. [Delivery & Tracking Tables](#delivery--tracking-tables)
7. [Admin & Management Tables](#admin--management-tables)
8. [Indexes & Performance](#indexes--performance)
9. [RLS Policies](#rls-policies)

---

## Overview

The database is built on PostgreSQL via Supabase and implements multi-tenancy with Row Level Security (RLS).

**Key Principles:**
- All tables have `store_id` for multi-tenancy (except auth tables)
- RLS policies ensure data isolation between stores
- Timestamps use UTC with `created_at`, `updated_at` columns
- Soft deletes via `deleted_at` timestamp (where applicable)

---

## Core Tables

### stores

Represents a single store instance in the multi-store platform.

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  currency VARCHAR(3) DEFAULT 'USD',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  subscription_plan VARCHAR(50) DEFAULT 'starter',
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

INDEX ON stores(admin_id);
INDEX ON stores(slug);
INDEX ON stores(is_active);
```

---

## User & Authentication Tables

### users

Extends Supabase auth.users with additional profile data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  -- Roles: 'super_admin', 'store_admin', 'accountant', 'delivery_personnel', 'customer'
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  language_preference VARCHAR(10) DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

INDEX ON users(store_id);
INDEX ON users(role);
INDEX ON users(is_active);
```

### staff_invites

Invitation tokens for inviting staff to stores.

```sql
CREATE TABLE staff_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invite_token VARCHAR(255) NOT NULL UNIQUE,
  is_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INDEX ON staff_invites(store_id);
INDEX ON staff_invites(invite_token);
INDEX ON staff_invites(email);
INDEX ON staff_invites(is_accepted);
```

---

## Product Tables

### products

Product catalog for each store.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100),
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  video_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(store_id, slug)
);

INDEX ON products(store_id);
INDEX ON products(category);
INDEX ON products(is_published);
INDEX ON products(created_at DESC);
```

### product_images

Multi-image support for products.

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INDEX ON product_images(product_id);
INDEX ON product_images(display_order);
```

### product_themes

Available themes/colors for each product.

```sql
CREATE TABLE product_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color_code VARCHAR(7),
  color_name VARCHAR(100),
  description TEXT,
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INDEX ON product_themes(product_id);
INDEX ON product_themes(store_id);
```

---

## Order & Payment Tables

### orders

Customer orders with items and totals.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  -- Statuses: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  -- Payment Statuses: 'unpaid', 'pending', 'paid', 'refunded', 'failed'
  subtotal DECIMAL(12, 2) NOT NULL,
  tax DECIMAL(12, 2) DEFAULT 0,
  shipping_fee DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

INDEX ON orders(store_id);
INDEX ON orders(user_id);
INDEX ON orders(order_number);
INDEX ON orders(status);
INDEX ON orders(payment_status);
INDEX ON orders(created_at DESC);
```

### order_items

Individual items in an order with customizations.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  selected_theme UUID REFERENCES product_themes(id),
  selected_color VARCHAR(7),
  customizations JSONB,
  -- Example: { "size": "A4", "quantity": 100, "paper_type": "matte" }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INDEX ON order_items(order_id);
INDEX ON order_items(product_id);
```

### payments

Payment transaction records.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  method VARCHAR(50) NOT NULL,
  -- Methods: 'paymob_card', 'vodafone_cash', 'instapay', 'whatsapp'
  status VARCHAR(50) DEFAULT 'pending',
  -- Statuses: 'pending', 'processing', 'completed', 'failed', 'refunded'
  transaction_id VARCHAR(255),
  payment_gateway_response JSONB,
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INDEX ON payments(store_id);
INDEX ON payments(order_id);
INDEX ON payments(method);
INDEX ON payments(status);
INDEX ON payments(transaction_id);
```

---

## Delivery & Tracking Tables

### deliveries

Delivery tracking for orders.

```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  -- Statuses: 'pending', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned'
  assigned_personnel_id UUID REFERENCES auth.users(id),
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivery_attempted_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  returned_at TIMESTAMP WITH TIME ZONE,
  delivery_notes TEXT,
  delivery_photo_url TEXT,
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  delivery_fee DECIMAL(10, 2),
  estimated_delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INDEX ON deliveries(store_id);
INDEX ON deliveries(order_id);
INDEX ON deliveries(tracking_number);
INDEX ON deliveries(status);
INDEX ON deliveries(assigned_personnel_id);
```

### delivery_status_history

Timeline of delivery status changes.

```sql
CREATE TABLE delivery_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  note TEXT,
  location JSONB,
  -- Example: { "latitude": 30.0444, "longitude": 31.2357, "accuracy": 10 }
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INDEX ON delivery_status_history(delivery_id);
INDEX ON delivery_status_history(created_at);
```

---

## Admin & Management Tables

### audit_logs

System audit trail for compliance.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  before_data JSONB,
  after_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INDEX ON audit_logs(store_id);
INDEX ON audit_logs(user_id);
INDEX ON audit_logs(action);
INDEX ON audit_logs(entity_type);
```

### notifications

User notifications for orders, deliveries, payments.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  -- Types: 'order_confirmation', 'payment_received', 'shipped', 'delivery_update', 'refund'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_order_id UUID REFERENCES orders(id),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_via VARCHAR(50),
  -- Via: 'in_app', 'email', 'sms', 'whatsapp'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INDEX ON notifications(store_id);
INDEX ON notifications(user_id);
INDEX ON notifications(is_read);
INDEX ON notifications(created_at DESC);
```

### financial_reports

Pre-generated financial summaries.

```sql
CREATE TABLE financial_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(12, 2),
  total_orders INTEGER,
  total_refunds DECIMAL(12, 2),
  payment_breakdown JSONB,
  product_breakdown JSONB,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(store_id, period_start, period_end)
);

INDEX ON financial_reports(store_id);
INDEX ON financial_reports(period_start);
```

---

## Indexes & Performance

### Critical Indexes

```sql
-- Multi-tenancy queries
CREATE INDEX idx_products_store_published ON products(store_id, is_published);
CREATE INDEX idx_orders_store_status ON orders(store_id, status);
CREATE INDEX idx_payments_store_order ON payments(store_id, order_id);

-- Time-based queries
CREATE INDEX idx_orders_created_desc ON orders(created_at DESC);
CREATE INDEX idx_payments_created_desc ON payments(created_at DESC);

-- Search queries
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_category ON products(category);

-- Delivery queries
CREATE INDEX idx_deliveries_personnel ON deliveries(assigned_personnel_id, status);
```

---

## RLS Policies

### Store Data Isolation

```sql
-- Customers can only see published products
CREATE POLICY "customers_select_products" ON products
  FOR SELECT USING (is_published = true);

-- Store admins see their own store's data
CREATE POLICY "admin_select_own_store" ON products
  FOR SELECT USING (store_id = (
    SELECT store_id FROM users WHERE id = auth.uid()
  ));

-- Only store admins/super admins can insert
CREATE POLICY "admin_insert_products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('store_admin', 'super_admin')
      AND store_id = products.store_id
    )
  );
```

### User-Specific Access

```sql
-- Users can only see their own orders
CREATE POLICY "user_select_own_orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

-- Users can only see their own notifications
CREATE POLICY "user_select_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
```

### Admin Permissions

```sql
-- Accountants see financial data for their store
CREATE POLICY "accountant_view_financials" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'accountant'
      AND u.store_id = payments.store_id
    )
  );
```

---

## Migration Scripts

### Initial Setup

See `scripts/init-database.sql` for complete schema creation.

### Seed Data

```sql
-- Create super admin user
INSERT INTO users (id, role, first_name, last_name, is_verified)
VALUES (auth.uid(), 'super_admin', 'Super', 'Admin', true);

-- Create sample store
INSERT INTO stores (name, slug, admin_id)
VALUES ('Sample Store', 'sample-store', auth.uid());
```

---

## Backup & Recovery

### Automated Backups

Supabase performs daily backups. Access via:
- Supabase Console → Database → Backups
- Automatic retention: 7 days (Pro plan) / 30 days (Enterprise)

### Manual Backup

```bash
# Export entire database
pg_dump postgresql://user:password@host:5432/database > backup.sql

# Import backup
psql postgresql://user:password@host:5432/database < backup.sql
```

---

## Performance Tuning

### Query Optimization

```sql
-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM orders WHERE store_id = $1 AND status = $2;

-- Vacuum for index optimization
VACUUM ANALYZE;
```

### Monitoring

Monitor in Supabase Console:
- Database Health
- Query Performance
- Disk usage
- Active connections
