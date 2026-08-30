'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  Receipt,
  CreditCard,
  MapPin,
  Sparkles,
  Calendar,
  DollarSign,
  Search,
  ExternalLink,
  Download
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useStore } from '@/lib/store-context'
import { useLanguage } from '@/lib/language-context'
import { generateOfficialReceipt } from '@/lib/generate-receipt'

const STATUS_CONFIG: any = {
  pending: { color: 'text-stone-600', bg: 'bg-stone-100', icon: Clock, key: 'dashboard.processingStatus' },
  processing: { color: 'text-blue-700', bg: 'bg-blue-50', icon: Package, key: 'dashboard.inStudio' },
  shipped: { color: 'text-amber-700', bg: 'bg-amber-50', icon: Truck, key: 'dashboard.inTransit' },
  delivered: { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle, key: 'dashboard.deliveredStatus' },
  approved: { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle, key: 'dashboard.approvedStatus' },
  declined: { color: 'text-rose-700', bg: 'bg-rose-50', icon: AlertCircle, key: 'dashboard.declinedStatus' },
  cancelled: { color: 'text-rose-700', bg: 'bg-rose-50', icon: AlertCircle, key: 'dashboard.cancelledStatus' },
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { currentStore } = useStore()
  const { t, isRTL } = useLanguage()
  const currency = currentStore?.currency || 'USD'

  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  const [trackInput, setTrackInput] = useState('')

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackInput.trim()) return
    router.push(`/orders/${trackInput.trim().replace('#', '')}`)
  }

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const result = await api.orders.list(user.id)
        const list = Array.isArray(result) ? result : []
        setOrders(list)
        if (list.length > 0) setSelectedOrder(list[0])
      } catch (error) {
        console.error('Failed to load orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [user])

  const toggleExpand = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }))
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Header />
        <div className="section-container py-24 text-center space-y-6">
          <div className="w-12 h-12 border-2 border-stone-200 border-t-gold-500 rounded-full animate-spin mx-auto" />
          <p className="text-stone-400 font-jost font-bold uppercase tracking-[0.3em] text-[10px]">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Header />
        <div className="section-container py-16 sm:py-24 text-center space-y-10 max-w-xl mx-auto px-4">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto border border-stone-200">
             <Receipt className="w-8 h-8 text-gold-600" />
          </div>
          <div className="space-y-3">
            <h1 className="font-bodoni text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight uppercase">
              {t('Track Your Order', 'تتبع شحنتك')}
            </h1>
            <p className="font-jost text-stone-500 text-xs sm:text-sm leading-relaxed">
              {t('Enter your Order Reference or UUID below to view real-time live dispatch milestones, courier checkpoints, and download your official invoice.', 'أدخل رقم مرجع الطلب أو المعرف لمتابعة مراحل الشحنة الحية وتفاصيل المندوب وتحميل الإيصال الرسمي.')}
            </p>
          </div>

          {/* Quick Track Input Form */}
          <form onSubmit={handleQuickTrack} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto w-full">
            <input
              type="text"
              required
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
              placeholder={t('e.g. 7DCEFF34 or Full Order ID', 'مثال: 7DCEFF34 أو رقم الطلب')}
              className="flex-1 px-5 py-3.5 bg-white border border-stone-200 rounded-full font-jost text-xs outline-none focus:border-stone-900 transition-all uppercase shadow-sm text-stone-900"
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full font-jost font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              {t('Track Order', 'تتبع الطلب')}
            </button>
          </form>

          <div className="pt-6 border-t border-stone-200/80 space-y-3">
            <p className="font-jost text-xs text-stone-400 uppercase tracking-wider">
              {t('Have a private account?', 'هل لديك حساب في المشغل؟')}
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-white border border-stone-200 text-stone-900 font-jost font-bold shadow-sm hover:bg-stone-50 transition-all uppercase tracking-wider text-xs rounded-full"
            >
              {t('Sign in to view full history', 'تسجيل الدخول لسجل الطلبات')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-900 font-sans">
      <Header />

      <div className="section-container px-4 sm:px-6 py-10 sm:py-20 space-y-8 sm:space-y-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gold-500" />
              <span className="font-jost text-[10px] font-bold uppercase tracking-[0.3em] text-gold-600">
                {t('Personal Vault')}
              </span>
            </div>
            <h1 className="font-bodoni text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight uppercase">
              {t('payments.title')}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-jost max-w-xl">
              {t('Detailed ledger of all acquisitions, transaction IDs, payment confirmations, and fulfillment tracking.', 'سجل مفصل لجميع المشتريات وأرقام المعاملات وتأكيدات السداد وتتبع الشحنات.')}
            </p>
          </div>

          <form onSubmit={handleQuickTrack} className="flex gap-2 max-w-md w-full md:w-auto">
            <input
              type="text"
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
              placeholder={t('Enter Order Reference...', 'أدخل رقم المرجع...')}
              className="px-4 py-2.5 bg-white border border-stone-200 rounded-full font-jost text-xs outline-none focus:border-stone-900 transition-all uppercase shadow-sm w-full md:w-60 text-stone-900"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full font-jost font-bold text-xs uppercase tracking-wider transition-all shadow-sm shrink-0"
            >
              {t('Track', 'تتبع')}
            </button>
          </form>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 sm:py-32 bg-white rounded-3xl sm:rounded-[3rem] border border-stone-100 shadow-sm p-6">
            <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-stone-200" />
            <h2 className="font-bodoni text-2xl font-bold text-stone-900 mb-2 uppercase tracking-wider">
              {t('dashboard.archiveEmpty')}
            </h2>
            <p className="font-jost text-stone-400 mb-8 uppercase tracking-widest text-xs">
              {t('dashboard.noTransactions')}
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-stone-900 text-white font-jost font-bold shadow-xl hover:bg-gold-600 transition-all uppercase tracking-[0.25em] text-xs rounded-full"
            >
              {t('Explore Latest Collections')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* Orders Feed */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {orders.map((order, idx) => {
                const statusConfig = STATUS_CONFIG[order.orderStatus || 'pending'] || STATUS_CONFIG.pending
                const StatusIcon = statusConfig.icon
                const isSelected = selectedOrder?.id === order.id
                const isExpanded = Boolean(expandedOrders[order.id])
                const isPaid = order.paymentStatus === 'confirmed' || order.paymentStatus === 'paid'

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer bg-white shadow-sm ${
                      isSelected
                        ? 'border-stone-900 ring-2 ring-stone-900/10 shadow-lg'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-sm text-stone-900">
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="text-xs font-jost font-bold text-stone-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="font-bodoni text-base font-bold text-stone-900 mt-1">
                          {order.customerName || user.name}
                        </p>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                        {/* Payment Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isPaid ? t('PAID') : t('PENDING PAYMENT')}
                        </span>

                        {/* Order Fulfillment Status */}
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} border border-current/20`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span className="font-jost text-[9px] font-bold uppercase tracking-wider">
                            {t(statusConfig.key)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Summary Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3 sm:py-4">
                      <div className="flex items-center justify-between sm:block">
                        <div>
                          <span className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                            {t('Total Valuation')}
                          </span>
                          <span className="font-mono font-black text-lg sm:text-xl text-stone-900">
                            {formatPrice(Number(order.total), currency)}
                          </span>
                        </div>

                        <span className="sm:hidden px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 font-mono text-[10px] font-bold uppercase">
                          {t(order.paymentMethod?.replace('_', ' ') || 'InstaPay')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <span className="hidden sm:inline-block px-3 py-1 rounded-xl bg-stone-100 text-stone-700 font-mono text-[10px] font-bold uppercase shrink-0">
                          {t(order.paymentMethod?.replace('_', ' ') || 'InstaPay')}
                        </span>

                        <Link
                          href={`/orders/${order.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-jost font-bold uppercase tracking-wider transition-all shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                          <span>{t('Live Tracking', 'تتبع مباشر')}</span>
                        </Link>

                        {/* See More Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(order.id, e)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-800 text-[10px] font-jost font-bold uppercase tracking-wider transition-colors"
                        >
                          <span>{isExpanded ? t('payments.seeLess') : t('payments.seeMore')}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Itemized Invoice & Purchase Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 border-t border-stone-100 space-y-4 overflow-hidden"
                        >
                          {/* Itemized List */}
                          <div className="space-y-3">
                            <span className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-400">
                              {t('payments.itemsPurchased')} ({order.items?.length || 0})
                            </span>

                            <div className="space-y-2">
                              {order.items?.map((it: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-12 bg-white rounded-lg overflow-hidden border border-stone-200 shrink-0">
                                      {it.productImage ? (
                                        <img src={it.productImage} alt={it.productName} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                                          <Package className="w-4 h-4" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-serif font-bold text-xs text-stone-900 truncate">
                                        {it.productName}
                                      </p>
                                      <p className="text-[10px] font-jost text-stone-500">
                                        {it.size ? `${t('Size')}: ${it.size}` : ''} {it.color ? `• ${t('Color')}: ${t(it.color)}` : ''} • {t('Quantity')}: {it.quantity}
                                      </p>
                                    </div>
                                  </div>

                                  <span className="font-mono font-bold text-xs text-stone-900 shrink-0">
                                    {formatPrice(Number(it.unitPrice) * Number(it.quantity), currency)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Transaction Reference & Destination */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                              <span className="font-jost text-[9px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                                {t('payments.transactionId')}
                              </span>
                              <span className="font-mono text-xs text-stone-800 break-all font-semibold">
                                {order.id}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                              <span className="font-jost text-[9px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                                {t('Destination & Contact')}
                              </span>
                              <span className="text-xs text-stone-800 block truncate">
                                {order.customerAddress || t('Atelier Delivery', 'توصيل من المشغل')} • {order.customerPhone || t('Contact verified', 'الهاتف موثق')}
                              </span>
                            </div>
                          </div>

                          {/* Itemized Financial Valuation */}
                          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-2 text-xs font-jost">
                            <div className="flex justify-between text-stone-500">
                              <span>{t('dashboard.subtotal', 'Subtotal')}</span>
                              <span className="font-mono font-semibold">{formatPrice(Number(order.subtotal || order.total), currency)}</span>
                            </div>
                            {Number(order.tax || 0) > 0 && (
                              <div className="flex justify-between text-stone-500">
                                <span>{t('dashboard.taxation', 'Taxation')}</span>
                                <span className="font-mono font-semibold">{formatPrice(Number(order.tax), currency)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-stone-500">
                              <span>{t('Logistics', 'Express Logistics')}</span>
                              <span className="font-mono font-semibold text-emerald-700">{order.shipping ? formatPrice(Number(order.shipping), currency) : t('free', 'COMPLIMENTARY')}</span>
                            </div>
                            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-bold text-sm text-stone-900">
                              <span className="uppercase">{t('dashboard.finalTotal', 'Total Valuation')}</span>
                              <span className="font-mono text-base">{formatPrice(Number(order.total), currency)}</span>
                            </div>
                          </div>

                          {/* Actions inside drawer */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                generateOfficialReceipt(order, currentStore)
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl text-[10px] font-jost font-bold uppercase tracking-wider transition-all"
                            >
                              <Download className="w-3.5 h-3.5 text-stone-700" />
                              <span>{t('download official pdf receipt', 'Download Official Receipt')}</span>
                            </button>

                            <Link
                              href={`/orders/${order.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-stone-950 rounded-xl text-[10px] font-jost font-bold uppercase tracking-wider transition-all shadow-sm font-semibold"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>{t('Open Full Tracker', 'فتح التتبع الشامل')}</span>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {/* Sticky Order Receipt & Invoice Sidebar (Desktop only to prevent mobile clutter) */}
            {selectedOrder && (
              <div className="hidden lg:block lg:col-span-1">
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-6 sm:p-8 sticky top-24 shadow-lg space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                    <div>
                      <span className="font-jost text-[9px] font-bold text-gold-600 uppercase tracking-widest">
                        {t('payments.invoice')}
                      </span>
                      <h3 className="font-bodoni text-xl font-bold uppercase text-stone-900">
                        {t('Receipt Summary')}
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-bold text-stone-400">
                      #{selectedOrder.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  {/* Status Row */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-jost font-bold uppercase tracking-wider text-stone-400">{t('Status')}</span>
                      <span className="font-jost font-bold uppercase tracking-wider text-stone-900">
                        {t((STATUS_CONFIG[selectedOrder.orderStatus] || STATUS_CONFIG.pending).key)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-jost font-bold uppercase tracking-wider text-stone-400">{t('Payment')}</span>
                      <span className={`font-mono font-bold text-xs ${selectedOrder.paymentStatus === 'confirmed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {selectedOrder.paymentStatus === 'confirmed' ? t('Payment Verified') : t('Payment Verification Pending')}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    <span className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      {t('Garments', 'القطع')} ({selectedOrder.items?.length || 0})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-stone-50">
                      {selectedOrder.items?.map((it: any, idx: number) => (
                        <div key={idx} className="pt-2 flex justify-between items-start text-xs">
                          <div>
                            <p className="font-serif font-bold text-stone-900">{it.productName}</p>
                            <p className="text-[10px] text-stone-500">{it.size || 'M'} • {t('Quantity')}: {it.quantity}</p>
                          </div>
                          <span className="font-mono font-bold text-stone-900">
                            {formatPrice(Number(it.unitPrice) * Number(it.quantity), currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-2 pt-4 border-t border-stone-100 text-xs font-jost">
                    <div className="flex justify-between text-stone-500">
                      <span>{t('dashboard.subtotal')}</span>
                      <span className="font-mono font-semibold">{formatPrice(Number(selectedOrder.subtotal || selectedOrder.total), currency)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>{t('dashboard.taxation')}</span>
                      <span className="font-mono font-semibold">{formatPrice(Number(selectedOrder.tax || 0), currency)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>{t('Logistics')}</span>
                      <span className="font-mono font-semibold">{formatPrice(Number(selectedOrder.shipping || 0), currency)}</span>
                    </div>
                    <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline font-bold text-base text-stone-900">
                      <span className="uppercase">{t('dashboard.finalTotal')}</span>
                      <span className="font-mono text-xl">{formatPrice(Number(selectedOrder.total), currency)}</span>
                    </div>
                  </div>

                  {/* Sidebar Action Buttons */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => generateOfficialReceipt(selectedOrder, currentStore)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-full font-jost font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      <Download className="w-4 h-4 text-stone-700" />
                      <span>{t('download official pdf receipt', 'Download Receipt (PDF)')}</span>
                    </button>

                    <Link
                      href={`/orders/${selectedOrder.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-full font-jost font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                      <ExternalLink className="w-4 h-4 text-gold-400" />
                      <span>{t('Live Tracking', 'المتابعة الحية')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
