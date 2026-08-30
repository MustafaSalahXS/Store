'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import ProductCard from '@/components/product-card'
import { api } from '@/lib/api'
import { Product } from '@/lib/types'
import { motion } from 'framer-motion'
import { Sparkles, SlidersHorizontal, ArrowUpDown, X, Archive, Check } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export default function MenPage() {
  const { t, isRTL } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'current' | 'past'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'tailoring', label: 'Tailoring' },
    { id: 'shirts', label: 'Shirts' },
    { id: 'outerwear', label: 'Outerwear' },
    { id: 'knitwear', label: 'Knitwear' },
    { id: 'pants', label: 'Pants' },
    { id: 'accessories', label: 'Accessories' },
  ]

  const sizes = ['S', 'M', 'L', 'XL', 'XXL']
  const colorOptions = [
    { name: 'Onyx Black', hex: '#09090B' },
    { name: 'Navy', hex: '#0F172A' },
    { name: 'Camel Tan', hex: '#C19A6B' },
    { name: 'Ivory Cream', hex: '#FDFBF7' },
    { name: 'Olive', hex: '#3F4E38' },
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.products.list()
        const menProducts = Array.isArray(data)
          ? data.filter((p: any) => p.gender === 'men' || p.gender === 'both')
          : []
        setProducts(menProducts)
      } catch (err) {
        console.error('Failed to load men products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Filtering Logic
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false
    }

    if (selectedSize && (!p.sizes || !p.sizes.includes(selectedSize))) {
      return false
    }

    if (selectedColor) {
      const pColors = p.colors || p.customizationOptions?.colors || []
      const hasCol = pColors.some((c: any) => c.name.toLowerCase() === selectedColor.toLowerCase())
      if (!hasCol) return false
    }

    const isPast = Boolean(p.isPastCollection || p.customizationOptions?.isPastCollection)
    if (collectionFilter === 'current' && isPast) return false
    if (collectionFilter === 'past' && !isPast) return false

    return true
  }).sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.price) - Number(b.price)
    if (sortBy === 'price-high') return Number(b.price) - Number(a.price)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const hasActiveFilters = selectedSize || selectedColor || collectionFilter !== 'all' || selectedCategory !== 'all'

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-gold-500 selection:text-white">
      <Header />

      {/* Editorial Hero Banner */}
      <section className="relative py-16 sm:py-24 md:py-36 bg-zinc-950 text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=2148&auto=format&fit=crop')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="section-container relative z-10 px-4 sm:px-6 text-center space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="font-jost text-[10px] font-bold text-gold-400 uppercase tracking-[0.4em]">
              {t("Men's Sartorial Atelier", 'مشغل أزياء الرجال')}
            </span>
          </div>

          <h1 className="font-bodoni text-4xl sm:text-6xl md:text-8xl font-bold uppercase leading-none tracking-tight">
            {t('Architectural', 'تصاميم معمارية')}<br />
            <span className="italic font-normal text-stone-300">{t('Modern Tailoring.', 'خياطة راقية حديثة.')}</span>
          </h1>

          <p className="font-jost text-xs sm:text-sm text-stone-300 font-light leading-relaxed tracking-wider max-w-xl mx-auto">
            {t('Defined silhouettes, Italian double-faced cashmere, and unstructured wool tailoring engineered for the discerning modern gentleman.', 'تصاميم متميزة وأقمشة الكشمير الإيطالي الفاخرة وخياطة الصوف المصممة للرجل العصري الراقي.')}
          </p>
        </div>
      </section>

      {/* Main Catalog with Faceted Filters */}
      <main className="section-container px-4 sm:px-6 py-10 sm:py-16 space-y-8 sm:space-y-12">
        {/* Filter Controls Bar */}
        <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 border-b border-stone-200">
          {/* Category Chips - Swipeable */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none flex-nowrap -mx-2 px-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-jost font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                {t(cat.label)}
              </button>
            ))}
          </div>

          {/* Mobile Filter Toggle Button */}
          <div className="flex items-center justify-between gap-3 md:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-jost font-bold uppercase tracking-wider transition-all shadow-sm ${
                showMobileFilters 
                  ? 'bg-stone-900 text-white border-stone-900' 
                  : 'bg-white border-stone-300 text-stone-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('Filters')} {hasActiveFilters ? `• ${t('Active')}` : ''}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-white border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-jost font-bold text-stone-800 focus:outline-none"
              >
                <option value="newest">{t('Newest Arrivals')}</option>
                <option value="price-low">{t('Price: Low to High')}</option>
                <option value="price-high">{t('Price: High to Low')}</option>
              </select>
            </div>
          </div>

          {/* Secondary Faceted Filters: Size, Color, Collection & Sort */}
          <div className={`space-y-4 md:space-y-0 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-4 text-xs font-jost font-bold">
                {/* Sizes */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase text-stone-400 mr-1">{t('Size:')}</span>
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                      className={`w-7 h-7 rounded-md text-[10px] uppercase transition-all ${
                        selectedSize === sz
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-px bg-stone-300 hidden sm:block" />

                {/* Colors */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase text-stone-400 mr-1">{t('Color:')}</span>
                  {colorOptions.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(selectedColor === c.name ? null : c.name)}
                      className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                        selectedColor === c.name
                          ? 'ring-2 ring-gold-500 scale-110'
                          : 'hover:scale-105 border-black/10'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={t(c.name)}
                    >
                      {selectedColor === c.name && (
                        <Check className="w-2.5 h-2.5 text-white drop-shadow stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-px bg-stone-300 hidden sm:block" />

                {/* Archival Collection Toggle */}
                <button
                  onClick={() =>
                    setCollectionFilter((prev) => (prev === 'past' ? 'all' : 'past'))
                  }
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider transition-all border ${
                    collectionFilter === 'past'
                      ? 'bg-amber-950 text-amber-200 border-amber-800 shadow-sm'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  <Archive className="w-3 h-3 text-amber-600" />
                  <span>{t('The Archive')}</span>
                </button>
              </div>

              {/* Desktop Sorting */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-jost font-bold">
                  {t('Sort By')}:
                </span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-jost font-bold text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="newest">{t('Newest Arrivals')}</option>
                  <option value="price-low">{t('Price: Low to High')}</option>
                  <option value="price-high">{t('Price: High to Low')}</option>
                </select>
              </div>
            </div>

            {/* Active Filters Clear Button */}
            {hasActiveFilters && (
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedSize(null)
                    setSelectedColor(null)
                    setCollectionFilter('all')
                  }}
                  className="text-[10px] font-jost font-bold uppercase tracking-wider text-rose-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>{t('Clear Filters')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-2 border-stone-200 border-t-gold-500 rounded-full animate-spin mx-auto" />
            <p className="font-jost text-xs uppercase tracking-widest text-stone-400">
              {t('common.loading')}
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-white rounded-3xl border border-stone-100 p-8">
            <p className="font-bodoni text-2xl font-bold uppercase tracking-wider text-stone-400">
              {t('ethos.noProducts')}
            </p>
            <p className="font-jost text-xs text-stone-500 max-w-sm mx-auto">
              No sartorial pieces found matching your filter selections. Try broadening your criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSelectedSize(null)
                setSelectedColor(null)
                setCollectionFilter('all')
              }}
              className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-jost font-bold uppercase tracking-wider hover:bg-stone-800"
            >
              {t('Clear Filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
