'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ArrowRight, X, CheckCircle2, Sparkles } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { formatPrice } from '@/lib/currency'
import Link from 'next/link'

export default function CartToast() {
  const { lastAddedToast, dismissToast } = useCart()
  const { currentStore } = useStore()
  const currency = currentStore?.currency || 'USD'
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!lastAddedToast) {
      setProgress(100)
      return
    }

    setProgress(100)
    const duration = 4500
    const step = 50
    const decrement = (step / duration) * 100

    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrement))
    }, step)

    const timer = setTimeout(() => {
      dismissToast()
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [lastAddedToast?.timestamp, dismissToast])

  if (!lastAddedToast) return null

  const { product, quantity, size, color, colorHex } = lastAddedToast
  const price = Number(
    product.discountActive && product.discountPercentage
      ? Number(product.price) * (1 - product.discountPercentage / 100)
      : product.discountPrice || product.price
  )
  const itemTotal = price * quantity

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-4 sm:right-6 z-[100] max-w-sm sm:max-w-md w-full"
      >
        <div className="bg-zinc-950 text-white rounded-3xl p-5 shadow-2xl border border-zinc-800 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle gold / primary accent glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Dismiss button */}
          <button
            onClick={dismissToast}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
              Added to Your Bag
            </span>
          </div>

          {/* Product Info Row */}
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800 relative">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-black px-1.5 py-0.5 rounded-md text-white">
                {quantity}x
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-serif font-bold text-sm text-white truncate">
                {product.name}
              </h4>
              
              {/* Badges: Color + Size */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {color && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300">
                    {colorHex && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: colorHex }}
                      />
                    )}
                    <span>{color}</span>
                  </div>
                )}

                {size && (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 uppercase">
                    Size {size}
                  </span>
                )}
              </div>

              {/* Price */}
              <p className="font-mono text-xs font-bold text-amber-400 mt-1.5">
                {formatPrice(itemTotal, currency)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
            <button
              onClick={dismissToast}
              className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
            >
              Continue Browsing
            </button>

            <Link
              href="/checkout"
              onClick={dismissToast}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg"
            >
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Draining Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900">
            <div
              className="h-full bg-amber-500 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
