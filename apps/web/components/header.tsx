'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LanguageSwitcher } from './language-switcher'
import CartDropdown from './cart-dropdown'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { useStore } from '@/lib/store-context'
import { LogOut, User, Shield, ChevronDown, LayoutDashboard, Settings, ShoppingBag } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Header() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const { currentStore } = useStore()
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header suppressHydrationWarning className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 h-20" />
    )
  }

  const logo = currentStore?.logoUrl

  return (
    <header suppressHydrationWarning className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100">
      <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0 group">
          {logo ? (
            <img src={logo} alt={currentStore?.name || 'Store Logo'} className="h-8 md:h-12 w-auto object-contain" />
          ) : (
            <div className="flex flex-col">
              <span className="font-bodoni text-3xl md:text-5xl font-bold tracking-tighter leading-none text-stone-900">
                DIGITALSTORE<span className="text-gold-500 group-hover:animate-pulse">.</span>
              </span>
              <span className="font-jost text-[8px] md:text-[10px] font-bold tracking-[0.5em] uppercase text-gold-600 -mt-0.5">
                Luxury Classic
              </span>
            </div>
          )}
        </Link>

        <div className="flex items-center gap-4 md:gap-12">
          <div className="hidden lg:flex items-center gap-12">
            <Link href="/" className="font-jost text-[10px] font-bold text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-[0.4em]">{t('common.shop')}</Link>
            <Link href="/orders" className="font-jost text-[10px] font-bold text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-[0.4em]">{t('common.tracking')}</Link>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <CartDropdown />
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <div className="h-8 w-px bg-stone-100 mx-2 hidden sm:block" />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-3 p-1 rounded-full transition-all border ${showUserMenu ? 'bg-stone-900 border-stone-900 shadow-2xl' : 'bg-white border-stone-100 hover:border-gold-300'}`}
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-50 overflow-hidden flex items-center justify-center shrink-0 border border-stone-100">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.name} />
                    ) : (
                      <div className="w-full h-full bg-stone-950 flex items-center justify-center text-white font-bodoni text-[10px] md:text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start hidden md:flex pr-2 text-left">
                    <span className={`font-bodoni text-xs font-bold uppercase tracking-tight transition-colors ${showUserMenu ? 'text-white' : 'text-stone-900'}`}>{user.name}</span>
                    <span className="font-jost text-[8px] font-bold text-gold-600 uppercase tracking-[0.2em]">{user.role}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-all duration-500 ${showUserMenu ? 'rotate-180 text-gold-500' : 'text-stone-300'} mr-1 md:mr-2`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowUserMenu(false)}
                        className="fixed inset-0 z-40 bg-stone-900/5 backdrop-blur-[2px]"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-6 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-stone-100 shadow-[0_40px_120px_rgba(0,0,0,0.12)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 z-50 overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-full -mr-12 -mt-12" />
                        
                        <div className="relative space-y-2 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-stone-50">
                          <p className="font-jost text-[9px] font-bold text-stone-400 uppercase tracking-[0.4em]">Authorized Session</p>
                          <p className="font-bodoni text-lg font-bold text-stone-900 uppercase">{user.name}</p>
                        </div>

                        <div className="relative space-y-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-5 p-3 sm:p-4 hover:bg-stone-50 rounded-xl sm:rounded-2xl transition-all group border border-transparent hover:border-stone-100"
                          >
                            <LayoutDashboard className="w-4 h-4 text-stone-300 group-hover:text-gold-600 transition-colors" />
                            <span className="font-jost text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 group-hover:text-stone-900 transition-colors">{t('common.dashboard')}</span>
                          </Link>

                          <Link
                            href="/orders"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-5 p-3 sm:p-4 hover:bg-stone-50 rounded-xl sm:rounded-2xl transition-all group border border-transparent hover:border-stone-100"
                          >
                            <ShoppingBag className="w-4 h-4 text-stone-300 group-hover:text-gold-600 transition-colors" />
                            <span className="font-jost text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 group-hover:text-stone-900 transition-colors">{t('common.orders')}</span>
                          </Link>

                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-5 p-3 sm:p-4 bg-stone-50 hover:bg-stone-900 rounded-xl sm:rounded-2xl transition-all group shadow-sm"
                            >
                              <Shield className="w-4 h-4 text-gold-500" />
                              <span className="font-jost text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 group-hover:text-stone-50">{t('common.admin')}</span>
                            </Link>
                          )}

                          <div className="h-px bg-stone-50 my-4 sm:my-6" />

                          <button
                            onClick={() => { logout(); setShowUserMenu(false); }}
                            className="flex items-center gap-5 p-3 sm:p-4 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-xl sm:rounded-2xl transition-all group w-full text-left"
                          >
                            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span className="font-jost text-[10px] font-bold uppercase tracking-[0.4em]">{t('common.logout')}</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-4 sm:gap-8">
                <Link
                  href="/login"
                  className="font-jost text-[9px] sm:text-[10px] font-bold text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-[0.3em]"
                >
                  {t('common.login')}
                </Link>
                <Link
                  href="/register"
                  className="px-6 sm:px-10 py-3 sm:py-4 bg-stone-900 text-white font-jost text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold-600 transition-all shadow-2xl"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
