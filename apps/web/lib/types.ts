export type PaymentMethod = 'card' | 'vodafone_cash' | 'instapay' | 'whatsapp'
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'approved' | 'declined'

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  discountPrice?: number
  cost?: number
  category?: string
  sku?: string
  stock: number
  isActive: boolean
  images: string[]
  image?: string
  videoUrl?: string
  customizable: boolean
  customizationOptions?: any
  downloadUrl?: string
  hasCounter: boolean
  ctaText: string
  directCheckout: boolean
  trackStock: boolean
  discountActive: boolean
  discountPercentage: number
  sizes: string[]
  gender: string
  isAccessory: boolean
  isFootwear: boolean
  isCurated: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  total: number
  subtotal: number
  tax: number
  shipping: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  notes?: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customizations?: any
}

export interface StoreSettings {
  id: string
  name: string
  slug?: string
  description?: string
  logoUrl?: string
  darkLogoUrl?: string
  faviconUrl?: string
  bannerUrl?: string
  currency: string
  language: string
  timezone: string
  phone?: string
  email?: string
  address?: string
  city?: string
  country?: string
  taxRate: number
  shippingFee: number
  whatsappNumber?: string
  accessoriesImageUrl?: string
  footwearImageUrl?: string
  curatedImageUrl?: string
  ethosImageUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  linkedinUrl?: string
  aboutUs?: string
  sustainability?: string
  privacy?: string
  settings: any
  updatedAt: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  description?: string
  imageUrl: string
  ctaText?: string
  ctaLink?: string
  isActive: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  isActive: boolean
  usageLimit?: number | null
  usageCount: number
  expiresAt?: string | null
  createdAt: string
  updatedAt: string
}
