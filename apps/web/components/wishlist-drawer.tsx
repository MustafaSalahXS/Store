'use client'

import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { useStore } from '@/lib/store-context'
import { formatPrice } from '@/lib/currency'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, UserCheck, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function WishlistDrawer() {
  const { wishlist, removeFromWishlist, clearWishlist, isSyncedWithAccount, showWishlistDrawer, setShowWishlistDrawer } = useWishlist()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { t, isRTL } = useLanguage()
  const { currentStore } = useStore()
  const currency = currentStore?.currency || 'USD'

  return (
    <AnimatePresence>
      {showWishlistDrawer && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWishlistDrawer(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className={`fixed top-0 bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-full max-w-md z-50 bg-white text-stone-900 p-5 sm:p-6 flex flex-col justify-between shadow-2xl overflow-y-auto`}
          >
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                  <h3 className="font-bodoni text-xl font-bold uppercase tracking-tight">
                    {t('wishlist.title')}
                  </h3>
                  <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
                    {wishlist.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowWishlistDrawer(false)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Account Sync Status Banner */}
              {user ? (
                <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50/80 border border-emerald-200/70 rounded-xl text-emerald-800 text-[10px] font-jost">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('Account Synced', 'متزامنة مع حسابك')}</span>
                  </div>
                  <span className="text-emerald-700/90 text-[10px] font-mono font-semibold truncate max-w-[170px]">{user.email}</span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-amber-900 text-xs font-jost space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-amber-800">
                      {t('Guest Wishlist', 'قائمة مؤقتة')}
                    </span>
                    <Link
                      href="/login"
                      onClick={() => setShowWishlistDrawer(false)}
                      className="font-bold text-[10px] uppercase tracking-wider text-amber-900 underline hover:text-amber-950"
                    >
                      {t('Sign in to sync', 'سجل دخولك للحفظ')}
                    </Link>
                  </div>
                  <p className="text-[10px] text-amber-700/90 leading-relaxed">
                    {t('Items will automatically link and sync to your account when you sign in.', 'القطع محفوظة مؤقتاً وسيتم ربطها ومزامنتها تلقائياً مع حسابك عند تسجيل الدخول.')}
                  </p>
                </div>
              )}

              {/* Items List */}
              {wishlist.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-300">
                    <Heart className="w-8 h-8" />
                  </div>
                  <p className="font-jost text-xs font-bold uppercase tracking-widest text-stone-400">
                    {t('wishlist.empty')}
                  </p>
                  <button
                    onClick={() => setShowWishlistDrawer(false)}
                    className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-jost font-bold uppercase tracking-wider hover:bg-stone-800"
                  >
                    {t('Explore Atelier')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 divide-y divide-stone-100 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                  {wishlist.map((item) => (
                    <div key={item.id} className="pt-3 flex gap-3 items-center">
                      <Link
                        href={`/product/${item.id}`}
                        onClick={() => setShowWishlistDrawer(false)}
                        className="w-16 h-20 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200"
                      >
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.id}`}
                          onClick={() => setShowWishlistDrawer(false)}
                          className="font-serif font-bold text-xs hover:text-gold-600 truncate block"
                        >
                          {item.name}
                        </Link>
                        <p className="font-mono font-bold text-xs text-stone-900 mt-0.5">
                          {formatPrice(Number(item.discountPrice || item.price), currency)}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => {
                              addToCart(item, 1)
                              removeFromWishlist(item.id)
                            }}
                            className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-jost font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>{t('wishlist.moveToBag')}</span>
                          </button>

                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
              <div className="pt-4 border-t border-stone-100 space-y-2">
                <button
                  onClick={() => {
                    wishlist.forEach((item) => addToCart(item, 1))
                    setShowWishlistDrawer(false)
                  }}
                  className="w-full py-3.5 bg-gold-600 hover:bg-gold-700 text-white rounded-xl font-jost font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('Move All to Shopping Bag', 'نقل الكل إلى حقيبة التسوق')}</span>
                </button>

                <button
                  onClick={clearWishlist}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 rounded-xl font-jost font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('Clear Wishlist', 'إفراغ القائمة')}</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
