'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, ShoppingCart, Zap, DollarSign } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'
import { AdminTabId, PlatformStats } from './types'

interface OverviewSectionProps {
  platformStats: PlatformStats
  productsCount: number
  orders: any[]
  currentStore: any
  setActiveTab: (tab: AdminTabId) => void
  t: (key: string, fallback?: string) => string
}

export default function OverviewSection({
  platformStats,
  productsCount,
  orders,
  currentStore,
  setActiveTab,
  t
}: OverviewSectionProps) {
  const { isRTL } = useLanguage()

  const totalSettledRevenue = orders
    .filter(o => o.orderStatus === 'approved')
    .reduce((acc, curr) => {
      const val = Number(curr.total)
      return acc + (!isNaN(val) ? val : 0)
    }, 0)

  const stats = [
    {
      label: isRTL ? 'إجمالي المستخدمين' : t('admin.totalUsers', 'Total Users'),
      value: platformStats.userCount,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      label: isRTL ? 'إجمالي المنتجات' : t('admin.totalProducts', 'Total Products'),
      value: productsCount,
      icon: ShoppingCart,
      color: 'text-purple-500'
    },
    {
      label: isRTL ? 'إجمالي الطلبات' : t('admin.totalOrders', 'Total Orders'),
      value: orders.length,
      icon: Zap,
      color: 'text-amber-500'
    },
    {
      label: isRTL ? 'إجمالي الإيرادات' : t('admin.totalRevenue', 'Total Revenue'),
      value: formatPrice(totalSettledRevenue, currentStore?.currency || 'USD'),
      icon: DollarSign,
      color: 'text-green-500'
    }
  ]

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return isRTL ? 'معتمد' : 'Approved'
      case 'delivered':
        return isRTL ? 'تم التوصيل' : 'Delivered'
      case 'cancelled':
        return isRTL ? 'ملغي' : 'Cancelled'
      case 'out_for_delivery':
        return isRTL ? 'مع المندوب' : 'Out for Delivery'
      default:
        return isRTL ? 'قيد المراجعة' : 'Pending'
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-12 pb-28 sm:pb-8 max-w-full overflow-hidden">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-card rounded-2xl sm:rounded-[1.5rem] md:rounded-[2rem] p-3.5 sm:p-6 md:p-8 border border-border shadow-xl relative overflow-hidden group flex flex-col justify-between min-h-[110px] sm:min-h-[140px] md:min-h-[180px]"
          >
            <div className="absolute top-0 right-0 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 bg-primary/5 rounded-bl-full -mr-6 -mt-6 sm:-mr-8 sm:-mt-8 md:-mr-10 md:-mt-10 transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between mb-2 sm:mb-4 md:mb-6 relative">
              <span className="text-[9px] sm:text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-wider truncate mr-1.5">
                {stat.label}
              </span>
              <div className={`p-1.5 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl bg-secondary ${stat.color} shadow-inner shrink-0`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
            </div>
            <div className="relative min-w-0">
              <p className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black whitespace-nowrap overflow-hidden text-ellipsis leading-tight font-mono">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Sales & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-card rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-border p-4 sm:p-6 md:p-10 shadow-xl">
          <h3 className="text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 md:mb-8 flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
            <span>{isRTL ? 'أحدث المبيعات والطلبات' : t('admin.recentSales', 'Recent Sales')}</span>
          </h3>
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {orders.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 p-3 sm:p-4 hover:bg-secondary/50 rounded-xl sm:rounded-2xl transition-colors border border-transparent hover:border-border/50"
              >
                <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center text-primary font-black text-[10px] sm:text-xs shrink-0 font-mono">
                    #{order.id.split('-')[0].substring(0, 4)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-xs sm:text-sm md:text-base truncate">{order.customerName}</div>
                    <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-mono">
                      {new Date(order.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                    </div>
                  </div>
                </div>
                <div className="text-right rtl:text-left shrink-0">
                  <div className="font-black text-primary text-xs sm:text-sm md:text-base font-mono">
                    {formatPrice(order.total, currentStore?.currency || 'USD')}
                  </div>
                  <div
                    className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${
                      order.orderStatus === 'approved' ? 'text-green-500' : 'text-amber-500'
                    }`}
                  >
                    {getOrderStatusLabel(order.orderStatus)}
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground font-bold text-sm">
                {isRTL ? 'لا توجد بيانات مبيعات متاحة حتى الآن.' : t('admin.noSalesData', 'No sales data available yet.')}
              </div>
            )}
          </div>
        </div>

        {/* Store Health Card */}
        <div className="bg-card rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-border p-4 sm:p-6 md:p-10 shadow-xl flex flex-col">
          <h3 className="text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 md:mb-8 flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent" />
            <span>{isRTL ? 'حالة وأداء المتجر' : t('admin.storeStatus', 'Store Status')}</span>
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 md:space-y-6 py-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-8 border-primary/20 border-t-primary flex items-center justify-center relative">
              <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono">100%</span>
              <div className="absolute -bottom-2 bg-green-500 text-white text-[8px] sm:text-[10px] font-black px-2 md:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest">
                {isRTL ? 'متصل بالإنترنت' : 'Online'}
              </div>
            </div>
            <div>
              <p className="font-black text-base sm:text-lg md:text-xl">
                {isRTL ? 'النظام يعمل بكفاءة مثالية' : t('admin.healthOptimal', 'Optimal Health')}
              </p>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-0.5" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL
                  ? 'بوابات الدفع، قواعد البيانات، والتخزين تعمل بسلاسة فائقة دون انقطاع.'
                  : t('admin.healthDesc', 'All services and checkout gateways running smoothly.')}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="w-full py-2.5 sm:py-3.5 md:py-4 bg-secondary font-black rounded-xl md:rounded-2xl hover:bg-secondary/80 transition-colors text-xs sm:text-sm active:scale-95"
            >
              {isRTL ? 'إدارة إعدادات المتجر' : t('admin.manageSettings', 'Manage Settings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
