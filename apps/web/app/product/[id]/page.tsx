'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { api } from '@/lib/api'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { useWishlist } from '@/lib/wishlist-context'
import { formatPrice } from '@/lib/currency'
import { 
  Star, 
  ShieldCheck, 
  Clock, 
  Check, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share2, 
  Sparkles, 
  Flame, 
  Archive, 
  Percent, 
  ArrowRight, 
  ShoppingBag, 
  MessageSquare, 
  Ruler, 
  Plus, 
  Minus,
  CheckCircle2,
  Play,
  Film,
  Camera
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import SizeGuideModal from '@/components/product/size-guide-modal'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { currentStore } = useStore()
  const { t, isRTL } = useLanguage()
  const productId = params.id as string
  const { addToCart, isItemInCart, getItemQuantityInCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [product, setProduct] = useState<any | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [isVideoMode, setIsVideoMode] = useState(false)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string; image?: string } | null>(null)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  const DEFAULT_COLORS = [
    { name: 'Onyx Black', hex: '#09090B' },
    { name: 'Ivory Cream', hex: '#FDFBF7' },
    { name: 'Camel Tan', hex: '#C19A6B' },
  ]

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const result = await api.products.get(productId)
        if (!result) {
          setError('Product not found')
        } else {
          setProduct(result)
          setActiveMediaIndex(0)
          
          if (result.sizes && result.sizes.length > 0) {
            setSelectedSize(result.sizes[0])
          }

          const rawColors = (result.colors && result.colors.length > 0)
            ? result.colors
            : (result.customizationOptions?.colors && result.customizationOptions.colors.length > 0)
            ? result.customizationOptions.colors
            : DEFAULT_COLORS
          
          setSelectedColor(rawColors[0])
        }
      } catch (err) {
        setError('Failed to load product')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [productId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border border-gold-500/20 border-t-gold-500 rounded-full animate-spin mx-auto" />
          <p className="font-jost font-medium uppercase tracking-[0.4em] text-[10px]">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="section-container py-24 text-center space-y-8">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
             <AlertCircle className="w-8 h-8 text-stone-300" />
          </div>
          <h2 className="font-bodoni text-4xl font-bold uppercase">{error || t('errors.notFound')}</h2>
          <button 
            onClick={() => router.back()} 
            className="px-10 py-4 bg-stone-900 text-white font-jost text-xs font-bold uppercase tracking-widest shadow-xl"
          >
            {t('productDetail.returnGallery')}
          </button>
        </div>
      </div>
    )
  }

  // Available colors extraction
  const availableColors: Array<{ name: string; hex: string; image?: string }> = 
    (product.colors && product.colors.length > 0)
      ? product.colors
      : (product.customizationOptions?.colors && product.customizationOptions.colors.length > 0)
      ? product.customizationOptions.colors
      : DEFAULT_COLORS

  // Sizes extraction
  const availableSizes: string[] = (product.sizes && product.sizes.length > 0)
    ? product.sizes
    : ['XS', 'S', 'M', 'L', 'XL']

  // Pricing calculations
  const originalPrice = Number(product.price) || 0
  const discountPrice = product.discountActive 
    ? (product.discountPercentage 
       ? originalPrice * (1 - product.discountPercentage / 100) 
       : Number(product.discount_price || product.discountPrice || originalPrice))
    : (product.discountPrice && Number(product.discountPrice) < originalPrice)
    ? Number(product.discountPrice)
    : originalPrice

  const hasDiscount = originalPrice > discountPrice
  const savings = originalPrice - discountPrice
  const discountPercent = product.discountPercentage || (hasDiscount ? Math.round((savings / originalPrice) * 100) : 0)
    
  const colorImages = Array.isArray(product.colors) 
    ? product.colors.map((c: any) => c.image).filter(Boolean)
    : []

  const allImages = Array.from(new Set([
    product.image, 
    ...(product.images || []),
    ...colorImages
  ])).filter(Boolean)

  const currency = currentStore?.currency || 'USD'

  // Wishlist & Cart Status
  const isLiked = isInWishlist(productId)
  const inCart = isItemInCart(productId, selectedSize, selectedColor?.name)
  const inCartQty = getItemQuantityInCart(productId, selectedSize, selectedColor?.name)

  // Archival & Hot Status
  const isArchival = Boolean(product.isPastCollection || product.customizationOptions?.isPastCollection)
  const isHot = Boolean((product.stock > 0 && product.stock <= 15) || product.isCurated)

  // Photo Carousel Controls (Scroll right & left)
  const handlePrevPhoto = () => {
    if (isVideoMode) setIsVideoMode(false)
    setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))
  }

  const handleNextPhoto = () => {
    if (isVideoMode) setIsVideoMode(false)
    setActiveMediaIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))
  }

  const handleSelectColor = (col: any, index: number) => {
    setSelectedColor(col)
    setIsVideoMode(false)
    if (col.image) {
      const idx = allImages.findIndex((img) => img === col.image)
      if (idx !== -1) {
        setActiveMediaIndex(idx)
      }
    } else if (allImages[index]) {
      setActiveMediaIndex(index)
    }
  }

  const handleAddToCart = () => {
    if (!product || quantity <= 0) return
    if (inCart) {
      router.push('/checkout')
      return
    }

    addToCart(product, quantity, selectedSize, selectedColor?.name, selectedColor?.hex)
    
    if (product.directCheckout) {
      router.push('/checkout')
    } else {
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-gold-500 selection:text-white">
      <Header />

      <main className="relative pb-28 lg:pb-24">
        {/* Breadcrumb & Navigation Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 text-xs font-jost font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span>{t('Back to Collection')}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              {t('Garment')} #{productId.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Main Product Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            
            {/* LEFT: Image Gallery with Horizontal Right/Left Scroll & Video Player */}
            <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4 sm:gap-6">
              {/* Desktop Thumbnails Column */}
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-none shrink-0 lg:w-20">
                {/* Photo thumbnails */}
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsVideoMode(false)
                      setActiveMediaIndex(i)
                    }}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      !isVideoMode && activeMediaIndex === i 
                        ? 'border-stone-900 shadow-md scale-105' 
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`${product.name} view ${i + 1}`} />
                  </button>
                ))}

                {/* Video thumbnail trigger if product has video */}
                {product.videoUrl && (
                  <button
                    onClick={() => setIsVideoMode(true)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-stone-900 text-white flex flex-col items-center justify-center gap-1 ${
                      isVideoMode ? 'border-gold-500 shadow-md scale-105' : 'border-stone-800 opacity-70 hover:opacity-100'
                    }`}
                    title={t('Watch Film')}
                  >
                    <Film className="w-5 h-5 text-gold-400" />
                    <span className="text-[8px] font-jost font-bold uppercase tracking-wider text-stone-300">{t('Film')}</span>
                  </button>
                )}
              </div>

              {/* Main Media Showcase Box with Prev/Next Navigation Controls */}
              <div className="flex-1 relative aspect-[3/4] sm:aspect-[4/5] bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200 shadow-sm group/gallery select-none">
                
                {/* Video View or Photo View */}
                {isVideoMode && product.videoUrl ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={product.videoUrl}
                      controls
                      playsInline
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={activeMediaIndex}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      src={allImages[activeMediaIndex] || ''} 
                      className="w-full h-full object-cover sm:object-contain" 
                      alt={product.name} 
                    />
                  </AnimatePresence>
                )}

                {/* Left & Right Arrow Navigation Controls for Scrolling Between Photos */}
                {allImages.length > 1 && !isVideoMode && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-stone-900 shadow-xl backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 z-20`}
                      aria-label="Previous Photo"
                    >
                      {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>

                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-stone-900 shadow-xl backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 z-20`}
                      aria-label="Next Photo"
                    >
                      {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </>
                )}

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
                  {hasDiscount && (
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      <span>-{discountPercent}% {t('OFF')}</span>
                    </span>
                  )}
                  {isArchival && (
                    <span className="px-3 py-1 rounded-full bg-black/85 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-1">
                      <Archive className="w-3 h-3 text-amber-400" />
                      <span>{t('The Archive')}</span>
                    </span>
                  )}
                </div>

                {/* Top Right Action Buttons: Love / Wishlist & Share */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all text-stone-700"
                    title={isLiked ? t('Remove from Wishlist') : t('Private Wishlist')}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-rose-600 fill-rose-600' : 'text-stone-700'}`} />
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: product.name, url: window.location.href }).catch(() => {})
                      } else {
                        navigator.clipboard.writeText(window.location.href)
                        alert('Link copied to clipboard!')
                      }
                    }}
                    className="w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all text-stone-700 hover:text-stone-900"
                    title={t('Share Garment')}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Media Bar: Mode Switcher & Photo Dots Indicator */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                  {/* Photo counter */}
                  {!isVideoMode && (
                    <span className="bg-black/65 backdrop-blur-md text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/10">
                      {activeMediaIndex + 1} / {allImages.length}
                    </span>
                  )}

                  {/* Photo dots */}
                  {!isVideoMode && allImages.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full pointer-events-auto">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveMediaIndex(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            activeMediaIndex === i ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Go to photo ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Video Toggle Button */}
                  {product.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setIsVideoMode(!isVideoMode)}
                      className="pointer-events-auto bg-stone-900/90 hover:bg-stone-900 text-white text-[10px] font-jost font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-stone-700"
                    >
                      {isVideoMode ? (
                        <>
                          <Camera className="w-3 h-3 text-gold-400" />
                          <span>{t('View Photos')}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-gold-400 fill-gold-400" />
                          <span>{t('Watch Film')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Garment Configuration & All Selections */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              {/* Category & Status Header */}
              <div className="space-y-3 pb-6 border-b border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="font-jost text-[11px] font-bold text-gold-600 uppercase tracking-[0.3em]">
                    {t(product.category || 'Atelier Collection')} • {t(product.gender || 'UNISEX')}
                  </span>

                  {isHot && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-500/30">
                      <Flame className="w-3 h-3 fill-current text-amber-600" /> {t('HOT PIECE')}
                    </span>
                  )}
                </div>

                <h1 className="font-bodoni text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight leading-[1.05] text-stone-900">
                  {product.name}
                </h1>

                {/* Price & Savings Valuation */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-stone-900">
                      {formatPrice(discountPrice, currency)}
                    </span>

                    {hasDiscount && (
                      <span className="font-mono text-base text-stone-400 line-through">
                        {formatPrice(originalPrice, currency)}
                      </span>
                    )}
                  </div>

                  {hasDiscount && savings > 0 && (
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                      <span>{t('You Save')} {formatPrice(savings, currency)} ({discountPercent}% {t('Discount')})</span>
                    </p>
                  )}
                </div>

                {/* Stock notice */}
                <div className="flex items-center gap-2 pt-1 text-xs text-stone-500 font-jost">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('In Stock')} — {product.stock} {t('pieces crafted in atelier')}</span>
                </div>
              </div>

              {/* SELECTION 1: COLOR SWATCHES & PALETTE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-jost text-[11px] font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span>{t('Color Selection:')}</span>
                    <span className="text-gold-600 font-bold underline underline-offset-4">
                      {t(selectedColor?.name || 'Standard Shade')}
                    </span>
                  </h3>
                  <span className="text-[10px] text-stone-400 uppercase font-mono">
                    {availableColors.length} {t('Colors')}
                  </span>
                </div>

                {/* Interactive Color Pills */}
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  {availableColors.map((col, index) => {
                    const isSelected = selectedColor?.name === col.name
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => handleSelectColor(col, index)}
                        className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-full border transition-all group ${
                          isSelected
                            ? 'bg-stone-900 border-stone-900 text-white shadow-lg ring-2 ring-gold-500/50 scale-105'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                        }`}
                      >
                        {col.image ? (
                          <div className="w-5 h-5 rounded-full overflow-hidden border border-black/20 shrink-0 relative">
                            <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                            <span 
                              className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
                              style={{ backgroundColor: col.hex }}
                            />
                          </div>
                        ) : (
                          <span
                            className="w-4 h-4 rounded-full border border-black/20 shadow-sm shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: col.hex }}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                          </span>
                        )}
                        <span className="font-jost text-xs font-bold tracking-wide">{t(col.name)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* SELECTION 2: SIZE CHIPS & SIZE GUIDE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-jost text-[11px] font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span>{t('Size:')}</span>
                    <span className="text-gold-600 font-bold">{selectedSize}</span>
                  </h3>
                  <button 
                    onClick={() => setShowSizeGuide(true)} 
                    className="font-jost text-[10px] font-bold text-stone-600 uppercase tracking-widest border-b border-stone-400 hover:text-stone-900 flex items-center gap-1"
                  >
                    <Ruler className="w-3 h-3 text-stone-400" />
                    <span>{t('productDetail.sizeGuide')}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize === size
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[50px] h-12 px-3 rounded-2xl flex items-center justify-center font-jost text-xs font-black uppercase transition-all border ${
                          isSelected 
                            ? 'bg-stone-900 border-stone-900 text-white shadow-md scale-105' 
                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* SELECTION 3: QUANTITY COUNTER & LIVE VALUATION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-jost text-[11px] font-black text-stone-900 uppercase tracking-[0.2em]">
                    {t('Quantity:')}
                  </h3>
                  <span className="font-jost text-[10px] text-stone-400 uppercase tracking-widest">
                    {t('Subtotal Valuation')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700 transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-black text-base text-stone-900">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700 transition-colors"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right pr-2">
                    <span className="font-mono font-black text-lg text-stone-900">
                      {formatPrice(discountPrice * quantity, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTONS */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-5 rounded-2xl text-white font-jost font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl transition-all ${
                    inCart 
                      ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20' 
                      : 'bg-stone-900 hover:bg-stone-800 shadow-stone-900/20'
                  }`}
                >
                  {addedToCart ? (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {t('Added to Your Bag!')}
                    </motion.div>
                  ) : inCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('In Bag')} ({inCartQty}) • {t('View Bag & Checkout')}</span>
                      <ArrowRight className={`w-4 h-4 ml-1 ${isRTL ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('Add to Bag')} · {formatPrice(discountPrice * quantity, currency)}</span>
                    </>
                  )}
                </button>

                {/* Personal Stylist WhatsApp Inquiry */}
                {currentStore?.whatsappNumber && (
                  <a
                    href={`https://wa.me/${currentStore.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello! I am inquiring about the ${product.name} (Selected Color: ${selectedColor?.name || 'Default'}, Size: ${selectedSize}, Qty: ${quantity}). Could you provide styling and fitting advice?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 border border-stone-300 hover:border-stone-900 text-stone-800 font-jost text-xs font-bold uppercase tracking-wider rounded-2xl bg-white shadow-sm transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>{t('Inquire with Personal Stylist (WhatsApp)')}</span>
                  </a>
                )}
              </div>

              {/* Garment Details & Materiality */}
              <div className="space-y-3 pt-4 border-t border-stone-200 text-xs">
                <h4 className="font-jost text-[10px] font-black uppercase tracking-widest text-stone-900">
                  {t('Craftsmanship & Materiality')}
                </h4>
                <p className="font-jost text-xs text-stone-600 leading-relaxed">
                  {product.description || 'Expertly crafted with a focus on silhouette and materiality. This piece embodies the modern ethos of quiet luxury, featuring premium stitching and a timeless cut designed for versatility across seasons.'}
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-gold-500 shrink-0" />
                  <span className="font-jost text-[10px] font-bold uppercase tracking-wider text-stone-500 leading-tight">
                    {t('Authentic Atelier Provenance')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gold-500 shrink-0" />
                  <span className="font-jost text-[10px] font-bold uppercase tracking-wider text-stone-500 leading-tight">
                    {t('Global Express Logistics')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Sticky Bottom Floating Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-stone-200 p-3 flex items-center justify-between gap-3 z-40 shadow-2xl">
          <div className="pl-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {t(selectedColor?.name || 'Color')} • {selectedSize}
            </span>
            <span className="font-mono font-black text-sm text-stone-900">
              {formatPrice(discountPrice * quantity, currency)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`py-3 px-5 rounded-xl font-jost font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all ${
              inCart ? 'bg-emerald-700 text-white' : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('In Bag')} • {t('View')}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('Add to Bag')}</span>
              </>
            )}
          </button>
        </div>

        {/* Sizing Guide Modal */}
        <SizeGuideModal
          isOpen={showSizeGuide}
          onClose={() => setShowSizeGuide(false)}
          category={product.category}
        />
      </main>

      <Footer />
    </div>
  )
}
