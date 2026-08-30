export type AdminTabId =
  | 'overview'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'expenses'
  | 'delivery'
  | 'filters'
  | 'revenue'
  | 'coupons'
  | 'banners'
  | 'content'
  | 'settings'

export interface ProductColor {
  name: string
  hex: string
  image?: string
}

export interface StoreFilter {
  id: string
  nameEn: string
  nameAr: string
  type: 'category' | 'collection' | 'material' | 'tag' | 'season' | string
  options: string[]
  isActive: boolean
  position: number
  createdAt?: string
  updatedAt?: string
}

export interface PlatformStats {
  userCount: number
  productCount: number
  orderCount: number
}

export interface AdminTabItem {
  id: AdminTabId
  label: string
  icon: any
}

export interface DeliveryZone {
  id: string
  nameEn: string
  nameAr: string
  city: string
  deliveryFee: number
  taxRate: number
  estimatedDays: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Expense {
  id: string
  title: string
  category: 'payroll' | 'rent' | 'marketing' | 'utilities' | 'inventory_cogs' | 'logistics' | 'other' | string
  amount: number
  recipientName?: string | null
  paidAt: string
  paymentMethod: string
  receiptUrl?: string | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface MonthlyFinancial {
  month: string
  grossRevenue: number
  cogsTotal: number
  expensesTotal: number
  netProfit: number
  profitMargin: number
  orderCount: number
}
