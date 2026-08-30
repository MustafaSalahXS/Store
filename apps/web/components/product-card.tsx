'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Flame, 
  ArrowRight,
  Archive,
  Percent,
  Check,
  Heart
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useStore } from '@/lib/store-context'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useLanguage } from '@/lib/language-context'
import { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({
  product,
  index = 0,
}: ProductCardProps) {
  const { currentStore } = useStore()
  const { isItemInCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { t, isRTL } = useLanguage()
  const currency = currentStore?.currency || 'USD'

  const {
    id,
    name,
    price,
    image,
    category,
    discountActive = false,
    discountPercentage = 0,
    isPastCollection: explicitPast,
    customizationOptions,
    stock = 10,
    createdAt,
  } = product

  const isLiked = isInWishlist(id)

  const [cardImage, setCardImage] = useState(image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80')
  const [activeColor, setActiveColor] = useState<string | null>(null)

  useEffect(() => {
    setCardImage(image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80')
    setActiveColor(null)
  }, [image])

  // Determine if archival / past collection
  const isPastCollection = explicitPast ?? customizationOptions?.isPastCollection ?? false

  // Determine available colors count
  const availableColors = (product.colors && product.colors.length > 0)
    ? product.colors
    : (customizationOptions?.colors && customizationOptions.colors.length > 0)
    ? customizationOptions.colors
    : []

  // Check if item is already in cart
  const inCart = isItemInCart(id)

  // Calculate pricing & discount
  const originalPrice = Number(price) || 0
  const finalPrice = discountActive && discountPercentage > 0
    ? originalPrice * (1 - discountPercentage / 100)
    : product.discountPrice
    ? Number(product.discountPrice)
    : originalPrice

  const hasDiscount = (discountActive && discountPercentage > 0) || (product.discountPrice && Number(product.discountPrice) < originalPrice)
  const savingsAmount = originalPrice > finalPrice ? originalPrice - finalPrice : 0
  const calculatedPercentage = discountPercentage > 0 
    ? discountPercentage 
    : originalPrice > 0 && savingsAmount > 0 
    ? Math.round((savingsAmount / originalPrice) * 100) 
    : 0

  // Check if "New" (created in last 45 days)
  const isNew = createdAt 
    ? (new Date().getTime() - new Date(createdAt).getTime()) < (45 * 24 * 60 * 60 * 1000)
    : false

  // Check if "Hot" (stock is low or explicitly hot or popular)
  const isHot = (stock > 0 && stock <= 15) || product.isCurated

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative flex flex-col bg-card rounded-2xl sm:rounded-[2rem] overflow-hidden border border-border/80 hover:border-foreground/30 shadow-sm hover:shadow-xl transition-all duration-300 w-full"
    >
      {/* Editorial Aspect Ratio Media with Overlay Badges */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-secondary/30">
        <Link href={`/product/${id}`} className="block w-full h-full">
          <Image
            src={cardImage || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80'}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Top Badges (Left & Right) */}
        <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5 flex items-start justify-between gap-1.5 pointer-events-none">
          {/* Left Badges Stack: Discount / Archive */}
          <div className="flex flex-col gap-1 items-start">
            {hasDiscount && (
              <span className="px-2 sm:px-2.5 py-1 rounded-full bg-rose-600 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Percent className="w-2.5 h-2.5" />
                <span>-{calculatedPercentage}% {t('OFF')}</span>
              </span>
            )}

            {isPastCollection && (
              <span className="px-2 sm:px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-1">
                <Archive className="w-2.5 h-2.5 text-amber-400" />
                <span>{t('Archive')}</span>
              </span>
            )}
          </div>

          {/* Right Badges Stack: New / Hot & Interactive Love Button */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {isHot && (
              <span className="px-2 py-1 rounded-full bg-amber-500 text-stone-950 text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 fill-current" />
                <span>{t('HOT')}</span>
              </span>
            )}

            {isNew && !isHot && (
              <span className="px-2 py-1 rounded-full bg-stone-900/90 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-stone-700">
                <Sparkles className="w-2.5 h-2.5 text-gold-400" />
                <span>{t('NEW')}</span>
              </span>
            )}

            {/* Love / Wishlist Button */}
            <button
              type="button"
              onClick={handleToggleLike}
              className="p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md backdrop-blur-sm transition-transform active:scale-90"
              title={isLiked ? t('Remove from Wishlist') : t('Private Wishlist')}
              aria-label="Toggle Wishlist"
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                  isLiked ? 'text-rose-600 fill-rose-600' : 'text-stone-600 hover:text-rose-600'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Media Bar: Interactive Color Swatches with Live Photo Preview */}
        {availableColors.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-lg">
              {availableColors.slice(0, 5).map((c: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (c.image) setCardImage(c.image)
                    setActiveColor(c.name)
                  }}
                  onMouseEnter={() => {
                    if (c.image) setCardImage(c.image)
                    setActiveColor(c.name)
                  }}
                  className={`w-3 h-3 rounded-full border transition-all ${
                    activeColor === c.name ? 'ring-2 ring-gold-400 scale-125 border-white' : 'border-white/60 hover:scale-115'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name}${c.image ? ' (Click to preview photo)' : ''}`}
                />
              ))}
              <span className="text-[8px] font-bold text-white uppercase tracking-wider pl-1 font-mono">
                {activeColor ? activeColor : `${availableColors.length} ${availableColors.length === 1 ? t('Color') : t('Colors')}`}
              </span>
            </div>

            {inCart && (
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Check className="w-2.5 h-2.5" /> {t('In Bag')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content & Clean CTA */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Gender */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-1">
            <span className="truncate max-w-[70%]">{t(category || 'Apparel')}</span>
            <span className="font-mono text-[8px] sm:text-[9px] shrink-0 text-gold-600">{t(product.gender || 'UNISEX')}</span>
          </div>

          <Link href={`/product/${id}`}>
            <h3 className="font-serif text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors tracking-tight line-clamp-1">
              {name}
            </h3>
          </Link>

          {/* Pricing & Discount Details */}
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-mono font-black text-sm sm:text-lg text-foreground">
                {formatPrice(finalPrice, currency)}
              </span>

              {hasDiscount && (
                <span className="font-mono text-xs text-muted-foreground line-through opacity-70">
                  {formatPrice(originalPrice, currency)}
                </span>
              )}
            </div>

            {/* Discount Savings Notice */}
            {hasDiscount && savingsAmount > 0 && (
              <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                {t('Save')} {formatPrice(savingsAmount, currency)} ({calculatedPercentage}% {t('OFF')})
              </div>
            )}
          </div>
        </div>

        {/* Clean Link to Product Detail Page for Selections */}
        <div className="pt-2 border-t border-border/60">
          <Link
            href={`/product/${id}`}
            className="w-full py-2.5 sm:py-3 px-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-foreground hover:bg-foreground/90 text-background shadow-sm hover:shadow-md group/btn"
          >
            <span>{t('Select Options')}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'} transition-transform`} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
