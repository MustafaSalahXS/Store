import { createClient } from '@supabase/supabase-js'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export interface Product {
  id: string
  store_id: string
  name: string
  description: string
  price: number
  discount_price?: number | null
  category: string
  sku: string
  stock: number
  is_active: boolean
  images?: string[]
  image?: string
  video_url?: string | null
  customizable: boolean
  customization_options?: Record<string, any> | null
  download_url?: string | null
  created_at: string
  updated_at: string
}

export interface ProductFilters {
  storeId: string
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  limit?: number
  offset?: number
}

/**
 * Fetch all products with filters
 */
export async function getProducts(filters: ProductFilters | string | null): Promise<Product[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    let query = supabase.from('products').select('*')
    
    // Handle legacy string parameter (storeId)
    if (typeof filters === 'string') {
      query = query.eq('store_id', filters)
    } else if (filters) {
      query = query.eq('store_id', filters.storeId)
      
      if (filters.category) query = query.eq('category', filters.category)
      if (filters.inStockOnly) query = query.gt('stock', 0)
      if (filters.minPrice) query = query.gte('price', filters.minPrice)
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
      
      const offset = filters.offset || 0
      const limit = filters.limit || 20
      query = query.range(offset, offset + limit - 1)
    }
    
    const { data, error } = await query
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching products:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

/**
 * Fetch a single product by ID
 */
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    
    if (error) {
      console.error('Error fetching product:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  storeId: string,
  category: string,
  limit = 12
): Promise<Product[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('category', category)
      .eq('is_active', true)
      .limit(limit)

    if (error) {
      console.error('Error fetching category products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching category products:', error)
    return []
  }
}

/**
 * Search products
 */
export async function searchProducts(
  storeId: string,
  query: string,
  limit = 20
): Promise<Product[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const searchTerm = `%${query}%`

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(limit)

    if (error) {
      console.error('Error searching products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(storeId: string, limit = 8): Promise<Product[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .gt('stock', 0)
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching featured products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

/**
 * Get all categories for a store
 */
export async function getCategories(storeId: string): Promise<string[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    const categories = data?.map(p => p.category).filter(Boolean) || []
    return [...new Set(categories)]
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

/**
 * Check product availability
 */
export async function checkProductAvailability(
  productId: string,
  quantity: number
): Promise<{ available: boolean; currentStock: number }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { available: false, currentStock: 0 }

    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single()

    if (error) {
      console.error('Error checking availability:', error)
      return { available: false, currentStock: 0 }
    }

    const available = data?.stock >= quantity
    return { available, currentStock: data?.stock || 0 }
  } catch (error) {
    console.error('Error checking availability:', error)
    return { available: false, currentStock: 0 }
  }
}

/**
 * Create a new product (admin only)
 */
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating product:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error creating product:', error)
    return null
  }
}

/**
 * Update a product (admin only)
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating product:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error updating product:', error)
    return null
  }
}

/**
 * Delete a product (admin only)
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const supabase = getSupabase()
    if (!supabase) return false

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting product:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    return false
  }
}
