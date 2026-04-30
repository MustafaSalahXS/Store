import { Product, Order, StoreSettings, Banner, Coupon } from './types'

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000`
  }
  return 'http://localhost:4000'
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getApiUrl()}${path}`
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  }

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const res = await fetch(url, { ...options, headers })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!res.ok) {
    if (isJson) {
      const error = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(error.error || `API error: ${res.status}`)
    }
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }

  if (!isJson) {
    // Return empty object for non-JSON success responses
    return {} as T
  }

  return res.json()
}

// ─── AUTH ─────────────────────────────────────────────────
export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      apiFetch<{ success: boolean; userId: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      apiFetch<{
        success: boolean
        user: { id: string; email: string; name: string; role: string }
        session: { accessToken: string; refreshToken: string }
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    me: () => apiFetch<any>('/api/auth/me'),
    updateProfile: (data: any) => 
      apiFetch<any>('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // ─── PRODUCTS ───────────────────────────────────────────
  products: {
    list: (category?: string) =>
      apiFetch<Product[]>(`/api/products${category ? `?category=${category}` : ''}`),

    get: (id: string) => apiFetch<Product>(`/api/products/${id}`),

    create: (data: Partial<Product>) =>
      apiFetch<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<Product>) =>
      apiFetch<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),

    csvExport: () => {
      const apiUrl = getApiUrl()
      window.open(`${apiUrl}/api/products/csv/export`, '_blank')
    },

    csvImport: (csvData: string) =>
      apiFetch<{ created: number; updated: number; errors: string[] }>('/api/products/csv/import', {
        method: 'POST',
        body: JSON.stringify({ csvData }),
      }),
  },

  // ─── ORDERS ─────────────────────────────────────────────
  orders: {
    list: (userId?: string) => {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      return apiFetch<Order[]>(`/api/orders?${params.toString()}`)
    },

    create: (data: any) =>
      apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),

    updateStatus: (id: string, data: { orderStatus?: string; paymentStatus?: string }) =>
      apiFetch<Order>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // ─── SETTINGS ───────────────────────────────────────────
  settings: {
    get: () => apiFetch<StoreSettings>('/api/settings'),

    update: (data: Partial<StoreSettings>) =>
      apiFetch<StoreSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // ─── ADMIN ──────────────────────────────────────────────
  admin: {
    getUsers: () => apiFetch<any[]>('/api/admin/users'),

    updateUserRole: (userId: string, role: string) =>
      apiFetch<any>(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),

    deleteUser: (userId: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      }),

    getStats: () =>
      apiFetch<{ userCount: number; productCount: number; orderCount: number }>(
        '/api/admin/stats'
      ),
  },

  // ─── UPLOADS ────────────────────────────────────────────
  upload: {
    single: async (file: File, bucket?: string) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const url = new URL(`${API_URL}/api/upload`)
      if (bucket) url.searchParams.append('bucket', bucket)
      
      const res = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) throw new Error('Upload failed')
      return res.json() as Promise<{ url: string }>
    },

    multiple: async (files: File[], bucket?: string) => {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      
      const url = new URL(`${getApiUrl()}/api/upload/multiple`)
      if (bucket) url.searchParams.append('bucket', bucket)
      
      const res = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) throw new Error('Multiple upload failed')
      return res.json() as Promise<{ urls: string[] }>
    },
  },

  // ─── PAYMENTS ───────────────────────────────────────────
  payments: {
    paymob: {
      create: (data: { orderId: string; amount: number; customer: { email: string; name: string; phone: string } }) =>
        apiFetch<{ iframeUrl: string; paymentToken: string }>('/api/payments/paymob/create-payment', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },
  },
  // ─── BANNERS ───────────────────────────────────────────
  banners: {
    list: () => apiFetch<Banner[]>('/api/banners'),
    create: (data: Partial<Banner>) =>
      apiFetch<Banner>('/api/banners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Banner>) =>
      apiFetch<Banner>(`/api/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/banners/${id}`, { method: 'DELETE' }),
  },
  // ─── COUPONS ───────────────────────────────────────────
  coupons: {
    list: () => apiFetch<Coupon[]>('/api/coupons'),
    validate: (code: string) => 
      apiFetch<Coupon>('/api/coupons/validate', { method: 'POST', body: JSON.stringify({ code }) }),
    create: (data: Partial<Coupon>) =>
      apiFetch<Coupon>('/api/coupons', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Coupon>) =>
      apiFetch<Coupon>(`/api/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/coupons/${id}`, { method: 'DELETE' }),
  },
}

export * from './types'
