'use client'
// Localized admin page

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/header'
import { motion, AnimatePresence } from 'framer-motion'
import { translateProduct } from '@/lib/translator'
import { Plus, Edit, Trash2, BarChart3, ShoppingCart, Zap, X, Loader, Settings, Image as ImageIcon, Globe, Upload, FileVideo, Check, TrendingUp, MessageCircle, Ticket, Download, FileSpreadsheet, Share2, FileText, Languages } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import { api } from '@/lib/api'
import { formatPrice, CURRENCIES } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { currentStore, refreshStore } = useStore()
  const { t } = useLanguage()

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'banners' | 'orders' | 'revenue' | 'coupons' | 'settings' | 'content'>('overview')
  const [products, setProducts] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [coupons, setCoupons] = useState<any[]>([])
  const [platformStats, setPlatformStats] = useState({ userCount: 0, productCount: 0, orderCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    isActive: true,
    usageLimit: '',
    expiresAt: ''
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

  // Success Message State
  const [saveSuccess, setSaveSuccess] = useState('')

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
        taxRate: Number(currentStore.taxRate || 0),
        shippingFee: Number(currentStore.shippingFee || 0),
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [productsData, ordersData, statsData, bannersData, couponsData] = await Promise.all([
          api.products.list(),
          api.orders.list(),
          api.admin.getStats(),
          api.banners.list(),
          api.coupons.list()
        ])
        setProducts(productsData)
        setOrders(ordersData)
        setPlatformStats(statsData)
        setBanners(bannersData)
        setCoupons(couponsData)
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'admin') {
      loadData()
    }
  }, [user])

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'admin')) {
      window.location.href = '/login'
    }
  }, [user, isAuthLoading])

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-bold">{t('admin.synchronizing')}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const totalRevenue = orders
    .filter((o: any) => o.orderStatus === 'approved')
    .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0)
  const stats = [
    { label: t('admin.totalRevenue'), value: formatPrice(totalRevenue, currentStore?.currency || 'USD'), icon: TrendingUp, color: 'text-green-500' },
    { label: t('admin.totalOrders'), value: String(platformStats.orderCount), icon: Zap, color: 'text-yellow-500' },
    { label: t('admin.totalProducts'), value: String(platformStats.productCount), icon: ShoppingCart, color: 'text-primary' },
    { label: t('admin.totalUsers'), value: String(platformStats.userCount), icon: Globe, color: 'text-accent' },
  ]

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.settings.update(storeSettings)
      await refreshStore()
      alert(t('admin.settingsUpdated'))
    } catch (error) {
      console.error('Error updating settings:', error)
      alert(t('admin.settingsFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

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
      alert(t('admin.uploadFailed'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleStoreFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'darkLogoUrl' | 'faviconUrl' | 'bannerUrl' | 'accessoriesImageUrl' | 'footwearImageUrl' | 'curatedImageUrl' | 'ethosImageUrl') => {
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
      setSaveSuccess(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving banner:', error)
      alert('Failed to save banner.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    try {
      await api.banners.delete(id)
      setBanners(banners.filter(b => b.id !== id))
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert('Failed to delete banner.')
    }
  }

  const handleSubmitCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingCoupon) {
        const updated = await api.coupons.update(editingCoupon.id, couponFormData)
        setCoupons(coupons.map(c => c.id === editingCoupon.id ? updated : c))
      } else {
        const newCoupon = await api.coupons.create(couponFormData)
        setCoupons([newCoupon, ...coupons])
      }
      setShowCouponForm(false)
      setEditingCoupon(null)
      setSaveSuccess(editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving coupon:', error)
      alert('Failed to save coupon.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    try {
      await api.coupons.delete(id)
      setCoupons(coupons.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('Failed to delete coupon.')
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
      // Refresh products
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

  const handleDownloadTemplate = () => {
    const headers = 'name,description,price,category,stock,sku,cost,isActive,image,videoUrl,discountActive,discountPercentage,sizes,gender,isAccessory,isFootwear,isCurated,hasCounter,ctaText,directCheckout,trackStock'
    const exampleRow = 'Example T-Shirt,A premium cotton t-shirt,299.99,Clothing,50,TSH-001,150,true,,https://example.com/image.jpg,false,0,S;M;L;XL,both,false,false,false,true,Add to Cart,false,true'
    const csv = headers + '\n' + exampleRow
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products_template.csv'
    a.click()
    URL.revokeObjectURL(url)
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

      setSaveSuccess(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProduct = (product: any) => {
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
      gender: product.gender || 'both',
      isAccessory: product.isAccessory ?? false,
      isFootwear: product.isFootwear ?? false,
      isCurated: product.isCurated ?? false
    })
    setShowProductForm(true)
  }

  const toggleSize = (size: string) => {
    setProductFormData(prev => {
      const currentSizes = prev.sizes || []
      return {
        ...prev,
        sizes: currentSizes.includes(size)
          ? currentSizes.filter(s => s !== size)
          : [...currentSizes, size]
      }
    })
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

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updated = await api.orders.updateStatus(orderId, { orderStatus: status })
      setOrders(orders.map((o: any) => o.id === orderId ? updated : o))
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Success Toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-8 right-8 z-50 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-lg">
            <Check className="w-6 h-6" />
            {saveSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="section-container py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t('admin.dashboard')}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Store: <span className="text-primary">{currentStore?.name || 'My Store'}</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 md:gap-4 mb-8 md:mb-10 border-b border-border/50 overflow-x-auto no-scrollbar">
          {([
            { id: 'overview', label: t('admin.overview'), icon: BarChart3 },
            { id: 'products', label: t('admin.inventory'), icon: ShoppingCart },
            { id: 'banners', label: t('admin.banners'), icon: ImageIcon },
            { id: 'orders', label: t('admin.sales'), icon: Zap },
            { id: 'revenue', label: t('admin.revenue'), icon: TrendingUp },
            { id: 'coupons', label: t('admin.coupons'), icon: Ticket },
            { id: 'content', label: t('admin.content'), icon: FileText },
            { id: 'settings', label: t('admin.settings'), icon: Settings }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 font-black transition-all border-b-4 shrink-0 text-sm md:text-base ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 md:space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ scale: 1.02 }} className="bg-card rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-border shadow-2xl relative overflow-hidden group flex flex-col justify-between min-h-[140px] md:min-h-[180px]">
                  <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 md:-mr-10 md:-mt-10 transition-transform group-hover:scale-110" />
                  <div className="flex items-center justify-between mb-4 md:mb-6 relative">
                    <span className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] truncate mr-2">{stat.label}</span>
                    <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-secondary ${stat.color} shadow-inner shrink-0`}><stat.icon className="w-5 h-5 md:w-6 md:h-6" /></div>
                  </div>
                  <div className="relative min-w-0">
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-black whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border p-6 md:p-10 shadow-2xl">
                <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8 flex items-center gap-3"><TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" /> {t('admin.recentSales')}</h3>
                <div className="space-y-4 md:space-y-6">
                  {orders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 p-4 hover:bg-secondary/50 rounded-2xl transition-colors border border-transparent hover:border-border/50">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs">#{order.id.split('-')[0].substring(0, 4)}</div>
                        <div>
                          <div className="font-black text-sm md:text-base">{order.customerName}</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right ml-auto md:ml-0">
                        <div className="font-black text-primary text-sm md:text-base">{formatPrice(order.total, currentStore?.currency || 'USD')}</div>
                        <div className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${order.orderStatus === 'approved' ? 'text-green-500' : 'text-yellow-500'}`}>{order.orderStatus}</div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <div className="text-center py-10 text-muted-foreground font-bold">No sales data available yet.</div>}
                </div>
              </div>

              <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border p-6 md:p-10 shadow-2xl flex flex-col">
                <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8 flex items-center gap-3"><TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-accent" /> Store Status</h3>
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 md:space-y-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-8 border-primary/20 border-t-primary flex items-center justify-center relative">
                    <span className="text-2xl md:text-3xl font-black">100%</span>
                    <div className="absolute -bottom-2 bg-green-500 text-white text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest">Online</div>
                  </div>
                  <div>
                    <p className="font-black text-lg md:text-xl">Health is Optimal</p>
                    <p className="text-xs md:text-sm text-muted-foreground">All systems operational. Web, API, and Database are in sync.</p>
                  </div>
                  <button onClick={() => setActiveTab('settings')} className="w-full py-3 md:py-4 bg-secondary font-black rounded-xl md:rounded-2xl hover:bg-secondary/80 transition-colors text-sm">Manage Settings</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6 md:space-y-8">
            <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border p-6 md:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t('admin.productCatalog')}</h2>
                <div className="w-full lg:w-auto grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3">
                  <button onClick={handleDownloadTemplate} className="flex items-center justify-center gap-2 px-3 md:px-4 py-3 bg-secondary text-foreground rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-secondary/80 transition-all">
                    <FileSpreadsheet className="w-4 h-4" /> {t('admin.template')}
                  </button>
                  <button onClick={() => api.products.csvExport()} className="flex items-center justify-center gap-2 px-3 md:px-4 py-3 bg-secondary text-foreground rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-secondary/80 transition-all">
                    <Download className="w-4 h-4" /> {t('admin.export')}
                  </button>
                  <button onClick={() => csvFileRef.current?.click()} disabled={isSubmitting} className="flex items-center justify-center gap-2 px-3 md:px-4 py-3 bg-secondary text-foreground rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-secondary/80 transition-all">
                    <Upload className="w-4 h-4" /> {isSubmitting ? '...' : t('admin.import')}
                  </button>
                  <input ref={csvFileRef} type="file" accept=".csv" hidden onChange={handleCsvFileUpload} />
                  <button
                    onClick={() => {
                      setEditingProduct(null)
                      setProductFormData({ name: '', description: '', price: 0, category: '', stock: 0, sku: '', cost: 0, isActive: true, image: '', images: [], videoUrl: '', hasCounter: true, ctaText: 'Add to Cart', directCheckout: false, trackStock: true, discountActive: false, discountPercentage: 0, sizes: [], gender: 'both', isAccessory: false, isFootwear: false, isCurated: false })
                      setShowProductForm(true)
                    }}
                    className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg hover:brightness-110 transition-all"
                  >
                    <Plus className="w-4 h-4" /> New
                  </button>
                </div>
              </div>

              {/* Product Form Modal */}
              <AnimatePresence>
                {showProductForm && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-10 md:p-16 border border-stone-100 shadow-[0_50px_150px_rgba(0,0,0,0.1)] relative">
                      <button onClick={() => setShowProductForm(false)} className="absolute top-10 right-10 p-3 hover:bg-stone-50 rounded-full z-10 transition-colors"><X className="w-6 h-6 text-stone-400" /></button>
                      
                      <div className="mb-16 space-y-2">
                        <h3 className="font-bodoni text-5xl font-bold tracking-tight uppercase leading-none">
                          {editingProduct ? t('admin.updateProduct').split(' ')[0] : t('admin.newProduct').split(' ')[0]}<br/><span className="text-gold-500">{editingProduct ? t('admin.updateProduct').split(' ')[1] : t('admin.newProduct').split(' ')[1]}</span>
                        </h3>
                        <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em]">{t('admin.defineMasterpiece')}</p>
                      </div>

                      <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Left Column: Core Data */}
                        <div className="lg:col-span-7 space-y-12">
                          <div className="space-y-8">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center px-1">
                                <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">{t('admin.productTitle')}</label>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!productFormData.name) return
                                    setIsUploading(true)
                                    try {
                                      const translated = await translateProduct({ 
                                        name: productFormData.name, 
                                        description: productFormData.description 
                                      }, 'ar') // Translate to Arabic for now
                                      setProductFormData(prev => ({ 
                                        ...prev, 
                                        name: translated.name,
                                        description: translated.description 
                                      }))
                                    } catch (e) {
                                      console.error(e)
                                    } finally {
                                      setIsUploading(false)
                                    }
                                  }}
                                  className="flex items-center gap-2 text-[10px] font-black text-gold-600 hover:text-gold-700 transition-colors uppercase tracking-widest"
                                >
                                  <Languages className="w-3 h-3" /> Auto-Translate (AR)
                                </button>
                              </div>
                              <input required value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl font-bodoni text-xl font-bold outline-none focus:border-gold-500 transition-all" placeholder="e.g. Classic Silk Vest" />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.price')}</label>
                                <input type="number" step="0.01" required value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: Number(e.target.value) })} className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl font-jost font-bold text-stone-900" />
                              </div>
                              <div className="space-y-3">
                                <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.stockUnits')}</label>
                                <input type="number" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: Number(e.target.value) })} className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl font-jost font-bold text-stone-900" />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.atelierCategory')}</label>
                              <input value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl font-jost font-bold" placeholder="e.g. Evening Wear" />
                            </div>

                            {/* Available Sizes Section */}
                            <div className="space-y-4 pt-4">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.availableSizes')}</label>
                              <div className="flex flex-wrap gap-3">
                                {SIZE_OPTIONS.map(size => (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={`px-8 py-4 rounded-xl font-jost font-bold text-xs transition-all border ${
                                      (productFormData.sizes || []).includes(size)
                                        ? 'bg-stone-900 text-white border-stone-900 shadow-xl'
                                        : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.description')}</label>
                              <textarea value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full p-6 bg-stone-50 border border-stone-100 rounded-2xl font-jost text-sm leading-relaxed min-h-[160px]" placeholder="The narrative behind this creation..." />
                            </div>
                          </div>

                          <div className="bg-stone-50 p-8 md:p-10 rounded-[2.5rem] border border-stone-100 space-y-8">
                            <h4 className="font-bodoni text-2xl font-bold flex items-center gap-3 text-stone-900 uppercase">
                              {t('admin.checkoutBehavior').split(' ')[0]}<br/><span className="text-gold-600">{t('admin.checkoutBehavior').split(' ')[1]}</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {[
                                { id: 'hasCounter', label: t('admin.quantityCounter') },
                                { id: 'trackStock', label: t('admin.trackStock') },
                                { id: 'directCheckout', label: t('admin.directCheckout') },
                                { id: 'isActive', label: t('admin.storefrontVisibility') },
                                { id: 'isAccessory', label: t('admin.isAccessoryPiece') },
                                { id: 'isFootwear', label: t('admin.isFootwearPiece') },
                                { id: 'isCurated', label: t('admin.isCuratedPiece') }
                              ].map((toggle: any) => (
                                <div key={toggle.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-stone-100">
                                  <span className="font-jost text-[10px] font-bold text-stone-900 uppercase tracking-widest">{toggle.label}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => setProductFormData({ ...productFormData, [toggle.id]: !(productFormData as any)[toggle.id] })} 
                                    className={`w-12 h-6 rounded-full transition-all relative ${ (productFormData as any)[toggle.id] ? 'bg-gold-500' : 'bg-stone-100'}`}
                                  >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${ (productFormData as any)[toggle.id] ? 'left-7 shadow-lg' : 'left-1'}`} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Gender Selection Section */}
                            <div className="space-y-4 pt-4 border-t border-stone-100">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.collectionTarget')}</label>
                              <div className="grid grid-cols-3 gap-3">
                                {['men', 'women', 'both'].map(g => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => setProductFormData({ ...productFormData, gender: g })}
                                    className={`py-4 rounded-xl font-jost font-bold text-[10px] transition-all border uppercase tracking-widest ${
                                      productFormData.gender === g
                                        ? 'bg-stone-900 text-white border-stone-900 shadow-xl'
                                        : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200'
                                    }`}
                                  >
                                    {g}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.ctaLabel')}</label>
                              <input value={productFormData.ctaText} onChange={e => setProductFormData({ ...productFormData, ctaText: e.target.value })} className="w-full p-5 bg-white border border-stone-100 rounded-2xl font-jost font-bold uppercase tracking-[0.2em] text-xs" />
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Media & Pricing */}
                        <div className="lg:col-span-5 space-y-12">
                          <div className="bg-stone-900 p-10 rounded-[2.5rem] border border-stone-800 space-y-8 text-white shadow-2xl">
                             <div className="flex items-center justify-between">
                                <h4 className="font-bodoni text-2xl font-bold uppercase tracking-tight">Editorial<br/><span className="text-gold-500">Pricing</span></h4>
                                <TrendingUp className={`w-6 h-6 transition-colors ${productFormData.discountActive ? 'text-gold-500' : 'text-stone-700'}`} />
                             </div>
                            
                            <div className="flex items-center justify-between p-5 bg-stone-800/50 rounded-2xl border border-stone-700">
                              <span className="font-jost text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{t('admin.exclusiveOffer')}</span>
                              <button type="button" onClick={() => setProductFormData({ ...productFormData, discountActive: !productFormData.discountActive })} className={`w-12 h-6 rounded-full transition-all relative ${productFormData.discountActive ? 'bg-gold-500' : 'bg-stone-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${productFormData.discountActive ? 'left-7 shadow-lg' : 'left-1'}`} />
                              </button>
                            </div>

                            {productFormData.discountActive && (
                              <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-3">
                                  <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.discountMagnitude')}</label>
                                  <div className="relative">
                                    <input type="number" value={productFormData.discountPercentage} onChange={e => setProductFormData({ ...productFormData, discountPercentage: Number(e.target.value) })} className="w-full p-5 bg-stone-800 border border-stone-700 rounded-2xl font-jost font-bold text-white text-xl" />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bodoni font-bold text-gold-500 text-2xl">%</span>
                                  </div>
                                </div>
                                <div className="p-5 bg-gold-500/10 rounded-2xl border border-gold-500/20">
                                   <p className="font-jost text-[9px] font-bold text-gold-500 uppercase tracking-widest mb-1">{t('admin.finalAdjustment')}</p>
                                   <p className="font-bodoni text-2xl font-bold">{formatPrice(productFormData.price * (1 - productFormData.discountPercentage / 100), currentStore?.currency || 'USD')}</p>
                                </div>
                              </div>
                            )}

                            <div className="space-y-3 pt-4 border-t border-stone-800">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.productSku')}</label>
                              <input value={productFormData.sku} onChange={e => setProductFormData({ ...productFormData, sku: e.target.value })} className="w-full p-5 bg-stone-800 border border-stone-700 rounded-2xl font-jost font-bold text-stone-400 placeholder-stone-600" placeholder="PRD-VLT-001" />
                            </div>
                          </div>

                          <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 space-y-10 shadow-sm">
                            <h4 className="font-bodoni text-2xl font-bold uppercase text-stone-900 tracking-tight">Visual<br/><span className="text-gold-600">Archives</span></h4>
                            
                              <div className="space-y-6">
                                <div className="relative aspect-[4/5] bg-stone-50 rounded-3xl border-2 border-dashed border-stone-100 overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => mainImageRef.current?.click()}>
                                  {productFormData.image ? (
                                    <img src={productFormData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                  ) : (
                                    <div className="text-center space-y-4">
                                      <Upload className="w-12 h-12 text-stone-200 mx-auto" />
                                      <p className="font-jost text-[10px] font-bold text-stone-300 uppercase tracking-[0.3em]">{t('admin.masterImage')}</p>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <span className="font-jost text-[10px] font-bold text-white uppercase tracking-widest border border-white/20 px-6 py-2 rounded-full backdrop-blur-md">{t('admin.changeVision')}</span>
                                  </div>
                                  <input type="file" ref={mainImageRef} hidden accept="image/*" onChange={e => handleFileUpload(e, 'main')} />
                                </div>

                                {/* Gallery Collection Management */}
                                <div className="space-y-4 pt-4 border-t border-stone-100">
                                  <div className="flex items-center justify-between">
                                    <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.galleryCollection')}</label>
                                    <button 
                                      type="button" 
                                      onClick={() => galleryImagesRef.current?.click()} 
                                      className="font-jost text-[9px] font-bold text-gold-500 uppercase tracking-widest border border-gold-500/20 px-4 py-2 rounded-full hover:bg-gold-500 hover:text-white transition-all"
                                    >
                                      {t('admin.addMultiplePhotos')}
                                    </button>
                                    <input type="file" ref={galleryImagesRef} hidden multiple accept="image/*" onChange={e => handleFileUpload(e, 'gallery')} />
                                  </div>
                                  
                                  <div className="grid grid-cols-4 gap-4">
                                    {(productFormData.images || []).map((img, idx) => (
                                      <div key={idx} className="relative aspect-square bg-stone-50 rounded-xl overflow-hidden group">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            const newImages = [...productFormData.images]
                                            newImages.splice(idx, 1)
                                            setProductFormData({ ...productFormData, images: newImages })
                                          }}
                                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    {(!productFormData.images || productFormData.images.length === 0) && (
                                      <div className="col-span-4 py-10 text-center border-2 border-dashed border-stone-100 rounded-2xl">
                                        <p className="font-jost text-[10px] font-bold text-stone-200 uppercase tracking-widest">{t('admin.noGallery')}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                              <div className="space-y-4">
                                <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] ml-1">{t('admin.videoComposition')}</label>
                                <div className="flex gap-4">
                                  <input value={productFormData.videoUrl} onChange={e => setProductFormData({ ...productFormData, videoUrl: e.target.value })} className="flex-1 p-5 bg-stone-50 border border-stone-100 rounded-2xl font-jost text-sm" placeholder={t('admin.cinemaLinkPlaceholder')} />
                                  <button type="button" onClick={() => videoFileRef.current?.click()} className="p-5 bg-stone-900 text-white rounded-2xl hover:bg-gold-600 transition-colors">
                                    <FileVideo className="w-5 h-5" />
                                  </button>
                                </div>
                                <input type="file" ref={videoFileRef} hidden accept="video/*" onChange={e => handleFileUpload(e, 'video')} />
                              </div>
                            </div>
                          </div>

                          <div className="pt-8 flex flex-col sm:flex-row gap-6">
                            <button type="button" onClick={() => setShowProductForm(false)} className="flex-1 py-6 bg-stone-50 text-stone-400 font-jost font-bold uppercase tracking-[0.3em] text-[10px] rounded-3xl hover:bg-stone-100 transition-all border border-stone-100">{t('admin.cancelAcquisition')}</button>
                            <button type="submit" disabled={isSubmitting || isUploading} className="flex-[1.5] py-6 bg-stone-900 text-white font-jost font-bold uppercase tracking-[0.3em] text-[10px] rounded-3xl shadow-2xl hover:bg-gold-600 transition-all flex items-center justify-center gap-3">
                              {(isSubmitting || isUploading) && <Loader className="w-4 h-4 animate-spin text-gold-500" />}
                              {editingProduct ? t('admin.updateMasterpiece') : t('admin.createMasterpiece')}
                            </button>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Product List */}
              <div className="md:hidden space-y-4">
                {products.map(product => (
                  <div key={product.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-stone-100 shrink-0">
                        {product.image && <img src={product.image} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bodoni font-bold text-base uppercase tracking-tight truncate">{product.name}</div>
                        <div className="font-jost font-bold text-gold-600 text-xs">{formatPrice(product.price, currentStore?.currency || 'USD')}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Stock</span>
                        <span className="text-[10px] font-black">{product.stock} units</span>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Discount</span>
                        {product.discountActive ? (
                          <span className="text-[10px] font-black text-destructive">-{product.discountPercentage}%</span>
                        ) : (
                          <span className="text-[10px] font-black text-stone-300">—</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                       <button onClick={() => handleEditProduct(product)} className="flex-1 py-3 bg-white border border-stone-100 rounded-xl font-black text-[9px] uppercase tracking-widest text-primary flex items-center justify-center gap-2">
                         <Edit className="w-3 h-3" /> {t('admin.edit')}
                       </button>
                       <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 py-3 bg-red-50 border border-red-100 rounded-xl font-black text-[9px] uppercase tracking-widest text-red-500 flex items-center justify-center gap-2">
                         <Trash2 className="w-3 h-3" /> {t('admin.delete')}
                       </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Product Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-[0.2em]">
                    <tr>
                      <th className="py-6 px-4 font-black">Product</th>
                      <th className="py-6 px-4 font-black">Price</th>
                      <th className="py-6 px-4 font-black">Sizes</th>
                      <th className="py-6 px-4 font-black">Discount</th>
                      <th className="py-6 px-4 font-black">Stock</th>
                      <th className="py-6 px-4 text-right font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-stone-100 group hover:bg-stone-50 transition-colors">
                        <td className="py-6 px-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-stone-100 rounded-xl overflow-hidden shadow-inner">
                              {product.image && <img src={product.image} className="w-full h-full object-cover" />}
                            </div>
                            <div className="font-bodoni font-bold text-lg uppercase tracking-tight">{product.name}</div>
                          </div>
                        </td>
                        <td className="py-6 px-4 font-jost font-bold text-gold-600">{formatPrice(product.price, currentStore?.currency || 'USD')}</td>
                        <td className="py-6 px-4">
                           <div className="flex flex-wrap gap-1 max-w-[120px]">
                              {product.sizes?.map((s: string) => (
                                <span key={s} className="text-[8px] font-black bg-stone-900 text-white px-1.5 py-0.5 rounded-sm">{s}</span>
                              )) || <span className="text-stone-300 text-[8px] uppercase tracking-widest">—</span>}
                           </div>
                        </td>
                        <td className="py-6 px-4">
                          {product.discountActive ? (
                            <span className="px-3 py-1 bg-destructive/10 text-destructive text-[10px] font-black rounded-full tracking-widest uppercase">-{product.discountPercentage}%</span>
                          ) : (
                            <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-20">—</span>
                          )}
                        </td>
                        <td className="py-6 px-4 font-black">{product.stock} units</td>
                        <td className="py-6 px-4 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditProduct(product)} className="p-2 hover:bg-primary/10 rounded-xl"><Edit className="w-5 h-5 text-primary" /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-red-500/10 rounded-xl"><Trash2 className="w-5 h-5 text-red-500" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-6 md:space-y-8">
            <div className="bg-card rounded-[2.5rem] md:rounded-[2.5rem] border border-border p-6 md:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Dynamic Banners</h2>
                <button
                  onClick={() => {
                    setEditingBanner(null)
                    setBannerFormData({ title: '', subtitle: '', description: '', imageUrl: '', ctaText: '', ctaLink: '', isActive: true, position: 0 })
                    setShowBannerForm(true)
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black shadow-lg hover:brightness-110 text-sm md:text-base"
                >
                  <Plus className="w-5 h-5" /> Add New Banner
                </button>
              </div>

              {/* Banner Form Modal */}
              <AnimatePresence>
                {showBannerForm && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-10 md:p-16 border border-stone-100 shadow-2xl relative">
                      <button onClick={() => setShowBannerForm(false)} className="absolute top-10 right-10 p-3 hover:bg-stone-50 rounded-full z-10 transition-colors"><X className="w-6 h-6 text-stone-400" /></button>
                      
                      <div className="mb-12">
                        <h3 className="font-bodoni text-4xl font-bold tracking-tight uppercase">
                          {editingBanner ? 'Update' : 'New'}<br/><span className="text-gold-500">Banner</span>
                        </h3>
                      </div>

                      <form onSubmit={handleSubmitBanner} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">{t('admin.bannerTitle')}</label>
                              <input required value={bannerFormData.title} onChange={e => setBannerFormData({ ...bannerFormData, title: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl font-bold" />
                            </div>
                            <div className="space-y-2">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">{t('admin.subtitle')}</label>
                              <input value={bannerFormData.subtitle || ''} onChange={e => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl font-bold" placeholder="e.g. New Arrivals" />
                            </div>
                            <div className="space-y-2">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">{t('admin.ctaText')}</label>
                              <input value={bannerFormData.ctaText || ''} onChange={e => setBannerFormData({ ...bannerFormData, ctaText: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl font-bold" placeholder="Explore Collection" />
                            </div>
                            <div className="space-y-2">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">{t('admin.ctaLink')}</label>
                              <input value={bannerFormData.ctaLink || ''} onChange={e => setBannerFormData({ ...bannerFormData, ctaLink: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl font-bold" placeholder="/shop" />
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">{t('admin.visualArchive')}</label>
                              <div className="relative aspect-video bg-stone-50 rounded-2xl border-2 border-dashed border-stone-100 overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => bannerImageRef.current?.click()}>
                                {bannerFormData.imageUrl ? (
                                  <img src={bannerFormData.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="text-center space-y-2">
                                    <Upload className="w-8 h-8 text-stone-200 mx-auto" />
                                    <p className="font-jost text-[10px] font-bold text-stone-300 uppercase tracking-widest">{t('admin.uploadBanner')}</p>
                                  </div>
                                )}
                                <input type="file" ref={bannerImageRef} hidden accept="image/*" onChange={handleBannerFileUpload} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Description</label>
                              <textarea value={bannerFormData.description || ''} onChange={e => setBannerFormData({ ...bannerFormData, description: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl font-medium min-h-[100px]" placeholder="Brief narrative..." />
                            </div>
                          </div>
                        </div>

                        <div className="pt-8 flex gap-4">
                          <button type="button" onClick={() => setShowBannerForm(false)} className="flex-1 py-4 bg-stone-50 text-stone-400 font-bold uppercase tracking-widest text-[10px] rounded-2xl">Cancel</button>
                          <button type="submit" disabled={isSubmitting || isUploading} className="flex-[2] py-4 bg-stone-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-gold-600 transition-all">
                            {editingBanner ? 'Update Banner' : 'Create Banner'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {banners.map(banner => (
                  <div key={banner.id} className="bg-white rounded-[2rem] sm:rounded-3xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                    <div className="relative aspect-video sm:aspect-square md:aspect-video">
                      <img src={banner.imageUrl} className="w-full h-full object-cover" />
                      
                      {/* Desktop Hover Actions */}
                      <div className="hidden sm:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-3">
                        <button onClick={() => {
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
                        }} className="p-3 bg-white rounded-full text-stone-900 shadow-xl hover:scale-110 transition-transform"><Edit className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteBanner(banner.id)} className="p-3 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform"><Trash2 className="w-5 h-5" /></button>
                      </div>

                      {/* Mobile Always Visible Badge */}
                      <div className="sm:hidden absolute top-4 right-4 flex gap-2">
                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          banner.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 sm:p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <div className="text-[8px] sm:text-[9px] font-bold text-gold-600 uppercase tracking-[0.2em]">{banner.subtitle || t('admin.noSubtitle')}</div>
                          <h4 className="font-bodoni text-lg sm:text-xl font-bold text-stone-900 uppercase tracking-tight">{banner.title}</h4>
                        </div>
                        {/* Mobile Actions */}
                        <div className="sm:hidden flex gap-2">
                           <button onClick={() => {
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
                           }} className="p-2 bg-stone-50 rounded-xl text-stone-900 border border-stone-100"><Edit className="w-4 h-4" /></button>
                           <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 bg-red-50 rounded-xl text-red-500 border border-red-100"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-stone-400 text-[10px] sm:text-xs line-clamp-2 font-medium">{banner.description || 'No description available.'}</p>
                      
                      <div className="mt-4 pt-4 border-t border-stone-50 hidden sm:flex items-center justify-between">
                         <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            banner.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {banner.isActive ? t('admin.active') : t('admin.inactive')}
                         </span>
                         <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Pos: {banner.position}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border p-5 md:p-8 shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-10 tracking-tight">{t('admin.salesOrders')}</h2>
              
              {/* Mobile Orders List */}
              <div className="md:hidden space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-bold text-stone-400 font-jost text-[10px] tracking-widest">#{order.id.split('-')[0].toUpperCase()}</div>
                        <div className="font-bodoni font-bold text-stone-900 uppercase tracking-tight text-sm">{order.customerName}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        order.orderStatus === 'approved' ? 'bg-green-500/10 text-green-500' : 
                        order.orderStatus === 'declined' ? 'bg-red-500/10 text-red-500' : 
                        'bg-stone-100 text-stone-400'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                       <div className="font-jost text-[9px] font-black text-stone-400 uppercase tracking-widest">{t('admin.items')}</div>
                       <div className="space-y-1">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="font-jost text-[10px] font-bold text-stone-600 flex items-center gap-2">
                              <span className="text-gold-600">{item.quantity}x</span>
                              <span className="uppercase">{item.productName}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-stone-200/50">
                      <div className="font-bodoni font-bold text-stone-900 text-base">{formatPrice(order.total, currentStore?.currency || 'USD')}</div>
                      <div className="flex gap-2">
                        {order.orderStatus === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'approved')} className="px-3 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Approve</button>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'declined')} className="px-3 py-2 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Decline</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Orders Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-[0.2em]">
                    <tr>
                      <th className="py-6 px-4 font-black">{t('admin.orderId')}</th>
                      <th className="py-6 px-4 font-black">{t('admin.customer')}</th>
                      <th className="py-6 px-4 font-black">{t('admin.items')}</th>
                      <th className="py-6 px-4 font-black">Status</th>
                      <th className="py-6 px-4 font-black">{t('admin.total')}</th>
                      <th className="py-6 px-4 text-right font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any) => (
                      <tr key={order.id} className="border-b border-stone-100 group hover:bg-stone-50 transition-colors">
                        <td className="py-6 px-4 font-bold text-stone-400 font-jost text-xs tracking-widest">#{order.id.split('-')[0].toUpperCase()}</td>
                        <td className="py-6 px-4">
                          <div className="font-bodoni font-bold text-stone-900 uppercase tracking-tight">{order.customerName}</div>
                          <div className="text-[10px] font-medium text-stone-400 font-jost uppercase tracking-widest">{order.customerEmail}</div>
                        </td>
                        <td className="py-6 px-4">
                          <div className="space-y-1">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item: any) => (
                                <div key={item.id} className="font-jost text-[10px] font-bold text-stone-600 flex items-center gap-2">
                                  <span className="text-gold-600">{item.quantity}x</span>
                                  <span className="uppercase">{item.productName}</span>
                                  {item.selectedSize && <span className="bg-stone-900 text-white px-1.5 py-0.5 rounded-sm text-[8px]">{item.selectedSize}</span>}
                                </div>
                              ))
                            ) : (
                              <div className="text-[9px] font-bold text-stone-300 italic">No Items Found</div>
                            )}
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            order.orderStatus === 'approved' ? 'bg-green-500/10 text-green-500' : 
                            order.orderStatus === 'declined' ? 'bg-red-500/10 text-red-500' : 
                            'bg-stone-100 text-stone-400'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-6 px-4 font-bodoni font-bold text-stone-900">
                          {formatPrice(order.total, currentStore?.currency || 'USD')}
                        </td>
                        <td className="py-6 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {order.orderStatus === 'pending' && (
                              <>
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'approved')} className="px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg text-xs font-black transition-colors">Approve</button>
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'declined')} className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-black transition-colors">Decline</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="md:col-span-1 bg-card rounded-[2rem] border border-border p-8 shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -mr-10 -mt-10" />
                <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">{t('admin.totalSettled')}</span>
                <h2 className="text-4xl md:text-5xl font-black text-green-500 tracking-tight">
                  {formatPrice(orders.filter(o => o.orderStatus === 'approved').reduce((sum, o) => sum + Number(o.total || 0), 0), currentStore?.currency || 'USD')}
                </h2>
                <p className="text-xs text-muted-foreground mt-4 font-bold uppercase tracking-widest">{t('admin.from')} {orders.filter(o => o.orderStatus === 'approved').length} {t('admin.successfulSales')}</p>
              </div>

              <div className="md:col-span-2 bg-card rounded-[2rem] border border-border p-8 shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Zap className="w-5 h-5 text-primary" /> {t('admin.revenueStream')}</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {orders.filter(o => o.orderStatus === 'approved').map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-transparent hover:border-border/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center font-black text-xs">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-black text-sm">{order.customerName}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="font-black text-base text-green-500">
                        +{formatPrice(order.total, currentStore?.currency || 'USD')}
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.orderStatus === 'approved').length === 0 && (
                    <div className="text-center py-20 text-muted-foreground font-bold italic">
                      {t('admin.noSettledRevenue')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-1 md:mb-2 tracking-tight">{t('admin.discountCoupons')}</h2>
                <p className="text-muted-foreground font-medium text-xs md:text-base">{t('admin.manageCoupons')}</p>
              </div>
              <button
                onClick={() => {
                  setEditingCoupon(null)
                  setCouponFormData({
                    code: '',
                    discountType: 'percentage',
                    discountValue: 0,
                    isActive: true,
                    usageLimit: '',
                    expiresAt: ''
                  })
                  setShowCouponForm(true)
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs uppercase tracking-widest font-black">{t('admin.newCoupon')}</span>
              </button>
            </div>

            <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border p-5 md:p-8 shadow-2xl">
              {/* Mobile Coupons List */}
              <div className="md:hidden space-y-4">
                {coupons.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground font-bold italic text-sm">
                    {t('admin.noCoupons')}
                  </div>
                ) : coupons.map((coupon: any) => (
                  <div key={coupon.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bodoni font-bold text-stone-900 tracking-widest text-base uppercase bg-white px-3 py-1 rounded-md border border-stone-100">{coupon.code}</span>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        coupon.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {coupon.isActive ? t('admin.active') : t('admin.inactive')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-stone-200/50 pt-3">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest block">{t('admin.benefit')}</span>
                        <div className="font-jost font-bold text-stone-900 text-sm">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `${formatPrice(coupon.discountValue, currentStore?.currency || 'USD')} OFF`}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest block">{t('admin.usage')}</span>
                        <div className="text-[10px] font-black">{coupon.usageCount} / {coupon.usageLimit || '∞'}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                       <button onClick={() => {
                          setEditingCoupon(coupon)
                          setCouponFormData({
                            code: coupon.code,
                            discountType: coupon.discountType,
                            discountValue: coupon.discountValue,
                            isActive: coupon.isActive,
                            usageLimit: coupon.usageLimit?.toString() || '',
                            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : ''
                          })
                          setShowCouponForm(true)
                       }} className="flex-1 py-3 bg-white border border-stone-100 rounded-xl font-black text-[9px] uppercase tracking-widest text-primary flex items-center justify-center gap-2">
                         <Edit className="w-3 h-3" /> {t('admin.edit')}
                       </button>
                       <button onClick={() => handleDeleteCoupon(coupon.id)} className="flex-1 py-3 bg-red-50 border border-red-100 rounded-xl font-black text-[9px] uppercase tracking-widest text-red-500 flex items-center justify-center gap-2">
                         <Trash2 className="w-3 h-3" /> {t('admin.delete')}
                       </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Coupons Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-[0.2em]">
                    <tr>
                      <th className="py-6 px-4 font-black">{t('admin.code')}</th>
                      <th className="py-6 px-4 font-black">{t('admin.benefit')}</th>
                      <th className="py-6 px-4 font-black">{t('admin.usage')}</th>
                      <th className="py-6 px-4 font-black">{t('delivery.status')}</th>
                      <th className="py-6 px-4 font-black">{t('admin.expires')}</th>
                      <th className="py-6 px-4 text-right font-black">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-muted-foreground font-bold italic">
                          {t('admin.noCoupons')}
                        </td>
                      </tr>
                    ) : coupons.map((coupon: any) => (
                      <tr key={coupon.id} className="border-b border-stone-100 group hover:bg-stone-50 transition-colors">
                        <td className="py-6 px-4">
                          <span className="font-bodoni font-bold text-stone-900 tracking-widest text-lg uppercase bg-stone-100 px-3 py-1 rounded-md border border-stone-200">{coupon.code}</span>
                        </td>
                        <td className="py-6 px-4">
                          <div className="font-jost font-bold text-stone-900">
                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `${formatPrice(coupon.discountValue, currentStore?.currency || 'USD')} OFF`}
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <div className="text-xs font-medium text-stone-500">
                            <span className="font-bold text-stone-900">{coupon.usageCount}</span>
                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            coupon.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {coupon.isActive ? t('admin.active') : t('admin.inactive')}
                          </span>
                        </td>
                        <td className="py-6 px-4">
                          <div className="text-xs font-medium text-stone-500">
                            {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                          </div>
                        </td>
                        <td className="py-6 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingCoupon(coupon)
                                setCouponFormData({
                                  code: coupon.code,
                                  discountType: coupon.discountType,
                                  discountValue: coupon.discountValue,
                                  isActive: coupon.isActive,
                                  usageLimit: coupon.usageLimit?.toString() || '',
                                  expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : ''
                                })
                                setShowCouponForm(true)
                              }}
                              className="p-2 text-muted-foreground hover:text-primary transition-colors bg-secondary rounded-xl hover:bg-primary/10"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="p-2 text-muted-foreground hover:text-red-500 transition-colors bg-secondary rounded-xl hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <AnimatePresence>
              {showCouponForm && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
                  <div className="min-h-screen flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-card w-full max-w-2xl rounded-[2rem] shadow-2xl border border-border relative overflow-hidden"
                    >
                      <button onClick={() => setShowCouponForm(false)} className="absolute top-8 right-8 p-3 hover:bg-secondary rounded-full z-10 transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
                      
                      <div className="p-8 md:p-12">
                        <div className="mb-10">
                          <h2 className="text-3xl font-black tracking-tight">{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</h2>
                          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-2">Define Discount Rules</p>
                        </div>
                        
                        <form onSubmit={handleSubmitCoupon} className="space-y-8">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">{t('admin.couponCode')}</label>
                            <input required type="text" value={couponFormData.code} onChange={e => setCouponFormData({...couponFormData, code: e.target.value.toUpperCase()})} placeholder="e.g., SUMMER2025" className="w-full p-5 bg-secondary/50 border border-border rounded-2xl font-black text-lg focus:border-primary transition-colors outline-none" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">{t('admin.discountType')}</label>
                              <select value={couponFormData.discountType} onChange={e => setCouponFormData({...couponFormData, discountType: e.target.value})} className="w-full p-5 bg-secondary/50 border border-border rounded-2xl font-bold text-sm outline-none">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount</option>
                              </select>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">{t('admin.value')}</label>
                              <input required type="number" step="0.01" min="0" value={couponFormData.discountValue} onChange={e => setCouponFormData({...couponFormData, discountValue: Number(e.target.value)})} placeholder="e.g., 15" className="w-full p-5 bg-secondary/50 border border-border rounded-2xl font-bold text-sm outline-none" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">{t('admin.usageLimit')}</label>
                              <input type="number" min="1" value={couponFormData.usageLimit} onChange={e => setCouponFormData({...couponFormData, usageLimit: e.target.value})} placeholder="e.g., 100" className="w-full p-5 bg-secondary/50 border border-border rounded-2xl font-bold text-sm outline-none" />
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">{t('admin.expiryDate')}</label>
                              <input type="date" value={couponFormData.expiresAt} onChange={e => setCouponFormData({...couponFormData, expiresAt: e.target.value})} className="w-full p-5 bg-secondary/50 border border-border rounded-2xl font-bold text-sm outline-none" />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 p-5 bg-secondary/30 rounded-2xl border border-border">
                            <input type="checkbox" id="coupon-active" checked={couponFormData.isActive} onChange={e => setCouponFormData({...couponFormData, isActive: e.target.checked})} className="w-5 h-5 rounded border-border accent-primary" />
                            <label htmlFor="coupon-active" className="text-sm font-black cursor-pointer">{t('admin.active')}</label>
                          </div>
                          
                          <div className="pt-6 border-t border-border flex gap-4">
                            <button type="button" onClick={() => setShowCouponForm(false)} className="flex-1 py-5 bg-secondary text-muted-foreground font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-secondary/80 transition-all">{t('admin.cancel')}</button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2">
                              {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                              {editingCoupon ? t('admin.updateCoupon') : t('admin.createCoupon')}
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl border border-border">
              <h2 className="text-3xl md:text-4xl font-black mb-8 md:mb-10 tracking-tight flex items-center gap-4"><Settings className="w-8 h-8 md:w-10 md:h-10 text-primary" /> {t('admin.settings')}</h2>
              <form onSubmit={handleUpdateStore} className="space-y-6 md:space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.storeName')}</label>
                  <input required value={storeSettings.name} onChange={e => setStoreSettings({ ...storeSettings, name: e.target.value })} className="w-full p-4 md:p-5 bg-secondary/50 border border-border rounded-xl md:rounded-[1.5rem] font-black text-base md:text-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.currency')}</label>
                    <select value={storeSettings.currency} onChange={e => setStoreSettings({ ...storeSettings, currency: e.target.value })} className="w-full p-4 md:p-5 bg-secondary/50 border border-border rounded-xl md:rounded-[1.5rem] font-black text-base md:text-xl appearance-none">
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.symbol}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.whatsappNumber')}</label>
                    <input value={storeSettings.whatsappNumber} onChange={e => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })} className="w-full p-4 md:p-5 bg-secondary/50 border border-border rounded-xl md:rounded-[1.5rem] font-black text-base md:text-xl" placeholder="+201234567890" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.taxRate')}</label>
                    <div className="relative">
                      <input type="number" step="0.01" value={storeSettings.taxRate} onChange={e => setStoreSettings({ ...storeSettings, taxRate: Number(e.target.value) })} className="w-full p-4 md:p-5 bg-secondary/50 border border-border rounded-xl md:rounded-[1.5rem] font-black text-base md:text-xl" />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.shippingFee')}</label>
                    <input type="number" step="0.01" value={storeSettings.shippingFee} onChange={e => setStoreSettings({ ...storeSettings, shippingFee: Number(e.target.value) })} className="w-full p-4 md:p-5 bg-secondary/50 border border-border rounded-xl md:rounded-[1.5rem] font-black text-base md:text-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.description')}</label>
                  <textarea value={storeSettings.description} onChange={e => setStoreSettings({ ...storeSettings, description: e.target.value })} className="w-full p-4 md:p-5 bg-secondary/50 border border-border rounded-xl md:rounded-[1.5rem] min-h-[100px] md:min-h-[120px] font-medium text-sm md:text-base" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-6 md:pt-8 border-t border-border">
                  <div className="space-y-4">
                    <label className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.storeLogo')}</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary rounded-xl md:rounded-2xl border border-border overflow-hidden flex items-center justify-center">
                        {storeSettings.logoUrl ? <img src={storeSettings.logoUrl} className="w-full h-full object-contain" /> : <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />}
                      </div>
                      <input type="file" id="logo-upload" hidden accept="image/*" onChange={e => handleStoreFileUpload(e, 'logoUrl')} />
                      <label htmlFor="logo-upload" className="px-4 md:px-6 py-2 md:py-3 bg-secondary rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm cursor-pointer hover:bg-secondary/80 transition-colors">{t('admin.upload')}</label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.favicon')}</label>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-lg md:rounded-xl border border-border overflow-hidden flex items-center justify-center">
                        {storeSettings.faviconUrl ? <img src={storeSettings.faviconUrl} className="w-full h-full object-contain" /> : <Globe className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />}
                      </div>
                      <input type="file" id="favicon-upload" hidden accept="image/*" onChange={e => handleStoreFileUpload(e, 'faviconUrl')} />
                      <label htmlFor="favicon-upload" className="px-4 md:px-6 py-2 md:py-3 bg-secondary rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm cursor-pointer hover:bg-secondary/80 transition-colors">{t('admin.upload')}</label>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border space-y-8">
                  <h3 className="text-xl font-black tracking-tight uppercase">{t('admin.categoryBrandImages')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Accessories */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('admin.accessoriesCollection')}</label>
                      <div className="relative aspect-video rounded-2xl bg-secondary border border-border overflow-hidden group">
                        {storeSettings.accessoriesImageUrl ? (
                          <img src={storeSettings.accessoriesImageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <input type="file" hidden accept="image/*" onChange={e => handleStoreFileUpload(e, 'accessoriesImageUrl')} />
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">{t('admin.changeImage')}</span>
                        </label>
                      </div>
                    </div>
                    {/* Footwear */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('admin.footwearCollection')}</label>
                      <div className="relative aspect-video rounded-2xl bg-secondary border border-border overflow-hidden group">
                        {storeSettings.footwearImageUrl ? (
                          <img src={storeSettings.footwearImageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <input type="file" hidden accept="image/*" onChange={e => handleStoreFileUpload(e, 'footwearImageUrl')} />
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">{t('admin.changeImage')}</span>
                        </label>
                      </div>
                    </div>
                    {/* Curated */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('admin.curatedCollection')}</label>
                      <div className="relative aspect-video rounded-2xl bg-secondary border border-border overflow-hidden group">
                        {storeSettings.curatedImageUrl ? (
                          <img src={storeSettings.curatedImageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <input type="file" hidden accept="image/*" onChange={e => handleStoreFileUpload(e, 'curatedImageUrl')} />
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">{t('admin.changeImage')}</span>
                        </label>
                      </div>
                    </div>
                    {/* Brand Ethos */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('admin.brandEthos')}</label>
                      <div className="relative aspect-video rounded-2xl bg-secondary border border-border overflow-hidden group">
                        {storeSettings.ethosImageUrl ? (
                          <img src={storeSettings.ethosImageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <input type="file" hidden accept="image/*" onChange={e => handleStoreFileUpload(e, 'ethosImageUrl')} />
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">{t('admin.changeImage')}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 md:pt-8 border-t border-border">
                </div>

                <button type="submit" disabled={isSubmitting || isUploading} className="w-full py-4 md:py-6 bg-primary text-white rounded-xl md:rounded-[2rem] font-black text-lg md:text-2xl shadow-2xl hover:brightness-110 flex items-center justify-center gap-3 md:gap-4 transition-all">
                  {(isSubmitting || isUploading) && <Loader className="w-5 h-5 md:w-6 md:h-6 animate-spin" />} {t('admin.saveSettings')}
                </button>
              </form>
            </div>
          </div>
        )}
        {activeTab === 'content' && (
          <div className="space-y-8">
            <div className="bg-card rounded-[2.5rem] border border-border p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black tracking-tight mb-10 flex items-center gap-4">
                <FileText className="w-8 h-8 text-primary" /> {t('admin.pagesSocialLinks')}
              </h2>

              <div className="space-y-12">
                {/* Social Links Section */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-border flex-1" />
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">{t('admin.socialNetworkLinks')}</h3>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Share2 className="w-3 h-3 text-blue-600" /> {t('admin.facebookUrl')}
                      </label>
                      <input value={storeSettings.facebookUrl} onChange={e => setStoreSettings({ ...storeSettings, facebookUrl: e.target.value })} className="w-full p-5 bg-secondary/50 border border-border rounded-2xl font-jost font-medium outline-none focus:border-primary transition-all" placeholder="https://facebook.com/yourstore" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Share2 className="w-3 h-3 text-pink-500" /> {t('admin.instagramUrl')}
                      </label>
                      <input value={storeSettings.instagramUrl} onChange={e => setStoreSettings({ ...storeSettings, instagramUrl: e.target.value })} className="w-full p-5 bg-secondary/50 border border-border rounded-2xl font-jost font-medium outline-none focus:border-primary transition-all" placeholder="https://instagram.com/yourstore" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Share2 className="w-3 h-3 text-stone-900" /> {t('admin.tiktokUrl')}
                      </label>
                      <input value={storeSettings.tiktokUrl} onChange={e => setStoreSettings({ ...storeSettings, tiktokUrl: e.target.value })} className="w-full p-5 bg-secondary/50 border border-border rounded-2xl font-jost font-medium outline-none focus:border-primary transition-all" placeholder="https://tiktok.com/@yourstore" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Share2 className="w-3 h-3 text-blue-700" /> {t('admin.linkedinUrl')}
                      </label>
                      <input value={storeSettings.linkedinUrl} onChange={e => setStoreSettings({ ...storeSettings, linkedinUrl: e.target.value })} className="w-full p-5 bg-secondary/50 border border-border rounded-2xl font-jost font-medium outline-none focus:border-primary transition-all" placeholder="https://linkedin.com/company/yourstore" />
                    </div>
                  </div>
                </div>

                {/* Page Content Section */}
                <div className="space-y-10 pt-10 border-t border-border">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.aboutUsContent')}</label>
                    <textarea value={storeSettings.aboutUs} onChange={e => setStoreSettings({ ...storeSettings, aboutUs: e.target.value })} className="w-full p-6 bg-secondary/50 border border-border rounded-[2rem] font-jost font-medium min-h-[200px] outline-none focus:border-primary transition-all" placeholder="Tell your brand's story..." />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.sustainabilityPolicy')}</label>
                    <textarea value={storeSettings.sustainability} onChange={e => setStoreSettings({ ...storeSettings, sustainability: e.target.value })} className="w-full p-6 bg-secondary/50 border border-border rounded-[2rem] font-jost font-medium min-h-[200px] outline-none focus:border-primary transition-all" placeholder="Describe your commitment to the planet..." />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t('admin.privacyPolicy')}</label>
                    <textarea value={storeSettings.privacy} onChange={e => setStoreSettings({ ...storeSettings, privacy: e.target.value })} className="w-full p-6 bg-secondary/50 border border-border rounded-[2rem] font-jost font-medium min-h-[200px] outline-none focus:border-primary transition-all" placeholder="Outline your data protection practices..." />
                  </div>
                </div>

                <div className="pt-10 flex justify-end">
                   <button onClick={handleUpdateStore} disabled={isSubmitting} className="px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:brightness-110 disabled:opacity-50 transition-all">
                      {isSubmitting ? t('admin.saving') : t('admin.saveContentLinks')}
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
