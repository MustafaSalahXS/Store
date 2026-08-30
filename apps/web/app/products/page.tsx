'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import ProductCard from '@/components/product-card'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SlidersHorizontal, 
  Search, 
  X, 
  Check, 
  ArrowUpDown, 
  Sparkles, 
  Layers, 
  Tag, 
  RotateCcw,
  Palette,
  ChevronDown
} from 'lucide-react'
import { api } from '@/lib/api'
import { useLanguage } from '@/lib/language-context'
import { useStore } from '@/lib/store-context'
import { formatPrice } from '@/lib/currency'

export default function ProductsPage() {
  const { currentStore } = useStore()
  const { t, isRTL } = useLanguage()
  const currency = currentStore?.currency || 'USD'

  const [products, setProducts] = useState<any[]>([])
  const [storeFilters, setStoreFilters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedGender, setSelectedGender] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [maxProductPrice, setMaxProductPrice] = useState(50000)
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Load products and admin-managed filters
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [productsData, filtersData] = await Promise.all([
          api.products.list().catch(err => { console.error(err); return [] }),
          api.filters.list().catch(err => { console.error(err); return [] })
        ])

        setProducts(productsData.filter((p: any) => p.isActive !== false))
        setStoreFilters(filtersData.filter((f: any) => f.isActive !== false))

        if (productsData.length > 0) {
          const maxP = Math.max(...productsData.map((p: any) => Number(p.price) || 0), 5000)
          const roundedMax = Math.ceil(maxP / 100) * 100
          setMaxProductPrice(roundedMax)
          setPriceRange([0, roundedMax])
        }

        // Support URL search params (e.g. /products?category=Tailoring)
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          const cat = params.get('category')
          if (cat) setSelectedCategory(cat)
          const gender = params.get('gender')
          if (gender) setSelectedGender(gender)
        }
      } catch (error) {
        console.error('Failed to load catalog data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Derive all distinct colors across active products
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>()
    for (const p of products) {
      const colors = Array.isArray(p.colors) && p.colors.length > 0
        ? p.colors
        : (p.customizationOptions?.colors || [])
      for (const c of colors) {
        if (c.name && c.hex) {
          colorMap.set(c.name.trim(), c.hex.trim())
        }
      }
    }
    return Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }))
  }, [products])

  // Derive all distinct sizes across active products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>()
    for (const p of products) {
      if (Array.isArray(p.sizes)) {
        p.sizes.forEach((s: string) => sizes.add(s.trim()))
      }
    }
    return Array.from(sizes)
  }, [products])

  // Split admin filters into categories, collections, materials, and tags
  const adminCategories = useMemo(() => {
    const filterGroup = storeFilters.find(f => f.type === 'category')
    if (filterGroup && Array.isArray(filterGroup.options) && filterGroup.options.length > 0) {
      return filterGroup.options
    }
    // Fallback: derive categories from products
    return Array.from(new Set(products.map(p => p.category).filter(Boolean)))
  }, [storeFilters, products])

  const adminCollections = useMemo(() => {
    const filterGroup = storeFilters.find(f => f.type === 'collection')
    return filterGroup ? filterGroup.options : []
  }, [storeFilters])

  const adminMaterials = useMemo(() => {
    const filterGroup = storeFilters.find(f => f.type === 'material')
    return filterGroup ? filterGroup.options : []
  }, [storeFilters])

  const adminTags = useMemo(() => {
    const filterGroup = storeFilters.find(f => f.type === 'tag')
    return filterGroup ? filterGroup.options : []
  }, [storeFilters])

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = product.name?.toLowerCase().includes(q)
        const matchDesc = product.description?.toLowerCase().includes(q)
        const matchCat = product.category?.toLowerCase().includes(q)
        const matchMaterial = product.material?.toLowerCase().includes(q)
        const matchTags = Array.isArray(product.tags) && product.tags.some((t: string) => t.toLowerCase().includes(q))
        if (!matchName && !matchDesc && !matchCat && !matchMaterial && !matchTags) return false
      }

      // 2. Category
      if (selectedCategory !== 'all') {
        if (selectedCategory.toLowerCase() === 'past' || selectedCategory.toLowerCase() === 'archive') {
          if (!product.isPastCollection && !product.customizationOptions?.isPastCollection) return false
        } else {
          if ((product.category || '').toLowerCase() !== selectedCategory.toLowerCase()) return false
        }
      }

      // 3. Gender
      if (selectedGender !== 'all') {
        const g = (product.gender || 'both').toLowerCase()
        if (g !== 'both' && g !== selectedGender.toLowerCase()) return false
      }

      // 4. Color Swatch
      if (selectedColor) {
        const colors = Array.isArray(product.colors) && product.colors.length > 0
          ? product.colors
          : (product.customizationOptions?.colors || [])
        const hasColor = colors.some((c: any) => c.name?.toLowerCase() === selectedColor.toLowerCase())
        if (!hasColor) return false
      }

      // 5. Size
      if (selectedSize) {
        if (!Array.isArray(product.sizes) || !product.sizes.includes(selectedSize)) return false
      }

      // 6. Materials
      if (selectedMaterials.length > 0) {
        const mat = (product.material || '').toLowerCase()
        const hasMat = selectedMaterials.some(m => mat.includes(m.toLowerCase()))
        if (!hasMat) return false
      }

      // 7. Collections / Tags
      if (selectedCollections.length > 0) {
        const tags = Array.isArray(product.tags) ? product.tags.map((t: string) => t.toLowerCase()) : []
        const hasCol = selectedCollections.some(c => tags.includes(c.toLowerCase()) || (product.name || '').toLowerCase().includes(c.toLowerCase()))
        if (!hasCol) return false
      }

      if (selectedTags.length > 0) {
        const tags = Array.isArray(product.tags) ? product.tags.map((t: string) => t.toLowerCase()) : []
        const hasTag = selectedTags.some(t => tags.includes(t.toLowerCase()))
        if (!hasTag) return false
      }

      // 8. Price Range
      const p = Number(product.price) || 0
      if (p < priceRange[0] || p > priceRange[1]) return false

      return true
    })

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.stock || 0) - (a.stock || 0))
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    }

    return result
  }, [
    products, 
    searchQuery, 
    selectedCategory, 
    selectedGender, 
    selectedColor, 
    selectedSize, 
    selectedMaterials, 
    selectedCollections, 
    selectedTags, 
    priceRange, 
    sortBy
  ])

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedGender !== 'all' ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    selectedMaterials.length +
    selectedCollections.length +
    selectedTags.length +
    (searchQuery.trim() ? 1 : 0)

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedGender('all')
    setSelectedColor(null)
    setSelectedSize(null)
    setSelectedMaterials([])
    setSelectedCollections([])
    setSelectedTags([])
    setPriceRange([0, maxProductPrice])
    setSortBy('newest')
  }

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials(prev => 
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    )
  }

  const toggleCollection = (col: string) => {
    setSelectedCollections(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-gold-500 selection:text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-20">
        {/* Catalog Banner Header */}
        <div className="mb-6 sm:mb-8 border-b border-stone-200 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-primary">
                {isRTL ? 'المشغل والأزياء الحصرية' : 'Atelier Haute Couture & Tailoring'}
              </span>
              <h1 className="font-bodoni text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-stone-900 mt-1">
                {isRTL ? 'التشكيلة والكتالوج الكامل' : 'The Complete Catalog'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xl mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL 
                  ? 'استكشف كافة قطع الأزياء المصممة بعناية وتشكيلات الموسم. خصص اختياراتك حسب الألوان، المقاسات، والخامات.' 
                  : 'Explore hand-tailored garments and seasonal releases. Filter by bespoke colors, sizes, materials, and curated collections.'}
              </p>
            </div>

            {/* Desktop Sort By Dropdown (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-2.5">
              <div className="relative flex items-center bg-white border border-stone-200 rounded-xl px-3 py-2 shadow-sm text-xs font-semibold">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 mr-2 rtl:mr-0 rtl:ml-2 shrink-0" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent outline-none pr-4 rtl:pr-0 rtl:pl-4 cursor-pointer text-stone-800"
                >
                  <option value="newest">{isRTL ? 'الأحدث أولاً' : 'Newest Creations'}</option>
                  <option value="price_asc">{isRTL ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                  <option value="price_desc">{isRTL ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                  <option value="popular">{isRTL ? 'الأكثر طلباً' : 'Most In-Demand'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Pill Strip */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Active Filters:</span>

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-white rounded-full text-[11px] font-bold shadow-sm">
                  <span>Category: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3 hover:text-gold-400" /></button>
                </span>
              )}

              {selectedGender !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-white rounded-full text-[11px] font-bold shadow-sm">
                  <span>Gender: {selectedGender}</span>
                  <button onClick={() => setSelectedGender('all')}><X className="w-3 h-3 hover:text-gold-400" /></button>
                </span>
              )}

              {selectedColor && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-white rounded-full text-[11px] font-bold shadow-sm">
                  <span>Color: {selectedColor}</span>
                  <button onClick={() => setSelectedColor(null)}><X className="w-3 h-3 hover:text-gold-400" /></button>
                </span>
              )}

              {selectedSize && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-white rounded-full text-[11px] font-bold shadow-sm">
                  <span>Size: {selectedSize}</span>
                  <button onClick={() => setSelectedSize(null)}><X className="w-3 h-3 hover:text-gold-400" /></button>
                </span>
              )}

              {selectedMaterials.map(m => (
                <span key={m} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-600 text-white rounded-full text-[11px] font-bold shadow-sm">
                  <span>Material: {m}</span>
                  <button onClick={() => toggleMaterial(m)}><X className="w-3 h-3" /></button>
                </span>
              ))}

              {selectedCollections.map(c => (
                <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-700 text-white rounded-full text-[11px] font-bold shadow-sm">
                  <span>Collection: {c}</span>
                  <button onClick={() => toggleCollection(c)}><X className="w-3 h-3" /></button>
                </span>
              ))}

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-200 text-stone-900 rounded-full text-[11px] font-bold">
                  <span>"{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:underline ml-2 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Grid: Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm h-fit sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-bodoni text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gold-500" />
                <span>Atelier Filters</span>
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-rose-600 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Search within catalog */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search collection..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:bg-white focus:border-gold-500 transition-all"
              />
            </div>

            {/* Gender Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Audience / Gender</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl">
                {['all', 'men', 'women'].map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      selectedGender === g ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Filter (Admin Managed) */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center justify-between">
                <span>Categories</span>
                <span className="font-mono text-[9px] text-stone-400">{adminCategories.length}</span>
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    selectedCategory === 'all' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] opacity-70">{products.length}</span>
                </button>
                {adminCategories.map((cat: string) => {
                  const count = products.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase()).length
                  const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase()
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                        isSelected ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span className="text-[10px] opacity-70 font-mono">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color Swatches (Interactive with Photo Link) */}
            {availableColors.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-gold-500" />
                    <span>Colors & Swatches</span>
                  </label>
                  {selectedColor && (
                    <button onClick={() => setSelectedColor(null)} className="text-[9px] font-bold text-rose-500 hover:underline">
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {availableColors.map(c => {
                    const isSelected = selectedColor === c.name
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(isSelected ? null : c.name)}
                        className={`w-7 h-7 rounded-full border transition-all relative flex items-center justify-center ${
                          isSelected ? 'ring-2 ring-gold-500 ring-offset-2 scale-110 border-white' : 'border-black/20 hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow" />}
                      </button>
                    )
                  })}
                </div>
                {selectedColor && (
                  <p className="text-[10px] font-bold text-gold-600 uppercase tracking-wider mt-1">
                    Selected Shade: {selectedColor}
                  </p>
                )}
              </div>
            )}

            {/* Sizes */}
            {availableSizes.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Garment Size</label>
                  {selectedSize && (
                    <button onClick={() => setSelectedSize(null)} className="text-[9px] font-bold text-rose-500 hover:underline">
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {availableSizes.map(size => {
                    const isSelected = selectedSize === size
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(isSelected ? null : size)}
                        className={`py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all ${
                          isSelected ? 'bg-stone-900 border-stone-900 text-white shadow-sm' : 'border-stone-200 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Curated Collections (Admin Managed) */}
            {adminCollections.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-stone-100">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                  <span>Curated Collections</span>
                </label>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {adminCollections.map((col: string) => {
                    const isSelected = selectedCollections.includes(col)
                    return (
                      <button
                        key={col}
                        onClick={() => toggleCollection(col)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected ? 'bg-purple-50 text-purple-800 border border-purple-200 font-bold' : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span className="truncate">{col}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-700" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Luxury Materials (Admin Managed) */}
            {adminMaterials.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-stone-100">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gold-500" />
                  <span>Luxury Materials & Fabrics</span>
                </label>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {adminMaterials.map((mat: string) => {
                    const isSelected = selectedMaterials.includes(mat)
                    return (
                      <button
                        key={mat}
                        onClick={() => toggleMaterial(mat)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected ? 'bg-gold-50 text-gold-900 border border-gold-300 font-bold' : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span className="truncate">{mat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-gold-700" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Price Range Slider */}
            <div className="space-y-2.5 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[10px] uppercase tracking-widest text-stone-400">Max Price</span>
                <span className="font-mono text-stone-900">{formatPrice(priceRange[1], currency)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxProductPrice}
                step={50}
                value={priceRange[1]}
                onChange={e => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-stone-900 cursor-pointer"
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[4/5] bg-stone-200/60 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 sm:p-16 bg-white rounded-3xl border border-stone-200 text-center space-y-4">
                <SlidersHorizontal className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-bodoni text-2xl font-bold uppercase tracking-tight text-stone-900">
                  No Matching Creations Found
                </h3>
                <p className="font-jost text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                  We could not find any products matching your active filters. Try clearing some filters to view the full collection.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-stone-900 hover:bg-gold-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div>
                {/* Mobile Sticky Quick Filter Bar */}
                <div className="lg:hidden sticky top-16 md:top-24 z-30 bg-stone-50/95 backdrop-blur-md py-2.5 -mx-4 px-4 border-b border-stone-200/80 mb-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* All Filters Trigger Button */}
                    <button
                      onClick={() => setIsMobileFilterOpen(true)}
                      className="flex-1 py-2.5 px-3.5 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 shrink-0"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-primary" />
                      <span>{isRTL ? 'جميع الفلاتر' : 'All Filters'}</span>
                      {activeFiltersCount > 0 && (
                        <span className="bg-primary text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>

                    {/* Quick Sort Dropdown on Mobile */}
                    <div className="relative flex items-center bg-white border border-stone-200 rounded-xl px-2.5 py-2 shadow-xs text-xs font-bold shrink-0">
                      <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="bg-transparent outline-none cursor-pointer text-stone-800 text-[11px] font-bold"
                      >
                        <option value="newest">{isRTL ? 'الأحدث' : 'Newest'}</option>
                        <option value="price_asc">{isRTL ? 'الأقل سعراً' : 'Price: Low'}</option>
                        <option value="price_desc">{isRTL ? 'الأعلى سعراً' : 'Price: High'}</option>
                        <option value="popular">{isRTL ? 'الأكثر طلباً' : 'Popular'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Horizontal Scrollable Categories Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                        selectedCategory === 'all' ? 'bg-primary text-white shadow-xs' : 'bg-white border border-stone-200 text-stone-700'
                      }`}
                    >
                      {isRTL ? 'الكل' : 'All'}
                    </button>
                    {adminCategories.map((cat: string) => {
                      const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase()
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                            isSelected ? 'bg-primary text-white shadow-xs' : 'bg-white border border-stone-200 text-stone-700'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="hidden lg:flex items-center justify-between mb-4 text-xs text-stone-500 font-bold">
                  <span>Showing {filteredProducts.length} Atelier Pieces</span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest">Handmade to order</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                  {filteredProducts.map((prod, idx) => (
                    <ProductCard key={prod.id} product={prod} index={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer Modal (Containing ALL Filters) */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white w-full max-h-[88vh] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 overflow-y-auto space-y-5"
            >
              {/* Mobile Swipe Drag Handle */}
              <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto sm:hidden" />

              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bodoni text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <span>{isRTL ? 'جميع فلاتر التشكيلة' : 'All Collection Filters'}</span>
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. Live Search within catalog */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? 'ابحث بالاسم، القماش، أو الكود...' : 'Search collection...'}
                  className="w-full pl-9 pr-8 rtl:pl-8 rtl:pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:bg-white focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Audience / Gender */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                  {isRTL ? 'الفئة المستهدفة' : 'Audience / Gender'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl">
                  {[
                    { val: 'all', label: isRTL ? 'الكل' : 'All' },
                    { val: 'women', label: isRTL ? 'نساء' : 'Women' },
                    { val: 'men', label: isRTL ? 'رجال' : 'Men' }
                  ].map(g => (
                    <button
                      key={g.val}
                      onClick={() => setSelectedGender(g.val)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        selectedGender === g.val ? 'bg-primary text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Categories with live item counts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                    {isRTL ? 'الأقسام والتصنيفات' : 'Categories'}
                  </label>
                  <span className="text-[10px] font-mono text-stone-400 font-bold">{adminCategories.length + 1}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap max-h-36 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === 'all' ? 'bg-primary text-white shadow-xs' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {isRTL ? 'كل الأقسام' : 'All Categories'} ({products.length})
                  </button>
                  {adminCategories.map((c: string) => {
                    const count = products.filter(p => (p.category || '').toLowerCase() === c.toLowerCase()).length
                    const isSelected = selectedCategory.toLowerCase() === c.toLowerCase()
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedCategory(isSelected ? 'all' : c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected ? 'bg-primary text-white shadow-xs' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {c} ({count})
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 4. Curated Collections (Admin Managed) */}
              {adminCollections.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>{isRTL ? 'التشكيلات الحصرية' : 'Curated Collections'}</span>
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {adminCollections.map((col: string) => {
                      const isSelected = selectedCollections.includes(col)
                      return (
                        <button
                          key={col}
                          onClick={() => toggleCollection(col)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected ? 'bg-purple-700 text-white shadow-xs' : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          <span>{col}</span>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 5. Colors & Swatches */}
              {availableColors.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-primary" />
                      <span>{isRTL ? 'الألوان والدرجات' : 'Colors & Swatches'}</span>
                    </label>
                    {selectedColor && (
                      <button onClick={() => setSelectedColor(null)} className="text-[10px] font-bold text-rose-600 hover:underline">
                        {isRTL ? 'إلغاء' : 'Clear'}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {availableColors.map(c => {
                      const isSelected = selectedColor === c.name
                      return (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(isSelected ? null : c.name)}
                          className={`w-8 h-8 rounded-full border transition-all relative flex items-center justify-center ${
                            isSelected ? 'ring-2 ring-primary ring-offset-2 scale-110 border-white shadow-sm' : 'border-black/20'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow" />}
                        </button>
                      )
                    })}
                  </div>
                  {selectedColor && (
                    <p className="text-[11px] font-bold text-primary mt-1">
                      {isRTL ? `الدرجة المختارة: ${selectedColor}` : `Selected Shade: ${selectedColor}`}
                    </p>
                  )}
                </div>
              )}

              {/* 6. Garment Sizes */}
              {availableSizes.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                      {isRTL ? 'المقاسات المتاحة' : 'Garment Sizes'}
                    </label>
                    {selectedSize && (
                      <button onClick={() => setSelectedSize(null)} className="text-[10px] font-bold text-rose-600 hover:underline">
                        {isRTL ? 'إلغاء' : 'Clear'}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {availableSizes.map(s => {
                      const isSelected = selectedSize === s
                      return (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(isSelected ? null : s)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-black uppercase transition-all ${
                            isSelected ? 'bg-primary text-white shadow-xs' : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 7. Luxury Materials & Fabrics */}
              {adminMaterials.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>{isRTL ? 'الخامات والأقمشة الفاخرة' : 'Luxury Materials & Fabrics'}</span>
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {adminMaterials.map((mat: string) => {
                      const isSelected = selectedMaterials.includes(mat)
                      return (
                        <button
                          key={mat}
                          onClick={() => toggleMaterial(mat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          <span>{mat}</span>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 8. Price Range Slider */}
              <div className="space-y-2 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500">{isRTL ? 'أقصى سعر' : 'Max Price'}</span>
                  <span className="font-mono text-stone-900 font-black">{formatPrice(priceRange[1], currency)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxProductPrice}
                  step={50}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-primary cursor-pointer h-2"
                />
              </div>

              {/* Drawer Apply & Reset Sticky Footer */}
              <div className="pt-4 border-t border-stone-100 flex gap-3 sticky bottom-0 bg-white pb-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-all"
                >
                  {isRTL ? 'إعادة تعيين' : 'Reset'}
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all hover:brightness-110"
                >
                  {isRTL ? `عرض (${filteredProducts.length}) قطعة` : `Show (${filteredProducts.length}) Results`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
