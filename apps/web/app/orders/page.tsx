'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'
import { ShoppingBag, Package, Truck, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useStore } from '@/lib/store-context'
import { useTranslations } from '@/lib/language-context'

const STATUS_CONFIG: any = {
  pending: { color: 'text-stone-500', bg: 'bg-stone-50', icon: Clock, key: 'dashboard.processingStatus' },
  processing: { color: 'text-stone-600', bg: 'bg-stone-50', icon: Package, key: 'dashboard.inStudio' },
  shipped: { color: 'text-stone-800', bg: 'bg-stone-50', icon: Truck, key: 'dashboard.inTransit' },
  delivered: { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle, key: 'dashboard.deliveredStatus' },
  approved: { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle, key: 'dashboard.approvedStatus' },
  declined: { color: 'text-red-700', bg: 'bg-red-50', icon: AlertCircle, key: 'dashboard.declinedStatus' },
  cancelled: { color: 'text-red-700', bg: 'bg-red-50', icon: AlertCircle, key: 'dashboard.cancelledStatus' },
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { currentStore } = useStore()
  const t = useTranslations()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const result = await api.orders.list(user.id)
        setOrders(result)
        if (result.length > 0) setSelectedOrder(result[0])
      } catch (error) {
        console.error('Failed to load orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [user])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Header />
        <div className="section-container py-24 text-center space-y-6">
          <div className="w-12 h-12 border-2 border-stone-200 border-t-gold-500 rounded-full animate-spin mx-auto" />
          <p className="text-stone-400 font-jost font-bold uppercase tracking-[0.3em] text-[10px]">{t('dashboard.retrievingArchives')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Header />
        <div className="section-container py-24 text-center space-y-12">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto border border-stone-200">
             <AlertCircle className="w-10 h-10 text-stone-300" />
          </div>
          <div className="space-y-4">
            <h1 className="font-bodoni text-5xl md:text-7xl font-bold text-stone-900 tracking-tight uppercase">{t('dashboard.privateAccess').split(' ')[0]}<br/><span className="text-gold-600">{t('dashboard.privateAccess').split(' ')[1]}</span></h1>
            <p className="font-jost text-stone-500 max-w-sm mx-auto text-sm uppercase tracking-widest leading-loose">{t('dashboard.identityVerificationRequired')}</p>
          </div>
          <Link
            href="/login"
            className="inline-block px-12 py-5 bg-stone-900 text-white font-jost font-bold shadow-2xl hover:bg-gold-600 transition-all uppercase tracking-[0.4em] text-[10px]"
          >
            {t('dashboard.authorizeNow')}
          </Link>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <Header />
        <div className="section-container py-24">
          <h1 className="font-bodoni text-5xl md:text-8xl font-bold text-stone-900 mb-16 tracking-tight uppercase leading-[0.85]">{t('dashboard.acquisitionHistory').split(' ')[0]}<br/><span className="text-gold-500">{t('dashboard.acquisitionHistory').split(' ')[1]}</span></h1>
          <div className="text-center py-32 bg-white rounded-[3rem] border border-stone-100 shadow-sm">
            <ShoppingBag className="w-20 h-20 mx-auto mb-8 text-stone-100" />
            <h2 className="font-bodoni text-2xl font-bold text-stone-900 mb-4 uppercase tracking-widest">{t('dashboard.archiveEmpty')}</h2>
            <p className="font-jost text-stone-400 mb-12 uppercase tracking-widest text-xs">{t('dashboard.noTransactions')}</p>
            <Link
              href="/"
              className="inline-block px-12 py-5 bg-stone-900 text-white font-jost font-bold shadow-2xl hover:bg-gold-600 transition-all uppercase tracking-[0.4em] text-[10px]"
            >
              {t('dashboard.beginCuration')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header />

      <div className="section-container py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <h1 className="font-bodoni text-6xl md:text-9xl font-bold text-stone-900 tracking-tight uppercase leading-[0.85]">{t('dashboard.orderHistory').split(' ')[0]}<br/><span className="text-gold-500">{t('dashboard.orderHistory').split(' ')[1]}</span></h1>
          <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] md:mb-4">{t('dashboard.securedLedger')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-24">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-8">
            {orders.map((order, idx) => {
              const statusConfig = STATUS_CONFIG[order.orderStatus || 'pending'] || STATUS_CONFIG.pending
              const StatusIcon = statusConfig.icon

              return (
                <motion.button
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left p-8 md:p-10 rounded-3xl border transition-all relative overflow-hidden group ${
                    selectedOrder?.id === order.id
                      ? 'border-gold-500 bg-white shadow-[0_40px_100px_rgba(202,138,4,0.1)]'
                      : 'border-stone-100 bg-white hover:border-gold-300 hover:shadow-2xl'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-stone-50 rounded-bl-full -mr-20 -mt-20 transition-transform group-hover:scale-110" />
                  
                  <div className="flex items-start justify-between mb-10 relative">
                    <div className="space-y-2">
                      <h3 className="font-bodoni text-2xl md:text-3xl font-bold text-stone-900 tracking-tight uppercase">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                      <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em]">
                        {t('dashboard.recordedOn')} {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-6 py-2.5 rounded-full ${statusConfig.bg} ${statusConfig.color} border border-current/10 shadow-sm`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="font-jost text-[9px] font-bold uppercase tracking-[0.2em]">
                        {t(statusConfig.key)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-8 relative">
                    <div className="space-y-3">
                       <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em]">{t('dashboard.transactionDetails')}</p>
                       <p className="font-bodoni text-xl text-stone-900 font-bold uppercase tracking-tight">
                        {order.items?.length || 0} {t('dashboard.assets')} • <span className="text-gold-600">{formatPrice(Number(order.total), currentStore?.currency || 'USD')}</span>
                       </p>
                    </div>
                    <div className="flex items-center gap-6">
                       <p className="px-6 py-2.5 bg-stone-50 text-stone-900 rounded-full font-jost text-[9px] font-bold uppercase tracking-[0.2em] border border-stone-100">
                        {order.paymentMethod?.replace('_', ' ') || 'WhatsApp'}
                      </p>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedOrder?.id === order.id ? 'bg-gold-500 text-white' : 'bg-stone-900 text-white group-hover:bg-gold-500 shadow-xl'}`}>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Order Details Sidebar */}
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={selectedOrder.id}
              className="bg-white rounded-[2.5rem] border border-stone-100 p-10 md:p-12 h-fit sticky top-24 shadow-[0_30px_100px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-full -mr-12 -mt-12" />
              
              <h3 className="font-bodoni text-3xl font-bold text-stone-900 mb-12 tracking-tight uppercase">{t('dashboard.detailsSummary').split(' ')[0]}<br/><span className="text-gold-500">{t('dashboard.detailsSummary').split(' ')[1]}</span></h3>

              <div className="space-y-10 relative">
                <div className="pb-10 border-b border-stone-50">
                  <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-4">{t('dashboard.systemIdentifier')}</p>
                  <p className="font-mono text-xs bg-stone-50 px-5 py-4 rounded-xl mb-4 break-all border border-stone-100 text-stone-600">
                    {selectedOrder.id}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pb-10 border-b border-stone-50">
                  <div>
                    <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-2">{t('admin.customer')}</p>
                    <p className="font-bodoni text-sm font-bold text-stone-900 uppercase">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-2">{t('delivery.status')}</p>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${(STATUS_CONFIG[selectedOrder.orderStatus] || STATUS_CONFIG.pending).color.replace('text', 'bg')}`} />
                       <p className="font-jost text-xs font-bold text-stone-900 uppercase tracking-widest">{t((STATUS_CONFIG[selectedOrder.orderStatus] || STATUS_CONFIG.pending).key)}</p>
                    </div>
                  </div>
                </div>

                <div className="pb-10 border-b border-stone-50">
                  <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-6">{t('dashboard.acquiredAssets')}</p>
                  <div className="space-y-6">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-bodoni text-sm font-bold text-stone-900 leading-tight uppercase">{item.productName}</p>
                          <p className="font-jost text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-2">{t('dashboard.quantity')}: {item.quantity}</p>
                        </div>
                        <p className="font-bodoni text-sm font-bold text-gold-600">
                          {formatPrice(Number(item.unitPrice) * Number(item.quantity), currentStore?.currency || 'USD')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center font-jost text-[9px] font-bold text-stone-400 uppercase tracking-[0.3em]">
                    <span>{t('dashboard.subtotal')}</span>
                    <span>{formatPrice(Number(selectedOrder.subtotal || 0), currentStore?.currency || 'USD')}</span>
                  </div>
                  <div className="flex justify-between items-center font-jost text-[9px] font-bold text-stone-400 uppercase tracking-[0.3em]">
                    <span>{t('dashboard.taxation')}</span>
                    <span>{formatPrice(Number(selectedOrder.tax || 0), currentStore?.currency || 'USD')}</span>
                  </div>
                  <div className="flex justify-between items-center font-jost text-[9px] font-bold text-stone-400 uppercase tracking-[0.3em]">
                    <span>{t('dashboard.processingFee')}</span>
                    <span>{formatPrice(Number(selectedOrder.shipping || 0), currentStore?.currency || 'USD')}</span>
                  </div>
                  <div className="pt-8 border-t border-stone-100 flex justify-between items-end">
                    <span className="font-jost text-[10px] font-bold text-stone-900 uppercase tracking-[0.4em]">{t('dashboard.finalTotal')}</span>
                    <span className="font-bodoni text-4xl font-bold text-stone-900 tracking-tighter leading-none">{formatPrice(Number(selectedOrder.total || 0), currentStore?.currency || 'USD')}</span>
                  </div>
                </div>

                <div className="mt-10 p-8 bg-stone-50 rounded-3xl border border-stone-100">
                  <p className="font-jost text-[9px] font-bold text-stone-400 uppercase tracking-[0.4em] mb-4">
                    {t('dashboard.methodOfAcquisition')}
                  </p>
                  <p className="font-bodoni text-lg font-bold text-stone-900 uppercase tracking-tight">
                    {selectedOrder.paymentMethod?.replace('_', ' ') || t('dashboard.whatsAppCheckout')}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${selectedOrder.paymentStatus === 'confirmed' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gold-500'}`} />
                    <p className="font-jost text-[9px] font-bold text-stone-500 uppercase tracking-[0.2em]">
                      {t('admin.payment')} {selectedOrder.paymentStatus === 'confirmed' ? t('dashboard.paymentVerified') : t('dashboard.paymentVerificationPending')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
