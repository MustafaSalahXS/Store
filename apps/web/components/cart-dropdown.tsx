'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { useStore } from '@/lib/store-context'
import { formatPrice } from '@/lib/currency'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Plus, Minus, ShoppingBag } from 'lucide-react'

export default function CartDropdown() {
  const { items, total, removeFromCart, updateQuantity } = useCart()
  const { currentStore } = useStore()
  const [isOpen, setIsOpen] = useState(false)

  const currency = currentStore?.currency || 'USD'

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 transition-all shadow-xl"
        aria-label="Shopping cart"
      >
        <ShoppingBag className="w-4.5 h-4.5" />
        {items.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-950 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white shadow-lg"
          >
            {items.length}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 bg-stone-900/20 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[4.5rem] sm:top-16 w-[calc(100vw-2rem)] sm:w-[24rem] bg-white border border-stone-100 rounded-[2.5rem] sm:rounded-[2rem] shadow-[0_40px_120px_rgba(0,0,0,0.25)] z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-stone-50 flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="font-bodoni text-xl font-bold tracking-tight uppercase">Your Bag</h3>
                  <span className="font-jost text-[9px] font-bold text-gold-600 uppercase tracking-widest">{items.length} Items Selected</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400"><X className="w-4 h-4" /></button>
              </div>

              <div className="max-h-[24rem] sm:max-h-[28rem] overflow-y-auto p-5 space-y-5">
                {items.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-6 h-6 text-stone-200" />
                    </div>
                    <p className="font-bodoni text-lg font-bold text-stone-300 uppercase tracking-widest">Your bag is empty</p>
                    <button onClick={() => setIsOpen(false)} className="font-jost text-[9px] font-bold text-gold-600 uppercase tracking-widest border-b border-gold-200">Start Shopping</button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex gap-4 group">
                      <div className="w-16 h-16 bg-stone-50 rounded-lg overflow-hidden flex-shrink-0 relative border border-stone-100">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-stone-200" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div className="space-y-0.5">
                          <Link href={`/product/${item.productId}`} onClick={() => setIsOpen(false)} className="font-bodoni text-sm font-bold text-stone-900 hover:text-gold-600 transition-colors line-clamp-1 uppercase tracking-tight">
                            {item.product.name}
                          </Link>
                          <div className="flex items-center gap-2">
                             <p className="font-jost text-[10px] font-bold text-gold-600">{formatPrice(item.product.discountPrice || item.product.price, currency)}</p>
                             {item.size && (
                               <span className="font-jost text-[8px] font-black bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Size: {item.size}</span>
                             )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-stone-50 rounded-full px-3 py-1">
                             <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.size)} className="text-stone-400 hover:text-stone-900 transition-colors text-xs font-bold">−</button>
                             <span className="text-[9px] font-bold min-w-[1rem] text-center text-stone-900">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)} className="text-stone-400 hover:text-stone-900 transition-colors text-xs font-bold">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.productId, item.size)} className="text-[9px] font-bold text-stone-300 hover:text-red-500 transition-all uppercase tracking-widest">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 bg-stone-50 border-t border-stone-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-jost text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">Estimated Total</span>
                    <span className="font-bodoni text-xl font-bold text-stone-900">{formatPrice(total, currency)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-4 bg-stone-900 text-white font-jost font-bold text-[10px] uppercase tracking-[0.3em] text-center shadow-xl hover:bg-gold-600 transition-all rounded-xl"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
