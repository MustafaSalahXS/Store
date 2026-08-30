'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Compass,
  Heart,
  ShoppingBag,
  Package,
  Zap,
  Boxes,
  Wallet,
  Truck,
  Settings,
  BarChart3,
  Shirt,
  Menu,
  X,
  SlidersHorizontal,
  TrendingUp,
  Ticket,
  Image as ImageIcon,
  FileText
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useLanguage } from '@/lib/language-context'
import { AdminTabId } from './admin/types'

interface MobileBottomNavProps {
  activeAdminTab?: AdminTabId
  onSelectAdminTab?: (tab: AdminTabId) => void
}

export default function MobileBottomNav({
  activeAdminTab,
  onSelectAdminTab
}: MobileBottomNavProps) {
  const pathname = usePathname()
  const { t, isRTL } = useLanguage()
  const { itemCount } = useCart()
  const { wishlistCount } = useWishlist()
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin && !onSelectAdminTab) {
    return null
  }

  // If on admin dashboard and callback provided:
  if (isAdmin && onSelectAdminTab) {
    // 4 primary daily tabs always on screen + 1 dynamic / more tab
    const primaryTabIds: AdminTabId[] = ['overview', 'orders', 'delivery', 'inventory']
    const isCurrentInPrimary = activeAdminTab && primaryTabIds.includes(activeAdminTab)

    const allAdminTabs: { id: AdminTabId; label: string; icon: any }[] = [
      { id: 'overview', label: isRTL ? 'الرئيسية' : 'Overview', icon: BarChart3 },
      { id: 'orders', label: isRTL ? 'المبيعات' : 'Sales', icon: Zap },
      { id: 'delivery', label: isRTL ? 'التوصيل' : 'Delivery', icon: Truck },
      { id: 'inventory', label: isRTL ? 'المخزون' : 'Stock', icon: Boxes },
      { id: 'products', label: isRTL ? 'المنتجات' : 'Products', icon: Shirt },
      { id: 'expenses', label: isRTL ? 'المصاريف' : 'Expenses', icon: Wallet },
      { id: 'revenue', label: isRTL ? 'الأرباح' : 'Revenue', icon: TrendingUp },
      { id: 'filters', label: isRTL ? 'الفلاتر' : 'Filters', icon: SlidersHorizontal },
      { id: 'coupons', label: isRTL ? 'الكوبونات' : 'Coupons', icon: Ticket },
      { id: 'banners', label: isRTL ? 'البانرات' : 'Banners', icon: ImageIcon },
      { id: 'content', label: isRTL ? 'المحتوى' : 'Content', icon: FileText },
      { id: 'settings', label: isRTL ? 'الإعدادات' : 'Settings', icon: Settings }
    ]

    const activeSecondaryTab = !isCurrentInPrimary
      ? allAdminTabs.find(t => t.id === activeAdminTab)
      : null

    const handleSelectTab = (tabId: AdminTabId) => {
      onSelectAdminTab(tabId)
      setMoreMenuOpen(false)
    }

    return (
      <>
        {/* Admin Mobile Bottom Sheet Menu for All 12 Tabs */}
        {moreMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end">
            <div className="bg-white w-full rounded-t-3xl p-5 border-t border-stone-200 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Menu className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-stone-900">
                    {isRTL ? 'أقسام لوحة التحكم' : 'Admin Sections'}
                  </h3>
                </div>
                <button
                  onClick={() => setMoreMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {allAdminTabs.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeAdminTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 text-center ${
                        isActive
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-stone-50 border-stone-200/70 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-white' : 'text-stone-600'}`} />
                      <span className="text-[11px] font-bold tracking-tight leading-tight">
                        {tab.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Rock-solid 5-Column Grid Mobile Bottom Bar (Spans 100% full width, never clips) */}
        <nav
          aria-label="Admin Mobile Navigation"
          className="md:hidden fixed inset-x-0 bottom-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] safe-area-bottom pb-safe"
        >
          <div className="grid grid-cols-5 w-full items-center py-1 px-1">
            {/* 1. Overview */}
            <button
              onClick={() => handleSelectTab('overview')}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all w-full active:scale-95 ${
                activeAdminTab === 'overview'
                  ? 'text-primary font-black scale-105'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors relative ${
                  activeAdminTab === 'overview' ? 'bg-primary/10 text-primary' : 'text-stone-500'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                {activeAdminTab === 'overview' && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center block">
                {isRTL ? 'الرئيسية' : 'Overview'}
              </span>
            </button>

            {/* 2. Sales & Orders */}
            <button
              onClick={() => handleSelectTab('orders')}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all w-full active:scale-95 ${
                activeAdminTab === 'orders'
                  ? 'text-primary font-black scale-105'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors relative ${
                  activeAdminTab === 'orders' ? 'bg-primary/10 text-primary' : 'text-stone-500'
                }`}
              >
                <Zap className="w-4 h-4" />
                {activeAdminTab === 'orders' && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center block">
                {isRTL ? 'المبيعات' : 'Sales'}
              </span>
            </button>

            {/* 3. Delivery & Zones ⭐ */}
            <button
              onClick={() => handleSelectTab('delivery')}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all w-full active:scale-95 ${
                activeAdminTab === 'delivery'
                  ? 'text-primary font-black scale-105'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors relative ${
                  activeAdminTab === 'delivery' ? 'bg-primary/10 text-primary' : 'text-stone-500'
                }`}
              >
                <Truck className="w-4 h-4" />
                {activeAdminTab === 'delivery' && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center block">
                {isRTL ? 'التوصيل' : 'Delivery'}
              </span>
            </button>

            {/* 4. Stock / Inventory */}
            <button
              onClick={() => handleSelectTab('inventory')}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all w-full active:scale-95 ${
                activeAdminTab === 'inventory'
                  ? 'text-primary font-black scale-105'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors relative ${
                  activeAdminTab === 'inventory' ? 'bg-primary/10 text-primary' : 'text-stone-500'
                }`}
              >
                <Boxes className="w-4 h-4" />
                {activeAdminTab === 'inventory' && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center block">
                {isRTL ? 'المخزون' : 'Stock'}
              </span>
            </button>

            {/* 5. More / Dynamic Tab */}
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all w-full active:scale-95 ${
                !isCurrentInPrimary
                  ? 'text-primary font-black scale-105'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors relative ${
                  !isCurrentInPrimary ? 'bg-primary/10 text-primary' : 'text-stone-500'
                }`}
              >
                {activeSecondaryTab ? (
                  React.createElement(activeSecondaryTab.icon, { className: 'w-4 h-4' })
                ) : (
                  <Menu className="w-4 h-4" />
                )}
                {!isCurrentInPrimary && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center block">
                {activeSecondaryTab ? activeSecondaryTab.label : isRTL ? 'المزيد' : 'More'}
              </span>
            </button>
          </div>
        </nav>
      </>
    )
  }

  // Storefront Shopper Navigation Items
  const shopperItems = [
    { href: '/', label: t('nav.home', 'Home'), icon: Home },
    { href: '/products', label: t('nav.shop', 'Shop'), icon: Compass },
    {
      href: '/wishlist',
      label: t('nav.wishlist', 'Wishlist'),
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : null
    },
    { href: '/orders', label: t('nav.orders', 'Orders'), icon: Package },
    {
      href: '/checkout',
      label: t('nav.cart', 'Cart'),
      icon: ShoppingBag,
      badge: itemCount > 0 ? itemCount : null
    }
  ]

  return (
    <nav
      aria-label="Shopper Mobile Navigation"
      className="md:hidden fixed inset-x-0 bottom-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] safe-area-bottom pb-safe"
    >
      <div className="grid grid-cols-5 w-full items-center py-1 px-1">
        {shopperItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative w-full ${
                isActive ? 'text-primary font-black scale-105' : 'text-stone-400 hover:text-stone-600 font-medium'
              }`}
            >
              <div className="relative">
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center block">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
