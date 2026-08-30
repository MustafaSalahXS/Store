'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import OrderTracker from '@/components/checkout/order-tracker'
import { useLanguage } from '@/lib/language-context'
import { useStore } from '@/lib/store-context'
import { api } from '@/lib/api'
import { Order } from '@/lib/types'
import { 
  ArrowLeft, 
  ArrowRight, 
  Share2, 
  Check, 
  Copy, 
  Sparkles, 
  AlertCircle, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function OrderTrackingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = (params?.id as string) || ''
  
  const { t, isRTL } = useLanguage()
  const { currentStore } = useStore()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!orderId) {
      setError(t('Invalid Order Reference', 'معرف الطلب غير صحيح'))
      setIsLoading(false)
      return
    }

    const loadOrder = async () => {
      try {
        const data = await api.orders.get(orderId)
        if (!data) {
          setError(t('Order not found', 'تعذر العثور على هذا الطلب'))
        } else {
          setOrder(data)
        }
      } catch (err: any) {
        setError(err?.message || t('Failed to load order', 'فشل تحميل بيانات الطلب'))
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  const copyPageLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const shortRef = orderId ? orderId.slice(-8).toUpperCase() : ''

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-gold-500 selection:text-white flex flex-col justify-between">
      <div>
        <Header />

        <main className="section-container py-8 sm:py-12 md:py-16">
          {/* Top Breadcrumb & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-stone-200">
            <div className="flex items-center gap-2 text-xs font-jost">
              <Link href="/" className="text-stone-500 hover:text-stone-900 transition-colors">
                {t('common.home', 'Home')}
              </Link>
              <span className="text-stone-300">/</span>
              <Link href="/orders" className="text-stone-500 hover:text-stone-900 transition-colors">
                {t('common.orders', 'Orders')}
              </Link>
              <span className="text-stone-300">/</span>
              <span className="font-mono font-bold text-stone-900">
                #{shortRef || orderId}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              <button
                onClick={copyPageLink}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-full text-xs font-jost font-bold uppercase tracking-wider text-stone-700 transition-all shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                <span>{copiedLink ? t('Link Copied!', 'تم نسخ الرابط!') : t('Copy Tracking Link', 'نسخ رابط التتبع')}</span>
              </button>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-jost font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('Continue Shopping', 'مواصلة التسوق')}</span>
              </Link>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-2 border-stone-200 border-t-gold-500 rounded-full animate-spin mx-auto" />
              <p className="text-stone-400 font-jost font-bold uppercase tracking-[0.3em] text-xs">
                {t('Retrieving Atelier Dispatch Record...', 'جاري جلب سجل الشحنة من المشغل...')}
              </p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="py-16 text-center max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-rose-600">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="font-bodoni text-2xl font-bold uppercase tracking-tight text-stone-900">
                  {t('Order Record Unavailable', 'تعذر العثور على الطلب')}
                </h2>
                <p className="font-jost text-xs text-stone-500 leading-relaxed">
                  {error}
                </p>
              </div>
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full text-xs font-jost font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md"
              >
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{t('Back to Orders', 'العودة لقائمة الطلبات')}</span>
              </Link>
            </div>
          )}

          {/* Live Order Tracker Section */}
          {!isLoading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Editorial Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2 mb-6 sm:mb-8 px-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-[9px] sm:text-[10px] font-jost font-bold uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-gold-600" />
                  <span>{t('Official Atelier Order Record', 'سجل طلبات المشغل الرسمي')}</span>
                </div>
                <h1 className="font-bodoni text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-stone-900">
                  {t('Live Order Tracking', 'المتابعة الحية للطلب')}
                </h1>
                <p className="font-jost text-xs text-stone-500 font-medium">
                  {t('Real-time logistics synchronization and verified status milestones.', 'متابعة حية لمراحل الفحص والتغليف والشحن والتسليم.')}
                </p>
              </div>

              {/* The Live Tracker Component */}
              <OrderTracker
                orderId={orderId}
                initialOrder={order}
                storeWhatsapp={currentStore?.whatsappNumber}
                currency={currentStore?.currency || 'USD'}
              />
            </motion.div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
