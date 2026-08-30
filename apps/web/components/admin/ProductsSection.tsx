'use client'

import React, { useState, useMemo } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  ShoppingCart, 
  Package, 
  Search, 
  X, 
  Filter, 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Palette,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'

interface ProductsSectionProps {
  products: any[]
  currentStore: any
  onOpenCreate: () => void
  onOpenEdit: (product: any) => void
  onDelete: (id: string) => void
  onToggleActive?: (product: any) => void
  onExportCsv: () => void
  csvFileRef: React.RefObject<HTMLInputElement | null>
  onCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  t: (key: string, fallback?: string) => string
}

export default function ProductsSection({
  products,
  currentStore,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onToggleActive,
  onExportCsv,
  csvFileRef,
  onCsvUpload,
  t
}: ProductsSectionProps) {
  const { isRTL } = useLanguage()

  // Mobile & Desktop Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'low_stock'>('all')

  // Extract distinct categories from products
  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach(p => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim())
      }
    })
    return Array.from(set)
  }, [products])

  // KPIs
  const totalProductsCount = products.length
  const activeCount = products.filter(p => p.isActive !== false).length
  const inStockCount = products.filter(p => (Number(p.stock) || 0) > 3).length
  const lowOrOutStockCount = products.filter(p => (Number(p.stock) || 0) <= 3).length

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = (p.name || '').toLowerCase().includes(q)
        const matchSku = (p.sku || '').toLowerCase().includes(q)
        const matchCat = (p.category || '').toLowerCase().includes(q)
        const matchDesc = (p.description || '').toLowerCase().includes(q)
        const matchTags = Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q))
        if (!matchName && !matchSku && !matchCat && !matchDesc && !matchTags) return false
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && (p.category || '').trim() !== selectedCategory) {
        return false
      }

      // 3. Status filter
      if (statusFilter === 'active' && p.isActive === false) return false
      if (statusFilter === 'inactive' && p.isActive !== false) return false
      if (statusFilter === 'low_stock' && (Number(p.stock) || 0) > 3) return false

      return true
    })
  }, [products, searchQuery, selectedCategory, statusFilter])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setStatusFilter('all')
  }

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || statusFilter !== 'all'

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-28 sm:pb-8 max-w-full overflow-hidden">
      {/* 4 Summary Status KPIs - Touch-optimized on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {/* Total Products */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
            statusFilter === 'all' && !hasActiveFilters
              ? 'bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20'
              : 'bg-card border-border hover:border-primary/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              {isRTL ? 'إجمالي المنتجات' : 'Total Products'}
            </span>
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-stone-900 font-mono">{totalProductsCount}</p>
          <span className="text-[9px] text-stone-400 block mt-0.5">
            {isRTL ? 'في كتالوج المتجر' : 'In Store Catalog'}
          </span>
        </div>

        {/* Active Products */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
            statusFilter === 'active'
              ? 'bg-green-500/15 border-green-500 shadow-sm ring-2 ring-green-500/20'
              : 'bg-card border-border hover:border-green-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              {isRTL ? 'معروض بالمتجر' : 'Active Storefront'}
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-green-600 font-mono">{activeCount}</p>
          <span className="text-[9px] text-stone-400 block mt-0.5">
            {isRTL ? 'متاح للعملاء للشراء' : 'Visible for Customers'}
          </span>
        </div>

        {/* In Stock Products */}
        <div
          onClick={() => { setStatusFilter('all'); setSelectedCategory('all'); }}
          className="p-3.5 sm:p-5 rounded-2xl border bg-card border-border transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              {isRTL ? 'متوفر بالمخزون' : 'In Stock'}
            </span>
            <Boxes className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-blue-600 font-mono">{inStockCount}</p>
          <span className="text-[9px] text-stone-400 block mt-0.5">
            {isRTL ? 'كميات كافية للطلب' : 'Ready to Dispatch'}
          </span>
        </div>

        {/* Low or Out of Stock Products */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'low_stock' ? 'all' : 'low_stock')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
            statusFilter === 'low_stock'
              ? 'bg-amber-500/15 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
              : 'bg-card border-border hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              {isRTL ? 'منخفض أو نفد' : 'Low / Out of Stock'}
            </span>
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-amber-600 font-mono">{lowOrOutStockCount}</p>
          <span className="text-[9px] text-stone-400 block mt-0.5">
            {isRTL ? 'يحتاج إعادة تزويد' : 'Needs Reorder'}
          </span>
        </div>
      </div>

      {/* Main Products Container */}
      <div className="bg-card rounded-2xl sm:rounded-[2rem] border border-border p-3.5 sm:p-6 md:p-8 shadow-xl">
        {/* Header & Primary Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
              <span>{isRTL ? 'كتالوج وقائمة المنتجات' : t('admin.productCatalog', 'Product Catalog')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL ? 'إدارة كافة قطع الأزياء، الأسعار، المقاسات، المخزون، وربط ألوان الصور.' : t('admin.manageInventory', 'Manage products, pricing, sizes, inventory, and pictures.')}
            </p>
          </div>

          {/* Action Buttons: Responsive Grid on Mobile, Flex on Desktop */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <button
              onClick={onExportCsv}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary hover:bg-secondary/80 font-bold rounded-xl md:rounded-2xl transition-all text-xs tracking-wider border border-border/60 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>{isRTL ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            <button
              onClick={() => csvFileRef.current?.click()}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary hover:bg-secondary/80 font-bold rounded-xl md:rounded-2xl transition-all text-xs tracking-wider border border-border/60 active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
              <span>{isRTL ? 'استيراد CSV' : 'Import CSV'}</span>
            </button>
            <input
              type="file"
              ref={csvFileRef}
              onChange={onCsvUpload}
              accept=".csv"
              className="hidden"
            />

            <button
              onClick={onOpenCreate}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white font-black rounded-xl md:rounded-2xl hover:brightness-110 transition-all shadow-md text-xs sm:text-sm active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isRTL ? 'منتج جديد +' : t('admin.newProduct', 'New Product')}</span>
            </button>
          </div>
        </div>

        {/* Mobile & Desktop Search & Filter Toolbar */}
        <div className="bg-secondary/30 rounded-2xl p-2.5 sm:p-4 border border-border/70 mb-4 sm:mb-6 space-y-2.5 sm:space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 md:col-span-6 relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isRTL ? 'بحث بالاسم، الكود (SKU)، أو القسم...' : 'Search by name, SKU, category...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 rtl:pl-8 rtl:pr-9 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-3 md:col-span-3">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-border rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-primary transition-all text-stone-800"
              >
                <option value="all">{isRTL ? 'جميع الأقسام' : 'All Categories'}</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3 md:col-span-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full py-2.5 px-3 bg-white border border-border rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-primary transition-all text-stone-800"
              >
                <option value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="active">{isRTL ? 'نشط بالمتجر' : 'Active Only'}</option>
                <option value="inactive">{isRTL ? 'معطل' : 'Inactive Only'}</option>
                <option value="low_stock">{isRTL ? 'منخفض أو نفد' : 'Low / Out of Stock'}</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/40 text-[11px]">
              <span className="font-bold text-stone-500">{isRTL ? 'الفلاتر النشطة:' : 'Active:'}</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-border rounded-full text-stone-700 font-medium">
                  <span>"{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')}><X className="w-3 h-3 text-stone-400" /></button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-bold">
                  <span>{selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-900 text-white rounded-full font-bold">
                  <span>
                    {statusFilter === 'active' ? (isRTL ? 'نشط فقط' : 'Active') :
                     statusFilter === 'inactive' ? (isRTL ? 'معطل فقط' : 'Inactive') :
                     (isRTL ? 'مخزون منخفض' : 'Low Stock')}
                  </span>
                  <button onClick={() => setStatusFilter('all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-rose-600 hover:underline font-bold text-[11px] flex items-center gap-1 ml-auto rtl:ml-0 rtl:mr-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isRTL ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Product Cards List (Touch-First & Fluid) */}
        <div className="md:hidden space-y-3">
          {filteredProducts.map((product: any) => {
            const stockNum = Number(product.stock) || 0
            const isOutOfStock = stockNum === 0
            const isLowStock = stockNum > 0 && stockNum <= 3
            const colorsList = Array.isArray(product.colors) ? product.colors : []
            const sizesList = Array.isArray(product.sizes) ? product.sizes : []

            return (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-sm space-y-3 transition-all hover:border-primary/30"
              >
                {/* Top Row: Thumbnail + Core Info */}
                <div className="flex gap-3 items-start">
                  <div className="w-20 h-20 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 relative shadow-2xs">
                    <img 
                      src={product.image || (product.images && product.images[0]) || '/placeholder.png'} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                    {product.discountActive && product.discountPercentage > 0 && (
                      <span className="absolute top-1 left-1 rtl:left-auto rtl:right-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                        %{product.discountPercentage}-
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-stone-900 text-sm leading-snug line-clamp-1">
                        {product.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[9px] font-bold">
                        {product.category || (isRTL ? 'عام' : 'General')}
                      </span>
                      {product.sku && (
                        <span className="text-[9px] font-mono text-stone-400 font-semibold">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>

                    {/* Price & Cost */}
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="font-black text-primary text-sm font-mono">
                        {formatPrice(product.price, currentStore?.currency || 'USD')}
                      </span>
                      {product.cost > 0 && (
                        <span className="text-[10px] text-stone-400 font-medium">
                          {isRTL ? 'التكلفة:' : 'Cost:'} {formatPrice(product.cost, currentStore?.currency || 'USD')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mid Row: Stock Badge + Sizes + Colors */}
                <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-2.5 text-[11px]">
                  {/* Stock Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black ${
                      isOutOfStock
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isLowStock
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      <Package className="w-3 h-3" />
                      <span>
                        {isOutOfStock 
                          ? (isRTL ? 'نفد من المخزون' : 'Out of Stock') 
                          : isLowStock
                          ? (isRTL ? `متبقي ${stockNum} فقط` : `Low Stock: ${stockNum}`)
                          : (isRTL ? `${stockNum} قطعة متوفرة` : `${stockNum} in stock`)}
                      </span>
                    </span>
                  </div>

                  {/* Colors Preview dots */}
                  {colorsList.length > 0 && (
                    <div className="flex items-center gap-1">
                      {colorsList.slice(0, 4).map((c: any, i: number) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs block"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                      {colorsList.length > 4 && (
                        <span className="text-[9px] font-bold text-stone-400">+{colorsList.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Sizes Chips */}
                {sizesList.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    <span className="text-[9px] text-stone-400 font-bold uppercase">{isRTL ? 'المقاسات:' : 'Sizes:'}</span>
                    {sizesList.map((s: string) => (
                      <span key={s} className="px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded text-[9px] font-mono font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Storefront Toggle on Mobile */}
                <div className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2 border border-stone-100">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    {product.isActive !== false ? (
                      <Eye className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                    )}
                    <span>{product.isActive !== false ? (isRTL ? 'معروض بالمتجر' : 'Active on Store') : (isRTL ? 'مخفي عن العملاء' : 'Hidden from Store')}</span>
                  </span>

                  {onToggleActive && (
                    <button
                      type="button"
                      onClick={() => onToggleActive(product)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        product.isActive !== false ? 'bg-primary' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          product.isActive !== false ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Mobile Action Buttons: Touch Friendly 44px height */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onOpenEdit(product)}
                    className="min-h-[44px] py-2.5 px-3 bg-secondary hover:bg-secondary/80 text-stone-900 border border-border/80 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5 text-primary" />
                    <span>{isRTL ? 'تعديل المنتج' : t('admin.edit', 'Edit')}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(isRTL ? `هل أنت متأكد من حذف المنتج "${product.name}"؟` : `Delete product "${product.name}"?`)) {
                        onDelete(product.id)
                      }
                    }}
                    className="min-h-[44px] py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isRTL ? 'حذف المنتج' : t('admin.delete', 'Delete')}</span>
                  </button>
                </div>
              </div>
            )
          })}

          {filteredProducts.length === 0 && (
            <div className="py-12 px-4 text-center bg-stone-50 rounded-2xl border border-stone-200/70 space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-stone-600 font-bold text-sm">
                {isRTL ? 'لا توجد منتجات مطابقة لخيارات البحث.' : 'No matching products found.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'إلغاء الفلاتر' : 'Clear Filters'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop Product Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-start rtl:text-right">
            <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 font-black">{isRTL ? 'المنتج' : t('admin.product', 'Product')}</th>
                <th className="py-4 px-4 font-black">{isRTL ? 'التصنيف' : t('admin.category', 'Category')}</th>
                <th className="py-4 px-4 font-black">{isRTL ? 'سعر البيع' : t('admin.price', 'Price')}</th>
                <th className="py-4 px-4 font-black">{isRTL ? 'المخزون' : t('admin.stock', 'Stock')}</th>
                <th className="py-4 px-4 font-black">{isRTL ? 'الحالة' : t('delivery.status', 'Status')}</th>
                <th className="py-4 px-4 text-end font-black">{isRTL ? 'الإجراءات' : t('admin.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product: any) => {
                const stockNum = Number(product.stock) || 0
                return (
                  <tr key={product.id} className="border-b border-stone-100 group hover:bg-stone-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 relative">
                          <img 
                            src={product.image || (product.images && product.images[0]) || '/placeholder.png'} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-stone-900 line-clamp-1">{product.name}</div>
                          <div className="text-xs text-stone-400 font-mono font-medium">SKU: {product.sku || product.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-stone-100 rounded-full text-xs font-bold text-stone-700">
                        {product.category || (isRTL ? 'عام' : 'General')}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-black text-sm text-primary">
                      {formatPrice(product.price, currentStore?.currency || 'USD')}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                        stockNum === 0 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : stockNum <= 3
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {stockNum} {isRTL ? 'قطعة' : 'units'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {onToggleActive ? (
                        <button
                          type="button"
                          onClick={() => onToggleActive(product)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            product.isActive !== false ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {product.isActive !== false ? (isRTL ? 'نشط بالمتجر' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                        </button>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                        }`}>
                          {product.isActive !== false ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenEdit(product)}
                          className="p-2 text-stone-500 hover:text-stone-900 bg-secondary rounded-xl hover:bg-stone-200 transition-colors active:scale-95"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(isRTL ? `حذف المنتج "${product.name}"؟` : `Delete product "${product.name}"?`)) {
                              onDelete(product.id)
                            }
                          }}
                          className="p-2 text-stone-500 hover:text-rose-600 bg-secondary rounded-xl hover:bg-rose-50 transition-colors active:scale-95"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground font-bold italic text-sm">
                    {isRTL ? 'لا توجد منتجات مضافة مطابقة للبحث.' : t('admin.noProducts', 'No products found.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
