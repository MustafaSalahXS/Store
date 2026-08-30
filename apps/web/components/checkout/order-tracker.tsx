'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  CheckCheck, 
  MapPin, 
  Phone, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  ShieldAlert, 
  ShieldCheck,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import { api } from '@/lib/api'
import { Order } from '@/lib/types'
import { useLanguage } from '@/lib/language-context'
import { useStore } from '@/lib/store-context'
import { generateOfficialReceipt } from '@/lib/generate-receipt'

interface OrderTrackerProps {
  orderId: string
  initialOrder?: Order | null
  onDownloadReceipt?: (order?: Order | null) => void
  storeWhatsapp?: string
  currency?: string
}

export default function OrderTracker({
  orderId,
  initialOrder,
  onDownloadReceipt,
  storeWhatsapp,
  currency = 'USD'
}: OrderTrackerProps) {
  const { t, isRTL } = useLanguage()
  const { currentStore } = useStore()
  const [order, setOrder] = useState<Order | null>(initialOrder || null)
  const [isLoading, setIsLoading] = useState(!initialOrder)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedTracking, setCopiedTracking] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchOrder = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true)
    try {
      const data = await api.orders.get(orderId)
      if (data) {
        setOrder(data)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.warn('Failed to poll order update:', err)
    } finally {
      setIsLoading(false)
      if (showLoading) setIsRefreshing(false)
    }
  }

  // Initial fetch and auto-polling every 3.5 seconds
  useEffect(() => {
    fetchOrder()
    const interval = setInterval(() => {
      fetchOrder()
    }, 3500)
    return () => clearInterval(interval)
  }, [orderId])

  const copyTrackingNumber = (num: string) => {
    navigator.clipboard.writeText(num)
    setCopiedTracking(true)
    setTimeout(() => setCopiedTracking(false), 2000)
  }

  // Active delivery record if available
  const activeDelivery = order?.deliveries?.[0]
  const trackingNumber = activeDelivery?.trackingNumber || `TRK-${orderId.slice(-8).toUpperCase()}`
  const currentLocation = activeDelivery?.deliveryNotes || (
    order?.orderStatus === 'shipped' 
      ? t('in transit with regional courier', 'In transit with regional logistics courier')
      : order?.orderStatus === 'approved'
      ? t('central fulfillment center', 'Central fulfillment center — Package staged')
      : t('Intake staging facility', 'منشأة الفحص والتجهيز الأولية')
  )

  // Compute 5-stage milestone progression
  const getStageIndex = () => {
    if (!order) return 1
    if (order.orderStatus === 'delivered') return 5
    if (order.orderStatus === 'shipped' || activeDelivery?.currentStatus === 'in_transit') return 4
    if (order.orderStatus === 'processing' || activeDelivery?.currentStatus === 'picking_up') return 3
    if (order.orderStatus === 'approved' || order.paymentStatus === 'paid') return 2
    return 1 // 'pending'
  }

  const currentStage = getStageIndex()
  const isPaymentPending = order?.paymentStatus !== 'paid' && order?.orderStatus === 'pending'

  const stages = [
    {
      step: 1,
      title: t('order placement', 'Order Placed'),
      desc: order?.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('Confirmed', 'مؤكد'),
      icon: Clock,
    },
    {
      step: 2,
      title: t('payment verified & staged', 'Payment & Verification'),
      desc: isPaymentPending ? t('awaiting admin review', 'Awaiting Merchant Verification') : t('Verified & Approved', 'معتمد ومؤكد'),
      icon: isPaymentPending ? ShieldAlert : ShieldCheck,
      isPending: isPaymentPending,
    },
    {
      step: 3,
      title: t('packaging & atelier inspection', 'Packaging & Prep'),
      desc: currentStage >= 3 ? t('Package Secured', 'تم التغليف والفحص') : t('Queued for Assembly', 'في انتظار التجهيز'),
      icon: Package,
    },
    {
      step: 4,
      title: t('out for delivery', 'In Transit'),
      desc: currentStage >= 4 ? t('En Route to Destination', 'في الطريق للوجهة') : t('Awaiting Courier Dispatch', 'في انتظار تسليم المندوب'),
      icon: Truck,
    },
    {
      step: 5,
      title: t('delivered', 'Delivered'),
      desc: currentStage === 5 ? t('Completed', 'مكتمل بنجاح') : t('Final Delivery Destination', 'وجهة التسليم النهائية'),
      icon: CheckCheck,
    },
  ]

  const whatsappMessage = encodeURIComponent(
    `Hello! I am following up on Order #${orderId.slice(-8).toUpperCase()}.\nStatus: ${order?.orderStatus?.toUpperCase() || 'PENDING'}.\nCould you please update me on its progress?`
  )

  const adminPhone = storeWhatsapp ? storeWhatsapp.replace(/[^0-9]/g, '') : ''

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner: Status Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-stone-200 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-stone-900 text-white shadow-sm font-mono">
                {t('Order')} #{orderId.slice(-8).toUpperCase()}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] sm:text-[10px] font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{t('Live Sync', 'مزامنة حية')}</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bodoni font-bold text-stone-900 uppercase tracking-tight">
              {t('Concierge Live Tracker', 'متابعة شحنة المشغل الحية')}
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-1">
              {t('Real-time synchronization with logistics & fulfillment dispatch.', 'مزامنة مباشرة مع حركة التجهيز والشحن الإقليمي السريع.')}
            </p>
          </div>

          <button
            onClick={() => fetchOrder(true)}
            disabled={isRefreshing}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl border border-stone-200 text-xs font-jost font-bold uppercase tracking-wider text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold-600' : ''}`} />
            <span>{isRefreshing ? t('Checking...', 'جاري التحديث...') : t('Refresh', 'تحديث')}</span>
          </button>
        </div>

        {/* Live Admin Review Notice (if pending approval) */}
        <AnimatePresence>
          {isPaymentPending && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 md:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5"
            >
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-bold text-amber-950 uppercase font-bodoni tracking-wider">
                  {t('Awaiting Merchant & Payment Approval', 'في انتظار مراجعة الإدارة واعتماد الدفع')}
                </p>
                <p className="text-[11px] md:text-xs text-amber-800 leading-relaxed font-jost">
                  {t('Your order has been safely placed. Our concierge administrators are currently reviewing and verifying your payment. Once approved, packaging and shipping will commence immediately.', 'تم تسجيل طلبك بنجاح. فريق إدارة المشغل يقوم بمراجعة وتأكيد الدفع حالياً، وبمجرد الاعتماد سيتم بدء التغليف والشحن الفوري.')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5-Step Milestone Timeline */}
        <div className="mt-8 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 relative">
            {stages.map((stage) => {
              const isPast = currentStage > stage.step
              const isCurrent = currentStage === stage.step
              const Icon = stage.icon

              return (
                <div
                  key={stage.step}
                  className={`flex md:flex-col items-center md:text-center p-3.5 rounded-2xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gold-50/70 border-gold-400 shadow-md ring-1 ring-gold-400'
                      : isPast
                      ? 'bg-stone-50 border-stone-200'
                      : 'bg-transparent border-stone-100 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-0 md:mb-2.5 ${isRTL ? 'ml-3 md:ml-0' : 'mr-3 md:mr-0'} transition-transform ${
                      isCurrent
                        ? 'bg-gold-500 text-white scale-110 shadow-sm animate-pulse'
                        : isPast
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 md:flex-none">
                    <p className="text-xs font-bodoni font-bold uppercase tracking-tight text-stone-900">
                      {stage.title}
                    </p>
                    <p className="text-[10px] font-jost font-semibold text-stone-500 mt-0.5">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live Location Checkpoint Card */}
        <div className="mt-8 p-5 md:p-6 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-jost font-bold uppercase tracking-widest text-gold-600">
              <MapPin className="w-4 h-4" />
              <span>{t('current checkpoint', 'Current Checkpoint & Location')}</span>
            </div>
            <p className="text-sm md:text-base font-bold text-stone-900 font-bodoni">
              {currentLocation}
            </p>
            <p className="text-[10px] text-stone-500 font-mono">
              {t('Updated', 'آخر تحديث')}: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          <div className={`space-y-2 border-t md:border-t-0 ${isRTL ? 'md:border-r md:pr-6' : 'md:border-l md:pl-6'} border-stone-200 pt-4 md:pt-0`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-jost font-bold uppercase tracking-widest text-stone-500">
                {t('tracking code', 'Airway Bill / Tracking Code')}
              </span>
              <button
                onClick={() => copyTrackingNumber(trackingNumber)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-gold-600 hover:text-gold-700 uppercase"
              >
                {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTracking ? t('Copied', 'تم النسخ') : t('copy number', 'Copy')}</span>
              </button>
            </div>
            <p className="text-sm font-mono font-bold text-stone-900 tracking-wider">
              {trackingNumber}
            </p>
            {activeDelivery?.deliveryPerson && (
              <div className="flex items-center gap-2 pt-1 text-xs text-stone-700 font-medium">
                <Phone className="w-3.5 h-3.5 text-gold-600" />
                <span>{t('Courier', 'المندوب')}: {activeDelivery.deliveryPerson.name} ({activeDelivery.deliveryPerson.phone})</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Details List */}
        {order?.items && order.items.length > 0 && (
          <div className="mt-6 pt-6 border-t border-stone-100">
            <h4 className="text-[11px] font-jost font-bold uppercase tracking-widest text-stone-400 mb-3">
              {t('purchased garments', 'Items in this shipment')} ({order.items.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between gap-3 text-xs py-2.5 px-3 bg-white rounded-xl border border-stone-100"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-bold text-stone-900 shrink-0">{item.quantity}x</span>
                    <span className="text-stone-700 font-medium truncate">{item.productName}</span>
                    {item.selectedSize && (
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 text-[10px] font-bold uppercase text-stone-600 shrink-0">
                        {item.selectedSize}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-stone-900 shrink-0">
                    {currency} {Number(item.totalPrice || item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-5 sm:pt-6 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                if (onDownloadReceipt) {
                  onDownloadReceipt(order)
                } else if (order) {
                  generateOfficialReceipt(order, currentStore)
                }
              }}
              disabled={!order}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-full text-xs font-jost font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> <span>{t('download official pdf receipt', 'Download Receipt')}</span>
            </button>

            {adminPhone && (
              <a
                href={`https://wa.me/${adminPhone}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-jost font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" /> <span>{t('contact concierge on whatsapp', 'WhatsApp Concierge')}</span>
              </a>
            )}
          </div>

          <p className="text-[10px] text-stone-400 font-mono text-center sm:text-right">
            {t('Support reference', 'مرجع الدعم')}: #{orderId.slice(0, 13)}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
