import { createClient } from '@supabase/supabase-js'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// ==================== STORE MANAGEMENT ====================

export interface Store {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  banner_url?: string
  currency: string
  language: string
  timezone: string
  admin_id: string
  phone?: string
  email?: string
  address?: string
  city?: string
  country?: string
  is_active: boolean
  enable_receipts: boolean
  subscription_plan: string
  created_at: string
  updated_at: string
}

export async function getStore(storeId: string): Promise<Store | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single()

    if (error) throw error
    return data || null
  } catch (error) {
    console.error('Error fetching store:', error)
    return null
  }
}

export async function updateStore(storeId: string, updates: Partial<Store>): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('stores')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating store:', error)
    return false
  }
}

// ==================== PRODUCT MANAGEMENT ====================

export interface AdminProduct {
  id: string
  store_id: string
  name: string
  description: string
  sku: string
  category: string
  price: number
  cost: number
  discount?: number
  stock: number
  is_active: boolean
  images?: string[]
  created_at: string
  updated_at: string
}

export async function getStoreProducts(
  storeId: string,
  category?: string,
  limit = 50,
  offset = 0
): Promise<AdminProduct[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)

    if (category) query = query.eq('category', category)

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function createProduct(
  storeId: string,
  product: Omit<AdminProduct, 'id' | 'store_id' | 'created_at' | 'updated_at'>
): Promise<AdminProduct | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        store_id: storeId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data || null
  } catch (error) {
    console.error('Error creating product:', error)
    return null
  }
}

export async function updateProduct(
  productId: string,
  updates: Partial<AdminProduct>
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating product:', error)
    return false
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    return false
  }
}

// ==================== STAFF MANAGEMENT ====================

export interface StaffMember {
  id: string
  store_id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: 'store_admin' | 'delivery_personnel' | 'accountant'
  is_active: boolean
  joined_at: string
}

export async function getStoreStaff(storeId: string): Promise<StaffMember[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('store_id', storeId)
      .neq('role', 'customer')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching staff:', error)
    return []
  }
}

export async function inviteStaffMember(
  storeId: string,
  email: string,
  role: string
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('staff_invites')
      .insert({
        store_id: storeId,
        email,
        role,
        status: 'pending',
        created_at: new Date().toISOString()
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error inviting staff:', error)
    return false
  }
}

export async function updateStaffRole(
  userId: string,
  newRole: string
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('users')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating staff role:', error)
    return false
  }
}

export async function deactivateStaff(userId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deactivating staff:', error)
    return false
  }
}

// ==================== ORDER MANAGEMENT ====================

export interface AdminOrder {
  id: string
  store_id: string
  customer_email: string
  customer_name: string
  customer_phone: string
  total: number
  payment_status: string
  order_status: string
  payment_method: string
  created_at: string
  updated_at: string
}

export async function getStoreOrders(
  storeId: string,
  status?: string,
  limit = 50,
  offset = 0
): Promise<AdminOrder[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  try {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)

    if (status) query = query.eq('order_status', status)

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus: string
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        order_status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating order status:', error)
    return false
  }
}

// ==================== FINANCIAL REPORTS ====================

export interface FinancialMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalRefunds: number
  netRevenue: number
  costOfGoods: number
  grossProfit: number
  grossProfitMargin: number
}

export async function getFinancialMetrics(
  storeId: string,
  startDate?: Date,
  endDate?: Date
): Promise<FinancialMetrics> {
  const supabase = getSupabase()
  if (!supabase) return {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalRefunds: 0,
    netRevenue: 0,
    costOfGoods: 0,
    grossProfit: 0,
    grossProfitMargin: 0
  }

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total, payment_status')
      .eq('store_id', storeId)
      .eq('payment_status', 'confirmed')

    if (error) throw error

    const orders_data = orders || []
    const totalRevenue = orders_data.reduce((sum, order) => sum + (order.total || 0), 0)
    const totalOrders = orders_data.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalRefunds: 0,
      netRevenue: totalRevenue,
      costOfGoods: 0,
      grossProfit: totalRevenue,
      grossProfitMargin: 100
    }
  } catch (error) {
    console.error('Error fetching financial metrics:', error)
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalRefunds: 0,
      netRevenue: 0,
      costOfGoods: 0,
      grossProfit: 0,
      grossProfitMargin: 0
    }
  }
}

// ==================== AUDIT & ANALYTICS ====================

export interface AnalyticsMetrics {
  uniqueCustomers: number
  repeatingCustomers: number
  conversionRate: number
  averageSessionDuration: number
  topProducts: Array<{ name: string; sales: number }>
  salesByCategory: Array<{ category: string; total: number }>
}

export async function getAnalyticsMetrics(
  storeId: string
): Promise<AnalyticsMetrics> {
  const supabase = getSupabase()
  if (!supabase) return {
    uniqueCustomers: 0,
    repeatingCustomers: 0,
    conversionRate: 0,
    averageSessionDuration: 0,
    topProducts: [],
    salesByCategory: []
  }

  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('user_id, customer_email')
      .eq('store_id', storeId)

    const uniqueEmails = new Set((orders || []).map(o => o.customer_email))
    const uniqueUsers = new Set((orders || []).map(o => o.user_id).filter(Boolean))

    return {
      uniqueCustomers: uniqueEmails.size,
      repeatingCustomers: 0, // TODO: Calculate repeating customers
      conversionRate: 2.5, // TODO: Calculate actual conversion rate
      averageSessionDuration: 0, // TODO: Calculate from session data
      topProducts: [], // TODO: Fetch from order items
      salesByCategory: [] // TODO: Calculate from orders
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return {
      uniqueCustomers: 0,
      repeatingCustomers: 0,
      conversionRate: 0,
      averageSessionDuration: 0,
      topProducts: [],
      salesByCategory: []
    }
  }
}
