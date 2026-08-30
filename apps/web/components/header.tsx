'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LanguageSwitcher } from './language-switcher'
import CartDropdown from './cart-dropdown'
import SearchModal from './search-modal'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { useStore } from '@/lib/store-context'
import { useWishlist } from '@/lib/wishlist-context'
import { 
  LogOut, 
  User, 
  Shield, 
  ChevronDown, 
  LayoutDashboard, 
  Settings, 
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Compass,
  Archive,
  Heart,
  Search
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Header() {
  const { user, logout } = useAuth()
  const { t, isRTL } = useLanguage()
  const { currentStore } = useStore()
  const { wishlistCount, setShowWishlistDrawer } = useWishlist()

  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keyboard shortcut: Cmd+K or / opens Search Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchModalOpen(true)
      } else if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault()
        setSearchModalOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!mounted) {
    return (
      <header suppressHydrationWarning className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 h-16 md:h-20" />
    )
  }

  const logo = currentStore?.logoUrl || '/Digital.png'

  return (
    <>
      <header suppressHydrationWarning className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-stone-100 transition-all">
        <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-24 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0 group">
            <img src={logo} alt={currentStore?.name || 'Digital Store Logo'} className="h-8 md:h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/women" className="font-jost text-[10px] font-bold text-stone-600 hover:text-stone-900 transition-colors uppercase tracking-[0.3em]">
              {t('Women')}
            </Link>
            <Link href="/men" className="font-jost text-[10px] font-bold text-stone-600 hover:text-stone-900 transition-colors uppercase tracking-[0.3em]">
              {t('Men')}
            </Link>
            <Link href="/collections/past" className="font-jost text-[10px] font-bold text-amber-700 hover:text-stone-900 transition-colors uppercase tracking-[0.3em] flex items-center gap-1">
              <Archive className="w-3 h-3 text-amber-600" />
              <span>{t('The Archive')}</span>
            </Link>
            <Link href="/orders" className="font-jost text-[10px] font-bold text-stone-600 hover:text-stone-900 transition-colors uppercase tracking-[0.3em]">
              {t('common.tracking')}
            </Link>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
            {/* Search Trigger Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-full hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors flex items-center gap-1.5"
              aria-label={t('Search')}
              title={`${t('Search')} (Cmd+K)`}
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="hidden lg:inline text-[10px] font-jost font-bold uppercase tracking-wider text-stone-400">
                {t('Search')}
              </span>
            </button>

            {/* Love / Wishlist Button */}
            <button
              onClick={() => setShowWishlistDrawer(true)}
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-stone-100 text-stone-700 hover:text-rose-600 transition-colors"
              aria-label={t('Private Wishlist')}
              title={t('Private Wishlist')}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : 'text-stone-700'}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-600 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Dropdown */}
            <CartDropdown />

            {/* Desktop Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <div className="h-6 w-px bg-stone-200 mx-0.5 sm:mx-1 hidden sm:block" />

            {/* User Profile Avatar & Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 sm:gap-3 p-1 rounded-full transition-all border ${
                    showUserMenu 
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xl' 
                      : 'bg-stone-50 border-stone-200 hover:border-gold-400 text-stone-900'
                  }`}
                  aria-label="User Profile"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-stone-900 text-white overflow-hidden flex items-center justify-center shrink-0 font-bodoni text-xs font-bold shadow-sm">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.name} />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col items-start hidden md:flex pr-2 text-left">
                    <span className={`font-bodoni text-xs font-bold uppercase tracking-tight transition-colors ${showUserMenu ? 'text-white' : 'text-stone-900'}`}>{user.name}</span>
                    <span className="font-jost text-[8px] font-bold text-gold-600 uppercase tracking-[0.2em]">{user.role}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-all duration-500 ${showUserMenu ? 'rotate-180 text-gold-400' : 'text-stone-400'} mr-1 md:mr-2`} />
                </button>

                {/* User Dropdown: Fixed on mobile to prevent clipping off-screen, absolute on desktop */}
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowUserMenu(false)}
                        className="fixed inset-0 z-40 bg-stone-950/20 backdrop-blur-sm"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className={`fixed sm:absolute left-4 right-4 sm:left-auto ${
                          isRTL ? 'sm:left-0 sm:right-auto' : 'sm:right-0 sm:left-auto'
                        } top-[4.5rem] sm:top-14 w-auto sm:w-80 bg-white border border-stone-200 shadow-[0_30px_90px_rgba(0,0,0,0.18)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 z-50 overflow-hidden`}
                      >
                        <div className="relative space-y-2 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-stone-100">
                          <p className="font-jost text-[9px] font-bold text-stone-400 uppercase tracking-[0.4em]">{t('Authorized Session')}</p>
                          <p className="font-bodoni text-lg font-bold text-stone-900 uppercase">{user.name}</p>
                        </div>

                        <div className="relative space-y-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-xl transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4 text-stone-400" />
                            <span className="font-jost text-[10px] font-bold uppercase tracking-[0.3em] text-stone-700">{t('common.dashboard')}</span>
                          </Link>

                          <Link
                            href="/orders"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-xl transition-all"
                          >
                            <ShoppingBag className="w-4 h-4 text-stone-400" />
                            <span className="font-jost text-[10px] font-bold uppercase tracking-[0.3em] text-stone-700">{t('common.orders')}</span>
                          </Link>

                          {['admin', 'super_admin', 'store_admin'].includes(user.role) && (
                            <Link
                              href="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-4 p-3 bg-stone-900 text-white rounded-xl transition-all shadow-md"
                            >
                              <Shield className="w-4 h-4 text-gold-400" />
                              <span className="font-jost text-[10px] font-bold uppercase tracking-[0.3em]">{t('common.admin')}</span>
                            </Link>
                          )}

                          <div className="h-px bg-stone-100 my-4" />

                          <button
                            onClick={() => { logout(); setShowUserMenu(false); }}
                            className="flex items-center gap-4 p-3 hover:bg-rose-50 text-rose-600 rounded-xl transition-all w-full text-left font-jost text-[10px] font-bold uppercase tracking-[0.3em]"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t('common.logout')}</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3 md:gap-5">
                <Link
                  href="/login"
                  className="font-jost text-[10px] font-bold text-stone-600 hover:text-stone-900 transition-colors uppercase tracking-[0.3em]"
                >
                  {t('common.login')}
                </Link>
                <Link
                  href="/register"
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-stone-900 text-white font-jost text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-gold-600 transition-all rounded-full shadow-md"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 transition-colors md:hidden"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {/* Mobile Slide-Over Navigation Drawer - Light Atelier Luxury Aesthetic */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm md:hidden"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: isRTL ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={`fixed top-0 bottom-0 ${isRTL ? 'left-0 border-r' : 'right-0 border-l'} w-[85vw] max-w-sm z-50 bg-white text-stone-900 border-stone-200 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl md:hidden`}
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-600" />
                    <span className="font-jost text-[10px] font-bold uppercase tracking-[0.4em] text-gold-600">
                      {t('Maison Portal')}
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search Input Trigger */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setSearchModalOpen(true)
                  }}
                  className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center justify-between text-stone-500 text-xs font-jost transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-gold-600" />
                    <span>{t('Search collection...')}</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase">{t('Search')}</span>
                </button>

                {/* Primary Portals Navigation */}
                <div className="space-y-3">
                  <p className="font-jost text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold">
                    {t('Collections & Portals')}
                  </p>

                  <div className="space-y-2">
                    <Link
                      href="/women"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="font-bodoni text-base uppercase font-bold tracking-tight text-stone-900">{t("Women's Atelier")}</span>
                      </div>
                      {isRTL ? <ArrowLeft className="w-4 h-4 text-stone-400" /> : <ArrowRight className="w-4 h-4 text-stone-400" />}
                    </Link>

                    <Link
                      href="/men"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-stone-700" />
                        <span className="font-bodoni text-base uppercase font-bold tracking-tight text-stone-900">{t("Men's Sartorial")}</span>
                      </div>
                      {isRTL ? <ArrowLeft className="w-4 h-4 text-stone-400" /> : <ArrowRight className="w-4 h-4 text-stone-400" />}
                    </Link>

                    <Link
                      href="/collections/past"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Archive className="w-4 h-4 text-amber-700" />
                        <span className="font-bodoni text-base uppercase font-bold tracking-tight text-amber-900">{t('The Archive')}</span>
                      </div>
                      {isRTL ? <ArrowLeft className="w-4 h-4 text-amber-700" /> : <ArrowRight className="w-4 h-4 text-amber-700" />}
                    </Link>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setShowWishlistDrawer(true)
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                        <span className="font-bodoni text-base uppercase font-bold tracking-tight text-stone-900">{t('Private Wishlist')}</span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    </button>

                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Compass className="w-4 h-4 text-stone-600" />
                        <span className="font-bodoni text-base uppercase font-bold tracking-tight text-stone-900">{t('common.tracking')}</span>
                      </div>
                      {isRTL ? <ArrowLeft className="w-4 h-4 text-stone-400" /> : <ArrowRight className="w-4 h-4 text-stone-400" />}
                    </Link>
                  </div>
                </div>

                {/* Mobile Language Switcher */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="font-jost text-[9px] uppercase tracking-[0.3em] text-stone-500 font-bold">
                    {t('Language / اللغة')}
                  </span>
                  <div className="pt-1">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>

              {/* Mobile Drawer Auth Footer */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center font-bodoni font-bold text-sm shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bodoni font-bold text-sm text-stone-900 truncate uppercase">{user.name}</p>
                        <p className="font-jost text-[9px] text-gold-600 uppercase tracking-widest font-bold">{user.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-center font-jost text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        {t('common.dashboard')}
                      </Link>
                      {['admin', 'super_admin', 'store_admin'].includes(user.role) && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-center font-jost text-[10px] font-black uppercase tracking-wider shadow-md transition-colors"
                        >
                          {t('common.admin')}
                        </Link>
                      )}
                    </div>

                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-center font-jost text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('common.logout')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3 rounded-xl border border-stone-300 text-stone-800 text-center font-jost text-[10px] font-bold uppercase tracking-wider hover:bg-stone-50 transition-colors"
                    >
                      {t('common.login')}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3 rounded-xl bg-stone-900 text-white text-center font-jost text-[10px] font-black uppercase tracking-wider hover:bg-stone-800 shadow-md transition-colors"
                    >
                      {t('common.register')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
