import { createClient } from '@supabase/supabase-js'
import { api } from './api'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export type PaymentMethod = 'card' | 'vodafone_cash' | 'instapay' | 'whatsapp'
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  store_id: string
  user_id?: string
  customer_email: string
  customer_name: string
  customer_phone: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  customizations?: Record<string, any>
}

export interface Payment {
  id: string
  order_id: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  reference: string
  external_id?: string
  created_at: string
  updated_at: string
}

/**
 * Create an order from cart items
 */
export async function createOrder(
  storeId: string,
  customerInfo: {
    email: string
    name: string
    phone: string
  },
  items: OrderItem[],
  paymentMethod: PaymentMethod,
  userId?: string,
  notes?: string
): Promise<Order | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1 // 10% tax
    const shipping = subtotal > 100 ? 0 : 50 // Free shipping over $100
    const total = subtotal + tax + shipping

    // Use custom API instead of direct Supabase call
    const data = await api.orders.create({
      storeId,
      userId: userId || null,
      customerEmail: customerInfo.email,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      items,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      notes,
    })

    return data as any
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating order:', message, error)
    return null
  }
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

/**
 * Get user orders
 */
export async function getUserOrders(
  userId: string,
  limit = 20,
  offset = 0
): Promise<Order[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return []
  }
}

/**
 * Initiate Paymob payment
 */
export async function initiatePaymobPayment(
  orderId: string,
  amount: number,
  customerEmail: string,
  customerPhone: string
): Promise<{ authToken?: string; iframeId?: string; error?: string }> {
  try {
    // Mock Paymob integration
    // In production, call: https://accept.paymob.com/api/auth/tokens
    const mockAuthToken = 'paymob_auth_' + Math.random().toString(36).substr(2, 9)
    const mockIframeId = Math.random().toString(36).substr(2, 9)

    // Log payment initiation
    console.log('[v0] Paymob payment initiated:', {
      orderId,
      amount,
      customerEmail,
      authToken: mockAuthToken,
    })

    return {
      authToken: mockAuthToken,
      iframeId: mockIframeId,
    }
  } catch (error) {
    console.error('Error initiating Paymob payment:', error)
    return { error: String(error) }
  }
}

/**
 * Confirm Paymob payment
 */
export async function confirmPaymobPayment(
  orderId: string,
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: 'Supabase not initialized' }

    // Update order payment status
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'confirmed',
        order_status: 'processing',
      })
      .eq('id', orderId)

    if (error) throw error

    // Create payment record
    await supabase.from('payments').insert({
      order_id: orderId,
      amount: 0, // Amount from order
      currency: 'EGP',
      method: 'card',
      status: 'confirmed',
      reference: transactionId,
      external_id: transactionId,
    })

    return { success: true }
  } catch (error) {
    console.error('Error confirming payment:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Manual payment confirmation (for WhatsApp/Cash payments)
 */
export async function confirmManualPayment(
  orderId: string,
  method: PaymentMethod,
  reference: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: 'Supabase not initialized' }

    // Update order
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: 'confirmed',
        order_status: 'processing',
      })
      .eq('id', orderId)

    if (orderError) throw orderError

    // Create payment record
    const { error: paymentError } = await supabase.from('payments').insert({
      order_id: orderId,
      amount: 0,
      currency: 'EGP',
      method,
      status: 'confirmed',
      reference,
    })

    if (paymentError) throw paymentError

    return { success: true }
  } catch (error) {
    console.error('Error confirming manual payment:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get payment by order
 */
export async function getPaymentByOrder(orderId: string): Promise<Payment | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching payment:', error)
    return null
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: 'Supabase not initialized' }

    const { error } = await supabase
      .from('orders')
      .update({
        order_status: 'cancelled',
        payment_status: 'refunded',
      })
      .eq('id', orderId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get store orders (admin)
 */
export async function getStoreOrders(
  storeId: string,
  limit = 50,
  offset = 0
): Promise<Order[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching store orders:', error)
    return []
  }
}
