'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Video, Image as ImageIcon } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useStore } from '@/lib/store-context'
import { Product } from '@/lib/api'
import { useLanguage } from '@/lib/language-context'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({
  product,
  index = 0,
}: ProductCardProps) {
  const { id, name, price, image, description, category, videoUrl, images = [], discountActive = false, discountPercentage = 0 } = product
  const { currentStore } = useStore()
  const { t } = useLanguage()
  const currency = currentStore?.currency || 'USD'

  return (
    <Link href={`/product/${id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="group h-full"
      >
        <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-border group-hover:border-primary/20">
          {/* Image Container */}
          <div className="relative w-full aspect-square overflow-hidden bg-white">
            <Image
              src={image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80'}
              alt={name}
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-700"
            />

            {/* Media Indicators */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {videoUrl && (
                <div className="bg-black/40 backdrop-blur-xl p-2 rounded-xl text-white border border-white/10">
                  <Video className="w-4 h-4" />
                </div>
              )}
              {images.length > 0 && (
                <div className="bg-black/40 backdrop-blur-xl px-2.5 py-1 rounded-xl text-white text-[10px] font-black flex items-center gap-1.5 border border-white/10 uppercase tracking-widest">
                  <ImageIcon className="w-3 h-3" />
                  {images.length + 1}
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest">{t('feed.viewDetails')}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col text-center">
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-[0.3em] mb-2 font-sans">
              {t('feed.established')} 2025
            </span>
            <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900 mb-3 group-hover:text-amber-600 transition-colors tracking-tight leading-tight">
              {name}
            </h3>
            
            <div className="mt-auto space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 px-2">
                {discountActive && discountPercentage ? (
                  <>
                    <span className="font-serif text-lg md:text-xl font-bold text-stone-900 whitespace-nowrap">
                      {formatPrice(Number(price) * (1 - discountPercentage / 100), currency)}
                    </span>
                    <span className="font-sans text-[10px] md:text-xs font-medium text-stone-400 line-through opacity-60">
                      {formatPrice(price, currency)}
                    </span>
                  </>
                ) : (
                  <span className="font-serif text-lg md:text-xl font-bold text-stone-900 whitespace-nowrap">
                    {formatPrice(price, currency)}
                  </span>
                )}
              </div>
              
              <button className="w-full py-3 border border-stone-900 text-stone-900 font-sans text-xs font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all">
                {t('feed.viewDetails')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
