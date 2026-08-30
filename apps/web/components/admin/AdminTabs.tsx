'use client'

import React, { useState } from 'react'
import {
  BarChart3,
  ShoppingCart,
  Zap,
  TrendingUp,
  Ticket,
  FileText,
  Settings,
  Image as ImageIcon,
  Package,
  Wallet,
  Truck,
  SlidersHorizontal,
  Menu,
  X
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { AdminTabId } from './types'

interface AdminTabsProps {
  activeTab: AdminTabId
  setActiveTab: (tab: AdminTabId) => void
  storeName?: string
  t: (key: string, fallback?: string) => string
}

export default function AdminTabs({ activeTab, setActiveTab, storeName, t }: AdminTabsProps) {
  const { isRTL } = useLanguage()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const tabs = [
    { id: 'overview' as const, label: t('admin.overview', isRTL ? 'نظرة عامة' : 'Overview'), icon: BarChart3 },
    { id: 'orders' as const, label: t('admin.sales', isRTL ? 'المبيعات' : 'Sales & Orders'), icon: Zap },
    { id: 'products' as const, label: t('admin.products', isRTL ? 'المنتجات' : 'Products'), icon: ShoppingCart },
    { id: 'inventory' as const, label: t('admin.inventory', isRTL ? 'المخزون' : 'Inventory'), icon: Package },
    { id: 'expenses' as const, label: t('admin.expenses', isRTL ? 'المصروفات والرواتب' : 'Staff & Expenses'), icon: Wallet },
    { id: 'delivery' as const, label: t('admin.deliveryZones', isRTL ? 'مناطق التوصيل' : 'Delivery & Zones'), icon: Truck },
    { id: 'filters' as const, label: t('admin.filters', isRTL ? 'التصنيفات والفلاتر' : 'Filters & Categories'), icon: SlidersHorizontal },
    { id: 'revenue' as const, label: t('admin.revenue', isRTL ? 'الأرباح وراس المال' : 'Revenue & Capital'), icon: TrendingUp },
    { id: 'coupons' as const, label: t('admin.coupons', isRTL ? 'الكوبونات' : 'Coupons'), icon: Ticket },
    { id: 'banners' as const, label: t('admin.banners', isRTL ? 'البانرات' : 'Banners'), icon: ImageIcon },
    { id: 'content' as const, label: t('admin.content', isRTL ? 'المحتوى' : 'Content'), icon: FileText },
    { id: 'settings' as const, label: t('admin.settings', isRTL ? 'الإعدادات' : 'Settings'), icon: Settings }
  ]

  return (
    <div className="relative mb-6 sm:mb-8 md:mb-10 select-none">
      {/* Title & Quick Jump Menu */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-stone-900">
            {t('admin.dashboard', isRTL ? 'لوحة تحكم المتجر' : 'Store Dashboard')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            {isRTL ? 'المتجر الحالي:' : 'Store:'}{' '}
            <span className="text-primary font-bold">{storeName || 'Digital Boutique'}</span>
          </p>
        </div>

        {/* Quick Jump Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-secondary hover:bg-secondary/80 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-border shadow-xs active:scale-95"
            title="Jump directly to any admin section"
          >
            <Menu className="w-3.5 h-3.5 text-primary" />
            <span>{isRTL ? 'جميع الأقسام (12)' : 'All Sections (12)'}</span>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 sm:right-auto sm:left-0 rtl:right-auto rtl:left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl p-3 shadow-2xl border border-stone-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2 px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
                    {isRTL ? 'الانتقال السريع للأقسام' : 'Jump to Section'}
                  </span>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-80 overflow-y-auto pr-1">
                  {tabs.map(t => {
                    const Icon = t.icon
                    const isActive = activeTab === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTab(t.id)
                          setDropdownOpen(false)
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all text-right rtl:text-right ${
                          isActive
                            ? 'bg-primary text-white shadow-xs'
                            : 'hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-primary'}`} />
                        <span className="truncate">{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fully Visible Wrap Layout - ZERO SCROLLBAR, ZERO OVERFLOW, 100% ACCESSIBLE */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-3 border-b border-border/60">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                isActive
                  ? 'bg-primary text-white shadow-md font-black ring-2 ring-primary/30'
                  : 'bg-secondary/60 hover:bg-secondary text-stone-700 hover:text-stone-900 border border-border/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-primary'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
