import { createClient } from '@supabase/supabase-js'
import bcryptjs from 'bcryptjs'

// Create standard client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Create admin client
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

/**
 * Hash password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

/**
 * Create a new user account
 */
export async function createUserAccount(
  email: string,
  password: string,
  name: string,
  storeId?: string
) {
  try {
    // Hash password
    const passwordHash = await hashPassword(password)

    // Create auth user
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          store_id: storeId,
          role: 'store_admin'
        },
      })

    if (authError) throw authError

    // 2. Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        name,
        password_hash: passwordHash,
        store_id: storeId || null,
        role: 'store_admin',
        is_active: true,
      })

    if (profileError) throw profileError

    // 3. If no storeId was provided, create a default store for this new admin
    if (!storeId) {
      const { data: newStore, error: storeError } = await supabaseAdmin
        .from('stores')
        .insert({
          name: `${name}'s Store`,
          owner_id: authUser.user.id,
          is_active: true,
          settings: {}
        })
        .select()
        .single()

      if (!storeError && newStore) {
        // Link the user to the new store
        await supabaseAdmin
          .from('users')
          .update({ store_id: newStore.id })
          .eq('id', authUser.user.id)
      }
    }

    return { success: true, userId: authUser.user.id }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string) {
  try {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return {
      success: true,
      session: data.session,
      user: data.user,
    }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Get current user session
 */
export async function getCurrentSession() {
  try {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    return { session: data.session, user: data.session?.user || null }
  } catch (error) {
    return { session: null, user: null, error: String(error) }
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  try {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Get user profile with role and store
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error

    return { success: true, user: data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Create a store (Super Admin only)
 */
export async function createStore(
  name: string,
  description: string,
  ownerId: string,
  settings: Record<string, any> = {}
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('stores')
      .insert({
        name,
        description,
        owner_id: ownerId,
        settings,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, store: data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Get user stores
 */
export async function getUserStores(userId: string, role: string) {
  try {
    let query = supabase.from('stores').select('*')

    if (role === 'super_admin') {
      // Super admin sees all stores
      query = query
    } else if (role === 'store_admin') {
      // Store admin sees their owned stores
      query = query.eq('owner_id', userId)
    } else {
      // Other users see their assigned store
      query = query.eq('user_store_assignments.user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, stores: data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Check user permissions for store
 */
export async function checkStorePermission(
  userId: string,
  storeId: string,
  requiredRole: string
) {
  try {
    const { data, error } = await supabase
      .from('user_store_assignments')
      .select('role')
      .eq('user_id', userId)
      .eq('store_id', storeId)
      .single()

    if (error) throw error

    const roles = ['customer', 'delivery_personnel', 'accountant', 'store_admin']
    const userRoleIndex = roles.indexOf(data.role)
    const requiredRoleIndex = roles.indexOf(requiredRole)

    return userRoleIndex >= requiredRoleIndex
  } catch (error) {
    return false
  }
}
