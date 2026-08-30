'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import ProductCard from '@/components/product-card'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store-context'
import { api } from '@/lib/api'
import { useLanguage } from '@/lib/language-context'
import { Search, ArrowRight, ArrowLeft, ShoppingBag, Star, ShieldCheck, ChevronRight, Sparkles, Archive } from 'lucide-react'

export default function Home() {
  const { currentStore } = useStore()
  const { t, isRTL } = useLanguage()
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleCategoryShop = (category: string) => {
    setSelectedCategory(category)
    const element = document.getElementById('product-feed')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    // Handle category from URL if present
    const params = new URLSearchParams(window.location.search)
    const category = params.get('category')
    if (category) {
      setSelectedCategory(category)
      setTimeout(() => {
        document.getElementById('product-feed')?.scrollIntoView({ behavior: 'smooth' })
      }, 500)
    }
  }, [])

  const [banners, setBanners] = useState<any[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const result = await api.banners.list()
        setBanners(result.filter(b => b.isActive))
      } catch (error) {
        console.error('Failed to load banners:', error)
      }
    }
    loadBanners()
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await api.products.list()
        setProducts(result)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Dynamic Categories from API
  const categories = Array.from(
    new Set(
      products
        .map(p => p.category)
        .filter((c): c is string => typeof c === 'string' && c.trim() !== '')
    )
  )

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!selectedCategory) return matchesSearch && !product.isPastCollection

    const productCat = (product.category || '').toLowerCase()
    const productGender = product.gender?.toLowerCase() || 'both'
    const selectedCat = selectedCategory.toLowerCase()
    
    // Handle Past Collections / Archive filtering
    if (selectedCat === 'past' || selectedCat === 'archive' || selectedCat === 'past collections') {
      return matchesSearch && (product.isPastCollection || product.customizationOptions?.isPastCollection)
    }

    // Handle Men/Women collection filtering using the gender field
    if (selectedCat === 'men') {
      return matchesSearch && (productGender === 'men' || productGender === 'both') && !product.isAccessory && !product.isPastCollection
    }
    if (selectedCat === 'women') {
      return matchesSearch && (productGender === 'women' || productGender === 'both') && !product.isAccessory && !product.isPastCollection
    }
    
    // Handle Accessories filtering
    if (selectedCat === 'accessories') {
      return matchesSearch && (product.isAccessory || productCat === 'accessories')
    }
    
    // Handle Footwear filtering
    if (selectedCat === 'footwear') {
      return matchesSearch && (product.isFootwear || productCat === 'footwear')
    }
    
    // Handle Curated filtering
    if (selectedCat === 'collections' || selectedCat === 'curated') {
      return matchesSearch && (product.isCurated || productCat === 'collections' || productCat === 'curated')
    }
    
    return matchesSearch && productCat === selectedCat
  })

  return (
    <div suppressHydrationWarning className="min-h-screen bg-stone-50 text-stone-900 selection:bg-gold-500 selection:text-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 md:pt-48 pb-14 sm:pb-20 md:pb-40 overflow-hidden">
        <div className="section-container relative z-10 px-4 sm:px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-4 sm:mb-8"
          >
            <span className="font-jost text-[10px] sm:text-xs md:text-sm font-semibold text-gold-600 uppercase tracking-[0.4em] sm:tracking-[0.5em]">
              The 2026 Collection
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="font-bodoni text-4xl sm:text-6xl md:text-[130px] font-bold text-stone-900 leading-[0.95] sm:leading-[0.9] md:leading-[0.8] tracking-tighter uppercase mb-8 sm:mb-12 md:mb-16"
          >
            Timeless<br />
            <span className="italic font-normal lowercase pr-2 sm:pr-4">Elegance.</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full max-w-xl mx-auto"
          >
            <Link 
              href="/women"
              className="w-full sm:w-auto flex-1 group relative bg-stone-900 text-white px-6 sm:px-8 py-3.5 sm:py-5 font-jost font-bold text-[10px] sm:text-xs uppercase tracking-[0.25em] overflow-hidden shadow-xl text-center rounded-xl sm:rounded-none"
            >
              <span className="relative z-10">{t("Women's Atelier")}</span>
              <div className="absolute inset-0 bg-gold-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
            <Link 
              href="/men"
              className="w-full sm:w-auto flex-1 group relative bg-stone-900 text-white px-6 sm:px-8 py-3.5 sm:py-5 font-jost font-bold text-[10px] sm:text-xs uppercase tracking-[0.25em] overflow-hidden shadow-xl text-center rounded-xl sm:rounded-none"
            >
              <span className="relative z-10">{t("Men's Sartorial")}</span>
              <div className="absolute inset-0 bg-gold-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
            <Link 
              href="/collections/past"
              className="w-full sm:w-auto flex-1 group relative border border-stone-900 text-stone-900 px-6 sm:px-8 py-3.5 sm:py-5 font-jost font-bold text-[10px] sm:text-xs uppercase tracking-[0.25em] overflow-hidden hover:bg-stone-900 hover:text-white transition-all text-center rounded-xl sm:rounded-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Archive className="w-3.5 h-3.5" /> {t('The Archive')}
              </span>
            </Link>
          </motion.div>
        </div>
        
        {/* Decorative background typography */}
        <div className="absolute -bottom-10 sm:-bottom-20 left-1/2 -translate-x-1/2 font-bodoni text-[22vw] font-bold text-stone-200/30 select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap">
          {t('home.digitalStore')}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="bg-white relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <div className="section-container px-4 sm:px-6 py-16 sm:py-24 md:py-32 space-y-20 sm:space-y-32 md:space-y-48">
          
          {/* Bento Categories - Mobile First with explicit min-heights */}
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[800px]">
            {/* Main Lookbook Poster */}
            <div 
              className="min-h-[340px] sm:min-h-[440px] md:min-h-0 md:col-span-2 md:row-span-2 relative group overflow-hidden bg-stone-100 cursor-pointer rounded-2xl sm:rounded-3xl"
            >
              <AnimatePresence mode="wait">
                {banners.length > 0 ? (
                  <motion.div 
                    key={banners[currentBannerIndex].id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                    onClick={() => {
                      const link = banners[currentBannerIndex].ctaLink;
                      if (link) {
                        if (link.startsWith('/') || link.startsWith('http')) {
                          window.location.href = link;
                        } else {
                          handleCategoryShop(link);
                        }
                      } else {
                        handleCategoryShop(banners[currentBannerIndex].title);
                      }
                    }}
                  >
                    <img 
                      src={banners[currentBannerIndex].imageUrl} 
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                      alt={banners[currentBannerIndex].title}
                    />
                    <div className="absolute inset-0 bg-stone-900/15 group-hover:bg-stone-900/40 transition-all duration-700" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-12">
                      <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="font-jost text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-3 sm:mb-4"
                      >
                        {t(banners[currentBannerIndex].subtitle || 'Collection')}
                      </motion.span>
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="font-bodoni text-3xl sm:text-5xl md:text-7xl font-bold text-stone-900 uppercase leading-none group-hover:text-white transition-colors duration-500 whitespace-pre-line"
                      >
                        {t(banners[currentBannerIndex].title)}
                      </motion.h2>
                      {banners[currentBannerIndex].ctaText && (
                        <motion.button 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className="mt-6 sm:mt-10 px-6 sm:px-8 py-2.5 sm:py-3 border border-stone-900 text-stone-900 font-jost text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all bg-white/20 backdrop-blur-sm group-hover:border-white rounded-full"
                        >
                          {t(banners[currentBannerIndex].ctaText)}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-12" onClick={() => handleCategoryShop('New Arrivals')}>
                    <span className="font-jost text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-4">{t('footer.newArrivals')}</span>
                    <h2 className="font-bodoni text-3xl sm:text-5xl md:text-7xl font-bold text-stone-900 uppercase leading-none">{t('Spring Essence')}</h2>
                    <button className="mt-6 sm:mt-10 px-8 py-3 border border-stone-900 text-stone-900 font-jost text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all rounded-full">{t('feed.explore')}</button>
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Accessories Card */}
            <div 
              onClick={() => handleCategoryShop('Accessories')}
              className="min-h-[220px] sm:min-h-[260px] md:min-h-0 md:col-span-2 relative group overflow-hidden bg-stone-200 cursor-pointer rounded-2xl sm:rounded-3xl"
            >
              <img src={currentStore?.accessoriesImageUrl || "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2069&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Accessories" />
              <div className="absolute inset-0 bg-white/40 group-hover:bg-white/20 transition-all duration-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8">
                <h2 className="font-bodoni text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 uppercase tracking-tight">{t('feed.categories.accessories')}</h2>
                <button className="mt-4 sm:mt-6 flex items-center gap-2 font-jost text-[10px] font-bold uppercase tracking-widest text-stone-800 group-hover:text-stone-900 transition-colors bg-white/60 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm group-hover:bg-white/90">
                  {t('feed.shopNow')} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Footwear Card */}
            <div 
              onClick={() => handleCategoryShop('Footwear')}
              className="min-h-[200px] sm:min-h-[240px] md:min-h-0 relative group overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer rounded-2xl sm:rounded-3xl"
            >
              <img src={currentStore?.footwearImageUrl || "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Footwear" />
              <div className="absolute inset-0 bg-white/40 group-hover:bg-white/20 transition-all duration-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8">
                <h2 className="font-bodoni text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 uppercase tracking-tight">{t('feed.categories.footwear')}</h2>
                <button className="mt-4 sm:mt-6 flex items-center gap-2 font-jost text-[10px] font-bold uppercase tracking-widest text-stone-800 group-hover:text-stone-900 transition-colors bg-white/60 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm group-hover:bg-white/90">
                  {t('feed.shopNow')} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Curated Card */}
            <div 
              onClick={() => handleCategoryShop('Collections')}
              className="min-h-[200px] sm:min-h-[240px] md:min-h-0 relative group overflow-hidden bg-stone-50 border border-stone-200 cursor-pointer rounded-2xl sm:rounded-3xl"
            >
              <img src={currentStore?.curatedImageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Curated" />
              <div className="absolute inset-0 bg-white/40 group-hover:bg-white/20 transition-all duration-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8">
                <h2 className="font-bodoni text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 uppercase tracking-tight bg-white/90 px-4 py-1.5 rounded-xl">{t('feed.curated')}</h2>
                <button className="mt-4 sm:mt-6 flex items-center gap-2 font-jost text-[10px] font-bold uppercase tracking-widest text-stone-800 group-hover:text-stone-900 transition-colors bg-white/60 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm group-hover:bg-white/90">
                  {t('feed.shopNow')} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Feed */}
          <div id="product-feed" className="space-y-10 sm:space-y-16 scroll-mt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
              <div className="space-y-2 sm:space-y-4">
                <h2 className="font-bodoni text-3xl sm:text-5xl md:text-7xl font-bold uppercase text-stone-900 leading-[0.9]">
                   {selectedCategory 
                     ? (selectedCategory.toLowerCase() === 'past' ? t('The Archive') : t(`feed.categories.${selectedCategory.toLowerCase()}`, t(selectedCategory, selectedCategory)))
                     : <>{t('feed.title').split(' ')[0]}<br/>{t('feed.title').split(' ')[1] || ''}</>
                   }
                </h2>
                <div className="w-16 md:w-20 h-1 bg-gold-500" />
              </div>
              
              {/* Swipeable Category Tabs on Mobile */}
              <div className="flex items-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-2 scrollbar-none flex-nowrap w-full md:w-auto -mx-2 px-2">
                <button 
                  onClick={() => setSelectedCategory(null)} 
                  className={`font-jost text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative py-2 shrink-0 ${selectedCategory === null ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700'}`}
                >
                  {t('feed.all')}
                  {selectedCategory === null && <motion.div layoutId="activeCat" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
                </button>
                <button 
                  onClick={() => setSelectedCategory('past')} 
                  className={`font-jost text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative py-2 shrink-0 ${selectedCategory === 'past' ? 'text-amber-800 font-black' : 'text-stone-400 hover:text-stone-700'}`}
                >
                  {t('The Archive')}
                  {selectedCategory === 'past' && <motion.div layoutId="activeCat" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />}
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={`font-jost text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative py-2 shrink-0 ${selectedCategory === cat ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700'}`}
                  >
                    {t(`feed.categories.${cat.toLowerCase()}`, t(cat, cat))}
                    {selectedCategory === cat && <motion.div layoutId="activeCat" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="bg-stone-100 aspect-[4/5] rounded-2xl animate-pulse" />
                    <div className="h-4 bg-stone-100 w-2/3 rounded animate-pulse" />
                    <div className="h-4 bg-stone-100 w-1/3 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-16"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product as any}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="py-24 sm:py-32 text-center border-y border-stone-100">
                <h3 className="font-bodoni text-2xl sm:text-3xl font-bold uppercase text-stone-300 tracking-widest">{t('ethos.noProducts')}</h3>
                <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} className="mt-6 sm:mt-8 font-jost text-[10px] font-bold uppercase tracking-widest text-gold-600 hover:text-gold-700">{t('ethos.clearFilters')}</button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* The Archive & Past Collections Showcase */}
      <section className="bg-stone-950 text-white py-16 sm:py-24 md:py-36 relative overflow-hidden border-t border-stone-800">
        <div className="section-container px-4 sm:px-6 relative z-10 space-y-12 sm:space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span className="font-jost text-[10px] sm:text-xs font-bold text-gold-500 uppercase tracking-[0.4em]">
                  {t('Archival Retrospective')}
                </span>
              </div>
              <h2 className="font-bodoni text-3xl sm:text-5xl md:text-7xl font-bold uppercase leading-none tracking-tight">
                {t('Past Collections.')}<br />
                <span className="italic font-normal text-stone-400">{t('Timeless Capsules.')}</span>
              </h2>
            </div>

            <Link
              href="/collections/past"
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-stone-950 font-jost text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-all rounded-full self-start md:self-auto shadow-2xl"
            >
              <span>{t('Explore The Archive')}</span>
              {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Capsule 1 */}
            <div className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-stone-900 border border-stone-800/80 aspect-[3/4]">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
                alt="AW23 Monolith"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6 space-y-1.5 sm:space-y-2">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-gold-400">
                  {t('Autumn / Winter 2023')}
                </span>
                <h3 className="font-bodoni text-xl sm:text-2xl font-bold text-white uppercase">
                  {t('The Monolith Tailoring')}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-400 line-clamp-2">
                  {t('Heavyweight double-faced virgin wool coats, architectural lapels, and sculpted silhouettes.')}
                </p>
                <Link href="/collections/past" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-400 hover:text-white pt-1">
                  <span>{t('View Capsule')}</span>
                  {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </Link>
              </div>
            </div>

            {/* Capsule 2 */}
            <div className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-stone-900 border border-stone-800/80 aspect-[3/4]">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop"
                alt="SS24 Raw Silk"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6 space-y-1.5 sm:space-y-2">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-gold-400">
                  {t('Spring / Summer 2024')}
                </span>
                <h3 className="font-bodoni text-xl sm:text-2xl font-bold text-white uppercase">
                  {t('Raw Silk & Pure Drape')}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-400 line-clamp-2">
                  {t('Unstructured tailoring in breathable mulberry silk and organic slub linen for effortless warmth.')}
                </p>
                <Link href="/collections/past" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-400 hover:text-white pt-1">
                  <span>{t('View Capsule')}</span>
                  {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </Link>
              </div>
            </div>

            {/* Capsule 3 */}
            <div className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-stone-900 border border-stone-800/80 aspect-[3/4]">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop"
                alt="The Noir Capsule"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6 space-y-1.5 sm:space-y-2">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-gold-400">
                  {t('Atelier Archives')}
                </span>
                <h3 className="font-bodoni text-xl sm:text-2xl font-bold text-white uppercase">
                  {t('The Noir Heritage')}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-400 line-clamp-2">
                  {t('A celebration of monochrome perfection: deep midnight velvets and sharp satin-contrast lapels.')}
                </p>
                <Link href="/collections/past" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-400 hover:text-white pt-1">
                  <span>{t('View Capsule')}</span>
                  {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Ethos */}
      <section className="bg-stone-900 text-white py-20 sm:py-32 md:py-48 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gold-500/10 rounded-full blur-[100px] sm:blur-[120px] -mr-24 sm:-mr-32 -mt-24 sm:-mt-32" />
        <div className="section-container px-4 sm:px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20 items-center">
          <div className="space-y-6 sm:space-y-10">
            <span className="font-jost text-[10px] sm:text-xs font-bold text-gold-500 uppercase tracking-[0.4em] sm:tracking-[0.5em]">{t('ethos.philosophy')}</span>
            <h2 className="font-bodoni text-4xl sm:text-5xl md:text-7xl font-bold uppercase leading-none tracking-tighter">
              {t('ethos.title')}<br/>
              <span className="italic font-normal">{t('ethos.quantity')}</span>
            </h2>
            <p className="font-jost text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md">
              {t('ethos.description')}
            </p>
            <div className="grid grid-cols-2 gap-6 sm:gap-10 pt-4 sm:pt-6">
              <div className="space-y-1.5">
                <span className="font-bodoni text-2xl sm:text-3xl font-bold text-white">100%</span>
                <p className="font-jost text-[9px] sm:text-[10px] uppercase tracking-widest text-stone-500">{t('ethos.organic')}</p>
              </div>
              <div className="space-y-1.5">
                <span className="font-bodoni text-2xl sm:text-3xl font-bold text-white">{t('ethos.ethical')}</span>
                <p className="font-jost text-[9px] sm:text-[10px] uppercase tracking-widest text-stone-500">{t('ethos.manufacturing')}</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] bg-stone-800 overflow-hidden group rounded-2xl sm:rounded-3xl">
             <img src={currentStore?.ethosImageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60" alt="Sustainability" />
             <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
             <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10">
                <h3 className="font-bodoni text-xl sm:text-2xl font-bold uppercase mb-2 text-white">{t('ethos.futureTitle')}</h3>
                <p className="font-jost text-xs text-stone-400">{t('ethos.futureDesc')}</p>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
