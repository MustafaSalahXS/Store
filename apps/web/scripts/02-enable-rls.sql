-- Row Level Security (RLS) Policies for Multi-Tenancy
-- This script enables RLS and creates policies for data isolation

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

-- Stores table
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Product images table
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Product themes table
ALTER TABLE product_themes ENABLE ROW LEVEL SECURITY;

-- Orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Order items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Deliveries table
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Delivery status history table
ALTER TABLE delivery_status_history ENABLE ROW LEVEL SECURITY;

-- Staff invites table
ALTER TABLE staff_invites ENABLE ROW LEVEL SECURITY;

-- Audit logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Financial reports table
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STORES POLICIES
-- ============================================

-- Super admins can see all stores
CREATE POLICY "super_admin_all_stores" ON stores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'super_admin'
    )
  );

-- Store admins can see their own store
CREATE POLICY "store_admin_own_store" ON stores
  FOR SELECT
  USING (admin_id = auth.uid());

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can see their own data
CREATE POLICY "users_see_own" ON users
  FOR SELECT
  USING (id = auth.uid());

-- Store admins can see their store staff
CREATE POLICY "admin_see_staff" ON users
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- Super admin can see all users
CREATE POLICY "super_admin_all_users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'super_admin'
    )
  );

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Everyone can see published products
CREATE POLICY "published_products_public" ON products
  FOR SELECT
  USING (is_published = true);

-- Admins can see unpublished products from their store
CREATE POLICY "admin_see_own_products" ON products
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- Admins can insert products to their store
CREATE POLICY "admin_insert_products" ON products
  FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- Admins can update their store products
CREATE POLICY "admin_update_products" ON products
  FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- Admins can delete their store products
CREATE POLICY "admin_delete_products" ON products
  FOR DELETE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- ============================================
-- PRODUCT IMAGES POLICIES
-- ============================================

-- Public images of published products are visible
CREATE POLICY "public_images" ON product_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id
      AND p.is_published = true
    )
  );

-- Admins can manage images for their products
CREATE POLICY "admin_manage_images" ON product_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id
      AND p.store_id IN (
        SELECT id FROM stores WHERE admin_id = auth.uid()
      )
    )
  );

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Users can see their own orders
CREATE POLICY "users_see_own_orders" ON orders
  FOR SELECT
  USING (user_id = auth.uid());

-- Store admins can see their store orders
CREATE POLICY "admin_see_own_orders" ON orders
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- Authenticated users can insert orders
CREATE POLICY "users_insert_orders" ON orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can update their store orders
CREATE POLICY "admin_update_orders" ON orders
  FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================

-- Users can see items in their orders
CREATE POLICY "users_see_own_items" ON order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Admins can see items in their store orders
CREATE POLICY "admin_see_own_items" ON order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders o
      WHERE o.store_id IN (
        SELECT id FROM stores WHERE admin_id = auth.uid()
      )
    )
  );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

-- Users can see their payments
CREATE POLICY "users_see_own_payments" ON payments
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Admins can see their store payments
CREATE POLICY "admin_see_own_payments" ON payments
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- Accountants can see their store payments
CREATE POLICY "accountant_see_payments" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'accountant'
      AND u.store_id = payments.store_id
    )
  );

-- ============================================
-- DELIVERIES POLICIES
-- ============================================

-- Users can see their order delivery
CREATE POLICY "users_see_own_delivery" ON deliveries
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Admins can see their store deliveries
CREATE POLICY "admin_see_own_deliveries" ON deliveries
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- Delivery personnel can see assigned deliveries
CREATE POLICY "delivery_see_assigned" ON deliveries
  FOR SELECT
  USING (assigned_personnel_id = auth.uid());

-- Delivery personnel can update assigned deliveries
CREATE POLICY "delivery_update_assigned" ON deliveries
  FOR UPDATE
  USING (assigned_personnel_id = auth.uid());

-- ============================================
-- DELIVERY STATUS HISTORY POLICIES
-- ============================================

-- Users can see history for their deliveries
CREATE POLICY "users_see_history" ON delivery_status_history
  FOR SELECT
  USING (
    delivery_id IN (
      SELECT id FROM deliveries d
      WHERE d.order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
      )
    )
  );

-- Admins can see their store delivery history
CREATE POLICY "admin_see_history" ON delivery_status_history
  FOR SELECT
  USING (
    delivery_id IN (
      SELECT id FROM deliveries d
      WHERE d.store_id IN (
        SELECT id FROM stores WHERE admin_id = auth.uid()
      )
    )
  );

-- ============================================
-- STAFF INVITES POLICIES
-- ============================================

-- Store admins can see their invites
CREATE POLICY "admin_see_own_invites" ON staff_invites
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- Store admins can create invites
CREATE POLICY "admin_create_invites" ON staff_invites
  FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Store admins can see audit logs for their store
CREATE POLICY "admin_see_audit_logs" ON audit_logs
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- System auto-inserts audit logs
CREATE POLICY "system_insert_audit_logs" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can see their own notifications
CREATE POLICY "users_see_own_notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their notifications (mark as read)
CREATE POLICY "users_update_notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "system_insert_notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FINANCIAL REPORTS POLICIES
-- ============================================

-- Accountants can see their store reports
CREATE POLICY "accountant_see_reports" ON financial_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'accountant'
      AND u.store_id = financial_reports.store_id
    )
  );

-- Store admins can see their store reports
CREATE POLICY "admin_see_reports" ON financial_reports
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE admin_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES COMPLETE
-- ============================================
-- All policies created successfully
-- Next step: Run 03-seed-data.sql to add sample data
