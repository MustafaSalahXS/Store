'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/header'
import { api } from '@/lib/api'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { formatPrice } from '@/lib/currency'
import { Star, Shield, Download, Clock, Check, ShoppingCart, AlertCircle, ChevronLeft, PlayCircle, Image as ImageIcon, X, Heart, Share2, Sparkles, Zap, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { currentStore } = useStore()
  const { t } = useLanguage()
  const productId = params.id as string

  const [product, setProduct] = useState<any | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  
  const [activeMedia, setActiveMedia] = useState<string | null>(null)
  const [isVideoActive, setIsVideoActive] = useState(false)
  const [selectedSize, setSelectedSize] = useState('M')

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const result = await api.products.get(productId)
        if (!result) {
          setError('Product not found')
        } else {
          setProduct(result)
          setActiveMedia(result.image || result.images?.[0])
          if (result.sizes && result.sizes.length > 0) {
            setSelectedSize(result.sizes[0])
          }
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

  const handleAddToCart = () => {
    if (!product || quantity <= 0) return
    addToCart(product, quantity, selectedSize)
    
    if (product.directCheckout) {
      router.push('/checkout')
    } else {
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

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
          <button onClick={() => router.back()} className="px-10 py-4 bg-stone-900 text-white font-jost text-xs font-bold uppercase tracking-widest shadow-xl">{t('productDetail.returnGallery')}</button>
        </div>
      </div>
    )
  }

  const discountPrice = product.discountActive 
    ? (product.discountPercentage 
       ? Number(product.price) * (1 - product.discountPercentage / 100) 
       : Number(product.discount_price || product.discountPrice || product.price))
    : Number(product.price)
    
  const allImages = [product.image, ...(product.images || [])].filter(Boolean)
  const currency = currentStore?.currency || 'USD'

  const sizes = ['XS', 'S', 'M', 'L', 'XL']
  const colors = [
    { name: 'Onyx', hex: '#1C1917' },
    { name: 'Stone', hex: '#44403C' },
    { name: 'Gold', hex: '#CA8A04' },
    { name: 'Bone', hex: '#E7E5E4' }
  ]

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-gold-500 selection:text-white">
      <Header />

      <main className="relative pb-32 md:pb-0">
        {/* Mobile Media Stage */}
        <div className="lg:hidden">
          <div className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between relative">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-stone-400">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-bodoni font-bold text-sm text-stone-900 tracking-widest uppercase italic">Digital</span>
            <button className="w-10 h-10 flex items-center justify-center text-stone-400">
              <Heart className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-white px-4 pb-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white mb-6 border border-stone-100">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeMedia}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  src={activeMedia || ''} 
                  className="w-full h-full object-contain" 
                  alt={product.name} 
                />
              </AnimatePresence>
              <div className="absolute bottom-6 left-6 flex gap-2">
                <span className="bg-gold-500 text-white px-3 py-1 rounded-sm text-[8px] font-bold uppercase tracking-widest">{t('productDetail.newCollection')}</span>
              </div>
            </div>

            {/* Mobile Thumbnails */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMedia(img)}
                  className={`relative flex-shrink-0 w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeMedia === img ? 'border-gold-500 scale-105' : 'border-transparent opacity-50'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="section-container hidden lg:grid lg:grid-cols-12 gap-16 py-20">
          {/* Gallery Sidebar */}
          <div className="col-span-1 space-y-4">
             {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMedia(img)}
                  className={`w-full aspect-square rounded-lg overflow-hidden border transition-all ${activeMedia === img ? 'border-gold-500 shadow-lg scale-105' : 'border-stone-200 opacity-40 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
          </div>

          {/* Main Media Area */}
          <div className="col-span-6">
            <div className="bg-white aspect-[4/5] overflow-hidden relative group rounded-2xl shadow-sm">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeMedia}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  src={activeMedia || ''} 
                  className="w-full h-full object-contain" 
                  alt={product.name} 
                />
              </AnimatePresence>
              <div className="absolute top-10 right-10 flex flex-col gap-4">
                 <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all"><Heart className="w-5 h-5 text-stone-900" /></button>
                 <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all"><Share2 className="w-5 h-5 text-stone-900" /></button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="col-span-5 space-y-12 py-10">
            <div className="space-y-4">
              <span className="font-jost text-[10px] font-bold text-gold-600 uppercase tracking-[0.4em]">{t('productDetail.limitedSeries')}</span>
              <div className="space-y-2">
                <h1 className="font-bodoni text-6xl font-bold uppercase leading-none tracking-tighter">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                   <span className="font-bodoni text-3xl font-bold text-stone-900">{formatPrice(discountPrice, currency)}</span>
                   {discountPrice < product.price && (
                     <span className="font-jost text-lg text-stone-400 line-through font-medium">{formatPrice(product.price, currency)}</span>
                   )}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex gap-0.5 text-gold-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <span className="font-jost text-[10px] font-medium text-stone-400 tracking-widest uppercase">{t('productDetail.verifiedQuality')}</span>
              </div>
            </div>

            <div className="space-y-10">
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-jost text-[10px] font-bold text-stone-900 uppercase tracking-widest">{t('productDetail.selectSize')}</h3>
                    <button className="font-jost text-[10px] font-medium text-stone-400 uppercase tracking-widest border-b border-stone-200">{t('productDetail.sizeGuide')}</button>
                  </div>
                  <div className="flex gap-3">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center font-jost text-xs font-bold transition-all border ${selectedSize === size ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-4">
                <h3 className="font-jost text-[10px] font-bold text-stone-900 uppercase tracking-widest">{t('productDetail.quantity')}</h3>
                <div className="flex items-center gap-6">
                   <div className="flex items-center border border-stone-200 rounded-full p-1 bg-white">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center font-jost text-stone-400 hover:text-stone-900 transition-colors"
                      >
                        —
                      </button>
                      <span className="w-12 text-center font-jost font-bold text-sm text-stone-900">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-12 flex items-center justify-center font-jost text-stone-400 hover:text-stone-900 transition-colors"
                      >
                        +
                      </button>
                   </div>
                   <div className="h-10 w-px bg-stone-100 mx-2" />
                   <div className="flex flex-col">
                      <span className="font-jost text-[8px] font-bold text-stone-300 uppercase tracking-widest">{t('productDetail.totalValuation')}</span>
                      <span className="font-bodoni font-bold text-lg text-gold-600">{formatPrice(discountPrice * quantity, currency)}</span>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-jost text-[10px] font-bold text-stone-900 uppercase tracking-widest">{t('productDetail.details')}</h3>
                <p className="font-jost text-sm text-stone-500 leading-relaxed">
                  {product.description || 'Expertly crafted with a focus on silhouette and materiality. This piece embodies the modern ethos of quiet luxury, featuring premium stitching and a timeless cut designed for versatility across seasons.'}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                className="group relative w-full py-6 bg-stone-900 text-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gold-500 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative z-10 font-jost font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                  {addedToCart ? t('productDetail.addedToBag') : t('productDetail.addToBag')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-stone-100">
                 <div className="flex items-center gap-4">
                    <ShieldCheck className="w-5 h-5 text-gold-500" />
                    <span className="font-jost text-[9px] font-bold uppercase tracking-widest text-stone-400 leading-tight">{t('productDetail.globalWarranty').split(' ')[0]}<br/>{t('productDetail.globalWarranty').split(' ')[1] || ''}</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-gold-500" />
                    <span className="font-jost text-[9px] font-bold uppercase tracking-widest text-stone-400 leading-tight">{t('productDetail.premiumLogistics').split(' ')[0]}<br/>{t('productDetail.premiumLogistics').split(' ')[1] || ''}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Info Content */}
        <div className="lg:hidden px-6 pt-10 pb-20 space-y-12">
          <div className="space-y-4">
            <span className="font-jost text-[10px] font-bold text-gold-600 uppercase tracking-[0.4em]">{t('productDetail.limitedSeries')}</span>
            <div className="space-y-2">
              <h1 className="font-bodoni text-2xl font-bold uppercase leading-tight tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-2">
                <span className="font-bodoni text-xl font-bold text-stone-900">{formatPrice(discountPrice, currency)}</span>
                {discountPrice < product.price && (
                  <span className="font-jost text-xs text-stone-400 line-through">{formatPrice(product.price, currency)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-10">
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-jost text-[10px] font-bold text-stone-900 uppercase tracking-widest">{t('productDetail.selectSize')}</h3>
                  <div className="flex gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-jost text-[10px] font-bold transition-all border ${selectedSize === size ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-400'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

             <div className="space-y-4">
                <h3 className="font-jost text-[10px] font-bold text-stone-900 uppercase tracking-widest">{t('productDetail.details')}</h3>
                <p className="font-jost text-xs text-stone-500 leading-relaxed">
                   Expertly crafted with a focus on silhouette and materiality. This piece embodies the modern ethos of quiet luxury.
                </p>
             </div>
          </div>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 p-4 flex gap-4 z-50">
          <button className="w-14 h-14 border border-stone-900 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-stone-900 text-white font-jost font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {addedToCart ? t('productDetail.addedToBag') : t('productDetail.addToBag')} · <span className="text-gold-500">{formatPrice(discountPrice, currency)}</span>
          </button>
        </div>
      </main>
    </div>
  )
}
