import { createClient } from '@supabase/supabase-js'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export type DeliveryStatus = 'pending' | 'assigned' | 'picking_up' | 'in_transit' | 'delivered' | 'failed'
export type DeliveryType = 'standard' | 'express' | 'overnight'

export interface Delivery {
  id: string
  order_id: string
  delivery_person_id?: string
  delivery_person_name?: string
  delivery_person_phone?: string
  current_status: DeliveryStatus
  delivery_type: DeliveryType
  estimated_delivery: string
  actual_delivery?: string
  pickup_address: string
  delivery_address: string
  customer_name: string
  customer_phone: string
  lat?: number
  lng?: number
  notes?: string
  signature_proof?: string
  photo_proof?: string
  created_at: string
  updated_at: string
}

export interface DeliveryStatusHistory {
  id: string
  delivery_id: string
  status: DeliveryStatus
  timestamp: string
  notes?: string
  location?: {
    lat: number
    lng: number
  }
}

export interface DeliveryPerson {
  id: string
  store_id: string
  user_id: string
  name: string
  phone: string
  email: string
  vehicle_type: string
  current_status: 'available' | 'on_delivery' | 'break' | 'offline'
  current_lat?: number
  current_lng?: number
  assigned_deliveries: number
  completed_deliveries: number
  rating: number
  created_at: string
  updated_at: string
}

/**
 * Create delivery for an order
 */
export async function createDelivery(
  orderId: string,
  deliveryInfo: {
    pickupAddress: string
    deliveryAddress: string
    customerName: string
    customerPhone: string
    deliveryType: DeliveryType
    estimatedDelivery: string
  }
): Promise<Delivery | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('deliveries')
      .insert({
        order_id: orderId,
        current_status: 'pending',
        delivery_type: deliveryInfo.deliveryType,
        estimated_delivery: deliveryInfo.estimatedDelivery,
        pickup_address: deliveryInfo.pickupAddress,
        delivery_address: deliveryInfo.deliveryAddress,
        customer_name: deliveryInfo.customerName,
        customer_phone: deliveryInfo.customerPhone,
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error creating delivery:', error)
    return null
  }
}

/**
 * Get delivery by ID
 */
export async function getDelivery(deliveryId: string): Promise<Delivery | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching delivery:', error)
    return null
  }
}

/**
 * Get delivery by order ID
 */
export async function getDeliveryByOrder(orderId: string): Promise<Delivery | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching delivery:', error)
    return null
  }
}

/**
 * Update delivery status
 */
export async function updateDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus,
  notes?: string,
  location?: { lat: number; lng: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: 'Supabase not initialized' }

    // Update delivery
    const { error: updateError } = await supabase
      .from('deliveries')
      .update({
        current_status: status,
        lat: location?.lat,
        lng: location?.lng,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryId)

    if (updateError) throw updateError

    // Add to history
    const { error: historyError } = await supabase
      .from('delivery_status_history')
      .insert({
        delivery_id: deliveryId,
        status,
        timestamp: new Date().toISOString(),
        notes,
        location,
      })

    if (historyError) throw historyError

    return { success: true }
  } catch (error) {
    console.error('Error updating delivery status:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get delivery status history
 */
export async function getDeliveryHistory(
  deliveryId: string
): Promise<DeliveryStatusHistory[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('delivery_status_history')
      .select('*')
      .eq('delivery_id', deliveryId)
      .order('timestamp', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching delivery history:', error)
    return []
  }
}

/**
 * Get deliveries for a person
 */
export async function getDeliveryPersonAssignments(
  deliveryPersonId: string,
  limit = 20,
  offset = 0
): Promise<Delivery[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('delivery_person_id', deliveryPersonId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return []
  }
}

/**
 * Get pending deliveries for a store
 */
export async function getPendingDeliveries(
  storeId: string,
  limit = 50
): Promise<Delivery[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        orders!inner(store_id)
      `)
      .eq('orders.store_id', storeId)
      .in('current_status', ['pending', 'assigned', 'picking_up', 'in_transit'])
      .order('estimated_delivery', { ascending: true })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching pending deliveries:', error)
    return []
  }
}

/**
 * Assign delivery to person
 */
export async function assignDelivery(
  deliveryId: string,
  deliveryPersonId: string,
  deliveryPersonName: string,
  deliveryPersonPhone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: 'Supabase not initialized' }

    const { error } = await supabase
      .from('deliveries')
      .update({
        delivery_person_id: deliveryPersonId,
        delivery_person_name: deliveryPersonName,
        delivery_person_phone: deliveryPersonPhone,
        current_status: 'assigned',
      })
      .eq('id', deliveryId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error assigning delivery:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Add proof (photo or signature)
 */
export async function addDeliveryProof(
  deliveryId: string,
  proofType: 'photo' | 'signature',
  proofUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: 'Supabase not initialized' }

    const updateData = proofType === 'photo' 
      ? { photo_proof: proofUrl }
      : { signature_proof: proofUrl }

    const { error } = await supabase
      .from('deliveries')
      .update(updateData)
      .eq('id', deliveryId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error adding proof:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get all delivery persons for a store
 */
export async function getDeliveryPersons(
  storeId: string,
  limit = 50
): Promise<DeliveryPerson[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('delivery_persons')
      .select('*')
      .eq('store_id', storeId)
      .eq('current_status', 'available')
      .order('completed_deliveries', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching delivery persons:', error)
    return []
  }
}

/**
 * Update delivery person location
 */
export async function updateDeliveryPersonLocation(
  personId: string,
  lat: number,
  lng: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: 'Supabase not initialized' }

    const { error } = await supabase
      .from('delivery_persons')
      .update({
        current_lat: lat,
        current_lng: lng,
        updated_at: new Date().toISOString(),
      })
      .eq('id', personId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error updating location:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get delivery statistics
 */
export async function getDeliveryStats(storeId: string): Promise<{
  pending: number
  assigned: number
  inTransit: number
  completed: number
  failed: number
}> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { pending: 0, assigned: 0, inTransit: 0, completed: 0, failed: 0 }

    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        current_status,
        orders!inner(store_id)
      `)
      .eq('orders.store_id', storeId)

    if (error) throw error

    const stats = {
      pending: 0,
      assigned: 0,
      inTransit: 0,
      completed: 0,
      failed: 0,
    }

    data?.forEach((item: any) => {
      switch (item.current_status) {
        case 'pending':
          stats.pending++
          break
        case 'assigned':
          stats.assigned++
          break
        case 'picking_up':
        case 'in_transit':
          stats.inTransit++
          break
        case 'delivered':
          stats.completed++
          break
        case 'failed':
          stats.failed++
          break
      }
    })

    return stats
  } catch (error) {
    console.error('Error fetching delivery stats:', error)
    return { pending: 0, assigned: 0, inTransit: 0, completed: 0, failed: 0 }
  }
}
