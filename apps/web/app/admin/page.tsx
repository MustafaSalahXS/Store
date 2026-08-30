'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/header'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import { api } from '@/lib/api'
import { useLanguage } from '@/lib/language-context'

import { AdminTabId, DeliveryZone, Expense, MonthlyFinancial, StoreFilter } from '@/components/admin/types'
import AdminTabs from '@/components/admin/AdminTabs'
import OverviewSection from '@/components/admin/OverviewSection'
import ProductsSection from '@/components/admin/ProductsSection'
import ProductFormModal from '@/components/admin/ProductFormModal'
import InventorySection from '@/components/admin/InventorySection'
import OrdersSection from '@/components/admin/OrdersSection'
import StaffExpensesSection from '@/components/admin/StaffExpensesSection'
import ExpenseFormModal from '@/components/admin/ExpenseFormModal'
import DeliveryZonesSection from '@/components/admin/DeliveryZonesSection'
import DeliveryZoneModal from '@/components/admin/DeliveryZoneModal'
import FiltersSection from '@/components/admin/FiltersSection'
import FilterModal from '@/components/admin/FilterModal'
import RevenueSection from '@/components/admin/RevenueSection'
import CouponsSection from '@/components/admin/CouponsSection'
import CouponFormModal from '@/components/admin/CouponFormModal'
import BannersSection from '@/components/admin/BannersSection'
import BannerFormModal from '@/components/admin/BannerFormModal'
import SettingsSection from '@/components/admin/SettingsSection'
import ContentSection from '@/components/admin/ContentSection'
import MobileBottomNav from '@/components/mobile-bottom-nav'

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { currentStore, refreshStore } = useStore()
  const { t, isRTL } = useLanguage()

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview')
  const [products, setProducts] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [coupons, setCoupons] = useState<any[]>([])
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [monthlyFinancials, setMonthlyFinancials] = useState<MonthlyFinancial[]>([])
  const [filters, setFilters] = useState<StoreFilter[]>([])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [editingFilter, setEditingFilter] = useState<StoreFilter | null>(null)
  const [staffUsers, setStaffUsers] = useState<any[]>([])
  const [platformStats, setPlatformStats] = useState({ userCount: 0, productCount: 0, orderCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')

  // Refs for file inputs
  const mainImageRef = useRef<HTMLInputElement>(null)
  const galleryImagesRef = useRef<HTMLInputElement>(null)
  const videoFileRef = useRef<HTMLInputElement>(null)
  const bannerImageRef = useRef<HTMLInputElement>(null)
  const csvFileRef = useRef<HTMLInputElement>(null)

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    sku: '',
    cost: 0,
    isActive: true,
    image: '',
    images: [] as string[],
    videoUrl: '',
    hasCounter: true,
    ctaText: 'Add to Cart',
    directCheckout: false,
    trackStock: true,
    discountActive: false,
    discountPercentage: 0,
    sizes: [] as string[],
    colors: [] as { name: string; hex: string; image?: string }[],
    tags: [] as string[],
    material: '',
    gender: 'both',
    isAccessory: false,
    isFootwear: false,
    isCurated: false
  })

  // Banner Form State
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any | null>(null)
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: '',
    isActive: true,
    position: 0
  })

  // Coupon Form State
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '' as string | number,
    isActive: true,
    usageLimit: '',
    expiresAt: ''
  })

  // Expense Form State
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expenseFormData, setExpenseFormData] = useState({
    title: '',
    category: 'payroll',
    amount: '' as string | number,
    recipientName: '',
    paidAt: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  })

  // Delivery Zone Form State
  const [showZoneForm, setShowZoneForm] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [zoneFormData, setZoneFormData] = useState({
    nameAr: '',
    nameEn: '',
    city: 'Cairo',
    deliveryFee: '' as string | number,
    taxRate: '14',
    estimatedDays: '1-3 Days',
    isActive: true
  })

  // Sizes Options
  const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL']

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState({
    name: '',
    currency: 'USD',
    description: '',
    logoUrl: '',
    darkLogoUrl: '',
    faviconUrl: '',
    bannerUrl: '',
    taxRate: 0,
    shippingFee: 0,
    whatsappNumber: '',
    accessoriesImageUrl: '',
    footwearImageUrl: '',
    curatedImageUrl: '',
    ethosImageUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    linkedinUrl: '',
    aboutUs: '',
    sustainability: '',
    privacy: ''
  })

  useEffect(() => {
    if (currentStore) {
      setStoreSettings({
        name: currentStore.name || '',
        currency: currentStore.currency || 'USD',
        description: currentStore.description || '',
        logoUrl: currentStore.logoUrl || '',
        darkLogoUrl: currentStore.darkLogoUrl || '',
        faviconUrl: currentStore.faviconUrl || '',
        bannerUrl: currentStore.bannerUrl || '',
        taxRate: currentStore.taxRate || 0,
        shippingFee: currentStore.shippingFee || 0,
        whatsappNumber: currentStore.whatsappNumber || '',
        accessoriesImageUrl: currentStore.accessoriesImageUrl || '',
        footwearImageUrl: currentStore.footwearImageUrl || '',
        curatedImageUrl: currentStore.curatedImageUrl || '',
        ethosImageUrl: currentStore.ethosImageUrl || '',
        facebookUrl: currentStore.facebookUrl || '',
        instagramUrl: currentStore.instagramUrl || '',
        tiktokUrl: currentStore.tiktokUrl || '',
        linkedinUrl: currentStore.linkedinUrl || '',
        aboutUs: currentStore.aboutUs || '',
        sustainability: currentStore.sustainability || '',
        privacy: currentStore.privacy || ''
      })
    }
  }, [currentStore])

  const loadData = async () => {
    try {
      const [
        productsData,
        ordersData,
        statsData,
        bannersData,
        couponsData,
        zonesData,
        expensesData,
        financialsData,
        usersData,
        filtersData
      ] = await Promise.all([
        api.products.list().catch(err => { console.error(err); return [] }),
        api.orders.list().catch(err => { console.error(err); return [] }),
        api.admin.getStats().catch(err => { console.error(err); return { userCount: 0, productCount: 0, orderCount: 0 } }),
        api.banners.list().catch(err => { console.error(err); return [] }),
        api.coupons.list().catch(err => { console.error(err); return [] }),
        api.deliveryZones.list().catch(err => { console.error(err); return [] }),
        api.expenses.list().catch(err => { console.error(err); return [] }),
        api.orders.financialMonthly().catch(err => { console.error(err); return [] }),
        api.admin.getUsers().catch(err => { console.error(err); return [] }),
        api.filters.list().catch(err => { console.error(err); return [] })
      ])
      setProducts(productsData)
      setOrders(ordersData)
      setPlatformStats(statsData)
      setBanners(bannersData)
      setCoupons(couponsData)
      setDeliveryZones(zonesData)
      setExpenses(expensesData)
      setMonthlyFinancials(financialsData)
      setStaffUsers(usersData)
      setFilters(filtersData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // File Upload Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery' | 'video') => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      if (type === 'main') {
        const result = await api.upload.single(files[0], 'Pics')
        setProductFormData(prev => ({ ...prev, image: result.url }))
      } else if (type === 'gallery') {
        const results = await api.upload.multiple(Array.from(files), 'Pics')
        setProductFormData(prev => ({
          ...prev,
          images: [...prev.images, ...results.urls]
        }))
      } else if (type === 'video') {
        const result = await api.upload.single(files[0], 'Vid')
        setProductFormData(prev => ({ ...prev, videoUrl: result.url }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(t('admin.uploadFailed', 'Upload failed'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleStoreFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const bucket = field === 'logoUrl' || field === 'darkLogoUrl' ? 'Logos' :
        field === 'faviconUrl' ? 'FavIcon' : 'Pics'

      const result = await api.upload.single(files[0], bucket)
      setStoreSettings(prev => ({ ...prev, [field]: result.url }))
    } catch (error) {
      console.error('Store upload error:', error)
      alert('Failed to upload store asset.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const result = await api.upload.single(files[0], 'Pics')
      setBannerFormData(prev => ({ ...prev, imageUrl: result.url }))
    } catch (error) {
      console.error('Banner upload error:', error)
      alert('Failed to upload banner image.')
    } finally {
      setIsUploading(false)
    }
  }

  // Stock update handler
  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const updated = await api.products.update(productId, { stock: newStock })
      setProducts(products.map(p => p.id === productId ? updated : p))
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Failed to update stock level.')
    }
  }

  // Product Actions
  const openCreateProductModal = () => {
    setEditingProduct(null)
    setProductFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      sku: '',
      cost: 0,
      isActive: true,
      image: '',
      images: [],
      videoUrl: '',
      hasCounter: true,
      ctaText: 'Add to Cart',
      directCheckout: false,
      trackStock: true,
      discountActive: false,
      discountPercentage: 0,
      sizes: [],
      colors: [],
      tags: [],
      material: '',
      gender: 'both',
      isAccessory: false,
      isFootwear: false,
      isCurated: false
    })
    setShowProductForm(true)
  }

  const openEditProductModal = (product: any) => {
    setEditingProduct(product)
    setProductFormData({
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      category: product.category || '',
      stock: product.stock || 0,
      sku: product.sku || '',
      cost: Number(product.cost || 0),
      isActive: product.isActive !== false,
      image: product.image || '',
      images: product.images || [],
      videoUrl: product.videoUrl || '',
      hasCounter: product.hasCounter ?? true,
      ctaText: product.ctaText || 'Add to Cart',
      directCheckout: product.directCheckout ?? false,
      trackStock: product.trackStock ?? true,
      discountActive: product.discountActive ?? false,
      discountPercentage: product.discountPercentage || 0,
      sizes: product.sizes || [],
      colors: (product.colors && Array.isArray(product.colors) && product.colors.length > 0)
        ? product.colors
        : ((product.customizationOptions as any)?.colors || []),
      tags: Array.isArray(product.tags) ? product.tags : [],
      material: product.material || '',
      gender: product.gender || 'both',
      isAccessory: product.isAccessory ?? false,
      isFootwear: product.isFootwear ?? false,
      isCurated: product.isCurated ?? false
    })
    setShowProductForm(true)
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingProduct) {
        const updated = await api.products.update(editingProduct.id, productFormData)
        setProducts(products.map(p => p.id === editingProduct.id ? updated : p))
      } else {
        const newProduct = await api.products.create(productFormData)
        setProducts([newProduct, ...products])
      }
      setShowProductForm(false)
      setEditingProduct(null)
      setSaveSuccess(editingProduct 
        ? (isRTL ? 'تم تحديث بيانات المنتج بنجاح!' : 'Product updated successfully!') 
        : (isRTL ? 'تم إنشاء ونشر المنتج بنجاح!' : 'Product created successfully!'))
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.products.delete(id)
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      alert('Failed to delete product.')
    }
  }

  const handleCsvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsSubmitting(true)
    try {
      const text = await file.text()
      const result = await api.products.csvImport(text)
      const msg = `Import complete!\nCreated: ${result.created}\nUpdated: ${result.updated}${result.errors.length > 0 ? `\nErrors: ${result.errors.join('\n')}` : ''}`
      alert(msg)
      const productsData = await api.products.list()
      setProducts(productsData)
    } catch (error: any) {
      console.error('CSV import error:', error)
      alert('Failed to import CSV: ' + (error.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
      if (csvFileRef.current) csvFileRef.current.value = ''
    }
  }

  const handleExportCsv = () => {
    const headers = 'name,description,price,category,stock,sku,cost,isActive,image,videoUrl,discountActive,discountPercentage,sizes,gender,isAccessory,isFootwear,isCurated,hasCounter,ctaText,directCheckout,trackStock'
    const rows = products.map((p: any) => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      p.price || 0,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      p.stock || 0,
      `"${(p.sku || '').replace(/"/g, '""')}"`,
      p.cost || 0,
      p.isActive !== false,
      `"${p.image || ''}"`,
      `"${p.videoUrl || ''}"`,
      p.discountActive || false,
      p.discountPercentage || 0,
      `"${(p.sizes || []).join(';')}"`,
      p.gender || 'both',
      p.isAccessory || false,
      p.isFootwear || false,
      p.isCurated || false,
      p.hasCounter !== false,
      `"${(p.ctaText || 'Add to Cart').replace(/"/g, '""')}"`,
      p.directCheckout || false,
      p.trackStock !== false
    ].join(','))
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Order status & delivery driver update
  const handleUpdateStatusAndDelivery = async (orderId: string, data: { orderStatus?: string; assignedDriverId?: string; notes?: string }) => {
    try {
      const updated = await api.orders.updateStatusAndDelivery(orderId, data)
      setOrders(orders.map((o: any) => o.id === orderId ? updated : o))
      setSaveSuccess(isRTL ? 'تم تحديث حالة الطلب ومندوب التوصيل بنجاح!' : 'Order updated successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order status or assigned delivery driver.')
    }
  }

  // Expense Handlers
  const openCreateExpenseModal = () => {
    setEditingExpense(null)
    setExpenseFormData({
      title: '',
      category: 'payroll',
      amount: '',
      recipientName: '',
      paidAt: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      notes: ''
    })
    setShowExpenseForm(true)
  }

  const openEditExpenseModal = (expense: Expense) => {
    setEditingExpense(expense)
    setExpenseFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      recipientName: expense.recipientName || '',
      paidAt: new Date(expense.paidAt).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod || 'cash',
      notes: expense.notes || ''
    })
    setShowExpenseForm(true)
  }

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingExpense) {
        const updated = await api.expenses.update(editingExpense.id, expenseFormData)
        setExpenses(expenses.map(exp => exp.id === editingExpense.id ? updated : exp))
      } else {
        const newExp = await api.expenses.create(expenseFormData)
        setExpenses([newExp, ...expenses])
      }
      setShowExpenseForm(false)
      setEditingExpense(null)
      setSaveSuccess(isRTL ? 'تم تسجيل قيد المصروف بنجاح!' : 'Expense recorded successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
      // Refresh financials
      api.orders.financialMonthly().then(res => setMonthlyFinancials(res))
    } catch (error) {
      console.error('Error saving expense:', error)
      alert(isRTL ? 'فشل حفظ المصروف.' : 'Failed to save expense.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف قيد المصروف هذا؟' : 'Are you sure you want to delete this expense record?')) return
    try {
      await api.expenses.delete(id)
      setExpenses(expenses.filter(e => e.id !== id))
      api.orders.financialMonthly().then(res => setMonthlyFinancials(res))
    } catch (error) {
      console.error('Error deleting expense:', error)
      alert(isRTL ? 'فشل حذف المصروف.' : 'Failed to delete expense.')
    }
  }

  // Delivery Zone Handlers
  const openCreateZoneModal = (preset?: any) => {
    setEditingZone(null)
    setZoneFormData({
      nameAr: preset?.nameAr || '',
      nameEn: preset?.nameEn || '',
      city: preset?.city || 'Cairo',
      deliveryFee: preset?.deliveryFee !== undefined ? String(preset.deliveryFee) : '50',
      taxRate: preset?.taxRate !== undefined ? String(preset.taxRate) : '14',
      estimatedDays: preset?.estimatedDays || '1-2 Days',
      isActive: true
    })
    setShowZoneForm(true)
  }

  const handleSeedAllZones = async () => {
    try {
      setIsSubmitting(true)
      const res = await api.deliveryZones.seedDefaults()
      if (res?.zones) {
        setDeliveryZones(res.zones)
      } else {
        const fresh = await api.deliveryZones.list()
        setDeliveryZones(fresh)
      }
      setSaveSuccess(isRTL ? 'تمت مزامنة كافة محافظات التوصيل المصرية بنجاح!' : 'All Egyptian delivery zones synced successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error syncing delivery zones:', error)
      alert(isRTL ? 'فشل مزامنة مناطق التوصيل.' : 'Failed to sync delivery zones.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditZoneModal = (zone: DeliveryZone) => {
    setEditingZone(zone)
    setZoneFormData({
      nameAr: zone.nameAr,
      nameEn: zone.nameEn,
      city: zone.city,
      deliveryFee: zone.deliveryFee,
      taxRate: String(zone.taxRate),
      estimatedDays: zone.estimatedDays,
      isActive: zone.isActive
    })
    setShowZoneForm(true)
  }

  const handleSubmitZone = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingZone) {
        const updated = await api.deliveryZones.update(editingZone.id, zoneFormData)
        setDeliveryZones(deliveryZones.map(z => z.id === editingZone.id ? updated : z))
      } else {
        const newZone = await api.deliveryZones.create(zoneFormData)
        setDeliveryZones([...deliveryZones, newZone])
      }
      setShowZoneForm(false)
      setEditingZone(null)
      setSaveSuccess(isRTL ? 'تم حفظ وتحديث منطقة التوصيل بنجاح!' : 'Delivery zone saved successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving delivery zone:', error)
      alert('Failed to save delivery zone.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleZoneStatus = async (zone: DeliveryZone) => {
    try {
      const updated = await api.deliveryZones.update(zone.id, { isActive: !zone.isActive })
      setDeliveryZones(deliveryZones.map(z => z.id === zone.id ? updated : z))
    } catch (error) {
      console.error('Error toggling zone status:', error)
      alert('Failed to update zone status.')
    }
  }

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Delete this delivery zone?')) return
    try {
      await api.deliveryZones.delete(id)
      setDeliveryZones(deliveryZones.filter(z => z.id !== id))
    } catch (error) {
      console.error('Error deleting delivery zone:', error)
      alert('Failed to delete delivery zone.')
    }
  }

  // Banner Actions
  const openCreateBannerModal = () => {
    setEditingBanner(null)
    setBannerFormData({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
      isActive: true,
      position: 0
    })
    setShowBannerForm(true)
  }

  const openEditBannerModal = (banner: any) => {
    setEditingBanner(banner)
    setBannerFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      ctaText: banner.ctaText || '',
      ctaLink: banner.ctaLink || '',
      isActive: banner.isActive,
      position: banner.position
    })
    setShowBannerForm(true)
  }

  const handleSubmitBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingBanner) {
        const updated = await api.banners.update(editingBanner.id, bannerFormData)
        setBanners(banners.map(b => b.id === editingBanner.id ? updated : b))
      } else {
        const newBanner = await api.banners.create(bannerFormData)
        setBanners([newBanner, ...banners])
      }
      setShowBannerForm(false)
      setEditingBanner(null)
      setSaveSuccess(editingBanner 
        ? (isRTL ? 'تم حفظ تعديلات البانر الإعلاني بنجاح!' : 'Banner updated successfully!') 
        : (isRTL ? 'تم نشر البانر الإعلاني الجديد بنجاح!' : 'Banner created successfully!'))
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving banner:', error)
      alert(isRTL ? 'فشل حفظ البانر.' : 'Failed to save banner.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا البانر؟' : 'Are you sure you want to delete this banner?')) return
    try {
      await api.banners.delete(id)
      setBanners(banners.filter(b => b.id !== id))
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert(isRTL ? 'فشل حذف البانر.' : 'Failed to delete banner.')
    }
  }

  // Coupon Handlers
  const openCreateCouponModal = () => {
    setEditingCoupon(null)
    setCouponError('')
    setCouponFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      usageLimit: '',
      expiresAt: '',
      isActive: true
    })
    setShowCouponForm(true)
  }

  const openEditCouponModal = (coupon: any) => {
    setEditingCoupon(coupon)
    setCouponError('')
    setCouponFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      usageLimit: coupon.usageLimit || '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      isActive: coupon.isActive
    })
    setShowCouponForm(true)
  }

  const handleSubmitCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setCouponError('')
    try {
      const payload: any = {
        code: couponFormData.code.trim().toUpperCase(),
        discountType: couponFormData.discountType,
        discountValue: Number(couponFormData.discountValue),
        isActive: couponFormData.isActive
      }
      if (couponFormData.usageLimit) {
        payload.usageLimit = parseInt(couponFormData.usageLimit, 10)
      }
      if (couponFormData.expiresAt) {
        payload.expiresAt = new Date(couponFormData.expiresAt).toISOString()
      }

      if (editingCoupon) {
        const updated = await api.coupons.update(editingCoupon.id, payload)
        setCoupons(coupons.map(c => c.id === editingCoupon.id ? updated : c))
      } else {
        const newCoupon = await api.coupons.create(payload)
        setCoupons([newCoupon, ...coupons])
      }
      setShowCouponForm(false)
      setEditingCoupon(null)
      setSaveSuccess(editingCoupon 
        ? (isRTL ? 'تم حفظ تعديلات كود الخصم بنجاح!' : 'Coupon updated successfully!') 
        : (isRTL ? 'تم إنشاء كود الخصم بنجاح!' : 'Coupon created successfully!'))
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error: any) {
      console.error('Error saving coupon:', error)
      setCouponError(error?.message || (isRTL ? 'فشل حفظ الكوبون، يرجى مراجعة البيانات.' : 'Failed to save coupon. Please verify your inputs.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا الكوبون؟' : 'Are you sure you want to delete this coupon?')) return
    try {
      await api.coupons.delete(id)
      setCoupons(coupons.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert(isRTL ? 'فشل حذف الكوبون.' : 'Failed to delete coupon.')
    }
  }

  // Filter Management Handlers
  const handleSaveFilter = async (data: Partial<StoreFilter>) => {
    try {
      if (editingFilter) {
        const updated = await api.filters.update(editingFilter.id, data)
        setFilters(filters.map(f => f.id === editingFilter.id ? updated : f))
        setSaveSuccess(isRTL ? 'تم تحديث مجموعة الفلاتر بنجاح!' : 'Filter group updated successfully!')
      } else {
        const created = await api.filters.create(data)
        setFilters([...filters, created])
        setSaveSuccess(isRTL ? 'تم إنشاء مجموعة الفلاتر بنجاح!' : 'Filter group created successfully!')
      }
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving filter:', error)
      alert(isRTL ? 'فشل حفظ مجموعة الفلاتر.' : 'Failed to save filter group.')
    }
  }

  const handleDeleteFilter = async (id: string) => {
    try {
      await api.filters.delete(id)
      setFilters(filters.filter(f => f.id !== id))
      setSaveSuccess('Filter group deleted successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error deleting filter:', error)
      alert('Failed to delete filter.')
    }
  }

  const handleToggleFilterStatus = async (filter: StoreFilter) => {
    try {
      const updated = await api.filters.update(filter.id, { isActive: !filter.isActive })
      setFilters(filters.map(f => f.id === filter.id ? updated : f))
    } catch (error) {
      console.error('Error toggling filter status:', error)
    }
  }

  // Store Settings Actions
  const handleUpdateStore = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.settings.update(storeSettings)
      await refreshStore()
      alert(t('admin.settingsUpdated', 'Store settings updated successfully!'))
    } catch (error) {
      console.error('Error updating settings:', error)
      alert(t('admin.settingsFailed', 'Failed to update store settings.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-36 md:pb-16">
      <Header />

      {/* Success Notification Toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 md:bottom-8 right-8 z-50 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-lg"
          >
            <Check className="w-6 h-6" />
            {saveSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Navigation Tabs Header */}
        <AdminTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          storeName={currentStore?.name}
          t={t}
        />

        {/* Section 1: Overview */}
        {activeTab === 'overview' && (
          <OverviewSection
            platformStats={platformStats}
            productsCount={products.length}
            orders={orders}
            currentStore={currentStore}
            setActiveTab={setActiveTab}
            t={t}
          />
        )}

        {/* Section 2: Sales & Orders */}
        {activeTab === 'orders' && (
          <OrdersSection
            orders={orders}
            currentStore={currentStore}
            staffUsers={staffUsers}
            deliveryZones={deliveryZones}
            onUpdateStatusAndDelivery={handleUpdateStatusAndDelivery}
            t={t}
          />
        )}

        {/* Section 3: Product Catalog */}
        {activeTab === 'products' && (
          <ProductsSection
            products={products}
            currentStore={currentStore}
            onOpenCreate={openCreateProductModal}
            onOpenEdit={openEditProductModal}
            onDelete={handleDeleteProduct}
            onExportCsv={handleExportCsv}
            csvFileRef={csvFileRef}
            onCsvUpload={handleCsvFileUpload}
            t={t}
          />
        )}

        {/* Section 4: Inventory Management */}
        {activeTab === 'inventory' && (
          <InventorySection
            products={products}
            currentStore={currentStore}
            onUpdateStock={handleUpdateStock}
            onOpenEditProduct={openEditProductModal}
            t={t}
          />
        )}

        {/* Section 5: Staff Payroll & Expenses */}
        {activeTab === 'expenses' && (
          <StaffExpensesSection
            expenses={expenses}
            currentStore={currentStore}
            onOpenCreate={openCreateExpenseModal}
            onOpenEdit={openEditExpenseModal}
            onDelete={handleDeleteExpense}
            t={t}
          />
        )}

        {/* Section 6: Delivery Zones & Shipping Fees */}
        {activeTab === 'delivery' && (
          <DeliveryZonesSection
            zones={deliveryZones}
            staffUsers={staffUsers}
            currentStore={currentStore}
            onOpenCreate={openCreateZoneModal}
            onOpenEdit={openEditZoneModal}
            onDelete={handleDeleteZone}
            onSeedAllZones={handleSeedAllZones}
            onToggleStatus={handleToggleZoneStatus}
            t={t}
          />
        )}

        {/* Section 6.5: Storefront Filters & Taxonomy */}
        {activeTab === 'filters' && (
          <FiltersSection
            filters={filters}
            onAddFilter={() => { setEditingFilter(null); setShowFilterModal(true); }}
            onEditFilter={(f) => { setEditingFilter(f); setShowFilterModal(true); }}
            onDeleteFilter={handleDeleteFilter}
            onToggleFilterStatus={handleToggleFilterStatus}
            t={t}
          />
        )}

        {/* Section 7: Revenue Overview & Monthly Capital Outflow */}
        {activeTab === 'revenue' && (
          <RevenueSection
            orders={orders}
            currentStore={currentStore}
            monthlyFinancials={monthlyFinancials}
            t={t}
          />
        )}

        {/* Section 8: Discount Coupons */}
        {activeTab === 'coupons' && (
          <CouponsSection
            coupons={coupons}
            currentStore={currentStore}
            onOpenCreate={openCreateCouponModal}
            onOpenEdit={openEditCouponModal}
            onDelete={handleDeleteCoupon}
            t={t}
          />
        )}

        {/* Section 9: Dynamic Banners */}
        {activeTab === 'banners' && (
          <BannersSection
            banners={banners}
            onOpenCreate={openCreateBannerModal}
            onOpenEdit={openEditBannerModal}
            onDelete={handleDeleteBanner}
            t={t}
          />
        )}

        {/* Section 10: Store Settings */}
        {activeTab === 'settings' && (
          <SettingsSection
            storeSettings={storeSettings}
            setStoreSettings={setStoreSettings}
            onUpdateStore={handleUpdateStore}
            onFileUpload={handleStoreFileUpload}
            isSubmitting={isSubmitting}
            isUploading={isUploading}
            t={t}
          />
        )}

        {/* Section 11: Content & Visual Assets */}
        {activeTab === 'content' && (
          <ContentSection
            storeSettings={storeSettings}
            setStoreSettings={setStoreSettings}
            onUpdateStore={() => handleUpdateStore()}
            isSubmitting={isSubmitting}
            t={t}
          />
        )}
      </div>

      {/* Product Modal */}
      <ProductFormModal
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        editingProduct={editingProduct}
        formData={productFormData}
        setFormData={setProductFormData}
        onSubmit={handleSubmitProduct}
        isSubmitting={isSubmitting}
        isUploading={isUploading}
        mainImageRef={mainImageRef}
        galleryImagesRef={galleryImagesRef}
        videoFileRef={videoFileRef}
        handleFileUpload={handleFileUpload}
        sizeOptions={SIZE_OPTIONS}
        t={t}
      />

      {/* Banner Modal */}
      <BannerFormModal
        isOpen={showBannerForm}
        onClose={() => setShowBannerForm(false)}
        editingBanner={editingBanner}
        formData={bannerFormData}
        setFormData={setBannerFormData}
        onSubmit={handleSubmitBanner}
        isSubmitting={isSubmitting}
        isUploading={isUploading}
        bannerImageRef={bannerImageRef}
        handleFileUpload={handleBannerFileUpload}
        t={t}
      />

      {/* Coupon Modal */}
      <CouponFormModal
        isOpen={showCouponForm}
        onClose={() => setShowCouponForm(false)}
        editingCoupon={editingCoupon}
        formData={couponFormData}
        setFormData={setCouponFormData}
        couponError={couponError}
        setCouponError={setCouponError}
        onSubmit={handleSubmitCoupon}
        isSubmitting={isSubmitting}
        currentStore={currentStore}
        t={t}
      />

      {/* Expense Modal */}
      <ExpenseFormModal
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        editingExpense={editingExpense}
        formData={expenseFormData}
        setFormData={setExpenseFormData}
        onSubmit={handleSubmitExpense}
        isSubmitting={isSubmitting}
        currentStore={currentStore}
        t={t}
      />

      {/* Delivery Zone Modal */}
      <DeliveryZoneModal
        isOpen={showZoneForm}
        onClose={() => setShowZoneForm(false)}
        editingZone={editingZone}
        formData={zoneFormData}
        setFormData={setZoneFormData}
        onSubmit={handleSubmitZone}
        isSubmitting={isSubmitting}
        currentStore={currentStore}
        t={t}
      />

      {/* Storefront Filter Group Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => { setShowFilterModal(false); setEditingFilter(null); }}
        editingFilter={editingFilter}
        onSave={handleSaveFilter}
        t={t}
      />

      {/* Mobile Floating Bottom Bar */}
      <MobileBottomNav
        activeAdminTab={activeTab}
        onSelectAdminTab={setActiveTab}
      />
    </div>
  )
}
