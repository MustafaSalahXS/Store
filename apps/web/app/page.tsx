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
import { Search, ArrowRight, ShoppingBag, Star, ShieldCheck, ChevronRight } from 'lucide-react'

export default function Home() {
  const { currentStore } = useStore()
  const { t } = useLanguage()
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

  // Banner rotation logic
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await api.products.list()
        if (result && result.length > 0) {
          setProducts(result)
        }
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [currentStore])

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (!selectedCategory) return matchesSearch
    
    const productCat = product.category?.toLowerCase()
    const productGender = product.gender?.toLowerCase() || 'both'
    const selectedCat = selectedCategory.toLowerCase()
    
    // Handle Men/Women collection filtering using the gender field
    if (selectedCat === 'men') {
      return matchesSearch && (productGender === 'men' || productGender === 'both') && !product.isAccessory
    }
    if (selectedCat === 'women') {
      return matchesSearch && (productGender === 'women' || productGender === 'both') && !product.isAccessory
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
      <section className="relative pt-24 md:pt-48 pb-20 md:pb-40 overflow-hidden">
        <div className="section-container relative z-10 px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8"
          >
            <span className="font-jost text-xs md:text-sm font-medium text-gold-600 uppercase tracking-[0.5em]">The 2025 Collection</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="font-bodoni text-5xl md:text-[140px] font-bold text-stone-900 leading-[0.9] md:leading-[0.8] tracking-tighter uppercase mb-12 md:mb-16"
          >
            Timeless<br />
            <span className="italic font-normal lowercase pr-4">Elegance.</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8"
          >
            <button 
              onClick={() => handleCategoryShop('Men')}
              className="w-full sm:w-auto group relative bg-stone-900 text-white px-10 md:px-14 py-5 md:py-6 font-jost font-bold text-[10px] uppercase tracking-[0.3em] overflow-hidden"
            >
              <span className="relative z-10">{t('home.shopMen')}</span>
              <div className="absolute inset-0 bg-gold-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
            <button 
              onClick={() => handleCategoryShop('Women')}
              className="w-full sm:w-auto group relative border border-stone-900 text-stone-900 px-10 md:px-14 py-5 md:py-6 font-jost font-bold text-[10px] uppercase tracking-[0.3em] overflow-hidden"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-500">{t('home.shopWomen')}</span>
              <div className="absolute inset-0 bg-stone-900 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </motion.div>
        </div>
        
        {/* Decorative background typography */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 font-bodoni text-[20vw] font-bold text-stone-200/40 select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap">
          {t('home.digitalStore')}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="bg-white relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <div className="section-container px-6 py-24 md:py-32 space-y-32 md:space-y-48">
          
          {/* Bento Categories */}
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 md:h-[800px]">
            <div 
              className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-stone-100 cursor-pointer"
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
                    <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/40 transition-all duration-700" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                      <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="font-jost text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-4"
                      >
                        {banners[currentBannerIndex].subtitle || 'Collection'}
                      </motion.span>
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="font-bodoni text-4xl md:text-7xl font-bold text-stone-900 uppercase leading-none group-hover:text-white transition-colors duration-500 whitespace-pre-line"
                      >
                        {banners[currentBannerIndex].title}
                      </motion.h2>
                      {banners[currentBannerIndex].ctaText && (
                        <motion.button 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className="mt-10 px-8 py-3 border border-stone-900 text-stone-900 font-jost text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all bg-white/10 backdrop-blur-sm group-hover:border-white"
                        >
                          {banners[currentBannerIndex].ctaText}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12" onClick={() => handleCategoryShop('New Arrivals')}>
                    <span className="font-jost text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-4">{t('footer.newArrivals')}</span>
                    <h2 className="font-bodoni text-4xl md:text-7xl font-bold text-stone-900 uppercase leading-none">Spring<br/>Essence</h2>
                    <button className="mt-10 px-8 py-3 border border-stone-900 text-stone-900 font-jost text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all">{t('feed.explore')}</button>
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            <div 
              onClick={() => handleCategoryShop('Accessories')}
              className="md:col-span-2 relative group overflow-hidden bg-stone-200 cursor-pointer"
            >
              <img src={currentStore?.accessoriesImageUrl || "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2069&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Accessories" />
              <div className="absolute inset-0 bg-white/40 group-hover:bg-white/20 transition-all duration-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <h2 className="font-bodoni text-3xl md:text-4xl font-bold text-stone-900 uppercase tracking-tight">{t('feed.categories.accessories')}</h2>
                <button className="mt-6 flex items-center gap-2 font-jost text-[10px] font-bold uppercase tracking-widest text-stone-800 group-hover:text-stone-900 transition-colors bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm group-hover:bg-white/80">
                  {t('feed.shopNow')} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div 
              onClick={() => handleCategoryShop('Footwear')}
              className="relative group overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer"
            >
              <img src={currentStore?.footwearImageUrl || "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Footwear" />
              <div className="absolute inset-0 bg-white/40 group-hover:bg-white/20 transition-all duration-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <h2 className="font-bodoni text-3xl md:text-4xl font-bold text-stone-900 uppercase tracking-tight">{t('feed.categories.footwear')}</h2>
                <button className="mt-6 flex items-center gap-2 font-jost text-[10px] font-bold uppercase tracking-widest text-stone-800 group-hover:text-stone-900 transition-colors bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm group-hover:bg-white/80">
                  {t('feed.shopNow')} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div 
              onClick={() => handleCategoryShop('Collections')}
              className="relative group overflow-hidden bg-stone-50 border border-stone-200 cursor-pointer"
            >
              <img src={currentStore?.curatedImageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Curated" />
              <div className="absolute inset-0 bg-white/40 group-hover:bg-white/20 transition-all duration-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <h2 className="font-bodoni text-3xl md:text-4xl font-bold text-stone-900 uppercase tracking-tight bg-white px-4 py-2">{t('feed.curated')}</h2>
                <button className="mt-6 flex items-center gap-2 font-jost text-[10px] font-bold uppercase tracking-widest text-stone-800 group-hover:text-stone-900 transition-colors bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm group-hover:bg-white/80">
                  {t('feed.shopNow')} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Feed */}
          <div id="product-feed" className="space-y-16 scroll-mt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="space-y-4">
                <h2 className="font-bodoni text-5xl md:text-7xl font-bold uppercase text-stone-900 leading-[0.9]">
                   {selectedCategory ? t(`feed.categories.${selectedCategory.toLowerCase()}`) : t('feed.title').split(' ')[0]}<br/>{t('feed.title').split(' ')[1] || ''}
                </h2>
                <div className="w-20 h-1 bg-gold-500" />
              </div>
              
              <div className="flex flex-wrap items-center gap-6 md:gap-10">
                <button 
                  onClick={() => setSelectedCategory(null)} 
                  className={`font-jost text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative py-2 ${selectedCategory === null ? 'text-stone-900' : 'text-stone-300 hover:text-stone-500'}`}
                >
                  {t('feed.all')}
                  {selectedCategory === null && <motion.div layoutId="activeCat" className="absolute bottom-0 left-0 right-0 h-px bg-stone-900" />}
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={`font-jost text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative py-2 ${selectedCategory === cat ? 'text-stone-900' : 'text-stone-300 hover:text-stone-500'}`}
                  >
                    {t(`feed.categories.${cat.toLowerCase()}`)}
                    {selectedCategory === cat && <motion.div layoutId="activeCat" className="absolute bottom-0 left-0 right-0 h-px bg-stone-900" />}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="bg-stone-100 aspect-[4/5] animate-pulse" />
                    <div className="h-4 bg-stone-100 w-2/3 animate-pulse" />
                    <div className="h-4 bg-stone-100 w-1/3 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16"
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
              <div className="py-32 text-center border-y border-stone-100">
                <h3 className="font-bodoni text-3xl font-bold uppercase text-stone-300 tracking-widest">{t('ethos.noProducts')}</h3>
                <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} className="mt-8 font-jost text-[10px] font-bold uppercase tracking-widest text-gold-600 hover:text-gold-700">{t('ethos.clearFilters')}</button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Brand Ethos */}
      <section className="bg-stone-900 text-white py-32 md:py-48 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="section-container px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <span className="font-jost text-xs font-bold text-gold-500 uppercase tracking-[0.5em]">{t('ethos.philosophy')}</span>
            <h2 className="font-bodoni text-5xl md:text-7xl font-bold uppercase leading-none tracking-tighter">
              {t('ethos.title')}<br/>
              <span className="italic font-normal">{t('ethos.quantity')}</span>
            </h2>
            <p className="font-jost text-stone-400 leading-relaxed max-w-md">
              {t('ethos.description')}
            </p>
            <div className="grid grid-cols-2 gap-10 pt-6">
              <div className="space-y-2">
                <span className="font-bodoni text-3xl font-bold text-white">100%</span>
                <p className="font-jost text-[10px] uppercase tracking-widest text-stone-500">{t('ethos.organic')}</p>
              </div>
              <div className="space-y-2">
                <span className="font-bodoni text-3xl font-bold text-white">{t('ethos.ethical')}</span>
                <p className="font-jost text-[10px] uppercase tracking-widest text-stone-500">{t('ethos.manufacturing')}</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] bg-stone-800 overflow-hidden group">
             <img src={currentStore?.ethosImageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60" alt="Sustainability" />
             <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
             <div className="absolute bottom-10 left-10 right-10">
                <h3 className="font-bodoni text-2xl font-bold uppercase mb-2">{t('ethos.futureTitle')}</h3>
                <p className="font-jost text-xs text-stone-400">{t('ethos.futureDesc')}</p>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
