'use client'

import React, { useState } from 'react'
import {
  Search,
  Filter,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldCheck,
  UserCheck,
  Printer,
  X,
  Copy,
  Check,
  ExternalLink,
  SlidersHorizontal,
  ArrowRight,
  PackageCheck
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'

interface OrdersSectionProps {
  orders: any[]
  currentStore: any
  staffUsers?: any[]
  deliveryZones?: any[]
  onUpdateStatusAndDelivery: (orderId: string, data: { orderStatus?: string; assignedDriverId?: string; notes?: string }) => void
  t: (key: string, fallback?: string) => string
}

export default function OrdersSection({
  orders,
  currentStore,
  staffUsers = [],
  deliveryZones = [],
  onUpdateStatusAndDelivery,
  t
}: OrdersSectionProps) {
  const { isRTL } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedItemsOrderId, setExpandedItemsOrderId] = useState<string | null>(null)

  // Selected Order for Full Modal View
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null)

  // Modal edit states
  const [modalStatus, setModalStatus] = useState('')
  const [modalDriver, setModalDriver] = useState('')
  const [modalNote, setModalNote] = useState('')

  // Status options
  const STATUS_OPTIONS = [
    { value: 'pending', label: t('admin.statusPending', 'Pending Review'), labelAr: 'قيد المراجعة', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'approved', label: t('admin.statusApproved', 'Approved & Preparing'), labelAr: 'مؤكد وقيد التجهيز', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'in_production', label: t('admin.statusInProduction', 'In Production'), labelAr: 'في مرحلة التفصيل', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'shipped', label: t('admin.statusShipped', 'Shipped / In Transit'), labelAr: 'تم الشحن', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { value: 'out_for_delivery', label: t('admin.statusOutForDelivery', 'Out for Delivery'), labelAr: 'مع مندوب التوصيل', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { value: 'delivered', label: t('admin.statusDelivered', 'Delivered & Completed'), labelAr: 'تم التوصيل بنجاح', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'declined', label: t('admin.statusDeclined', 'Declined'), labelAr: 'مرفوض', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 'cancelled', label: t('admin.statusCancelled', 'Cancelled'), labelAr: 'ملغي', color: 'bg-stone-100 text-stone-700 border-stone-200' }
  ]

  // Filter orders
  const filteredOrders = orders.filter((order: any) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = (order.customerName || '').toLowerCase().includes(q)
      const matchEmail = (order.customerEmail || '').toLowerCase().includes(q)
      const matchPhone = (order.customerPhone || '').toLowerCase().includes(q)
      const matchId = (order.id || '').toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchPhone && !matchId) return false
    }

    // Status filter
    if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
      return false
    }

    // Zone filter
    if (zoneFilter !== 'all' && order.zoneId !== zoneFilter) {
      return false
    }

    // Date filter
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt)
      const now = new Date()
      if (dateFilter === 'today') {
        if (orderDate.toDateString() !== now.toDateString()) return false
      } else if (dateFilter === 'week') {
        const diff = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
        if (diff > 7) return false
      } else if (dateFilter === 'month') {
        if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return false
      }
    }

    return true
  })

  // Quick stats
  const pendingCount = orders.filter(o => o.orderStatus === 'pending').length
  const approvedCount = orders.filter(o => o.orderStatus === 'approved' || o.orderStatus === 'in_production').length
  const transitCount = orders.filter(o => o.orderStatus === 'shipped' || o.orderStatus === 'out_for_delivery').length
  const deliveredCount = orders.filter(o => o.orderStatus === 'delivered').length

  const getStatusBadge = (status: string) => {
    const found = STATUS_OPTIONS.find(s => s.value === status)
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap shadow-sm ${found ? found.color : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
        {found ? (isRTL ? found.labelAr : found.label) : status}
      </span>
    )
  }

  const getPaymentBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">{isRTL ? 'مدفوع' : 'PAID'}</span>
      case 'pending_verification':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">{isRTL ? 'قيد المراجعة' : 'REVIEW'}</span>
      case 'unpaid':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">{isRTL ? 'غير مدفوع' : 'UNPAID'}</span>
    }
  }

  const copyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const openWhatsApp = (order: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const phone = (order.customerPhone || '').replace(/[^0-9]/g, '')
    if (!phone) {
      alert('No valid phone number for this customer.')
      return
    }
    const storeName = currentStore?.name || 'Atelier Store'
    const found = STATUS_OPTIONS.find(s => s.value === order.orderStatus)
    const statusText = found ? (isRTL ? found.labelAr : found.label) : order.orderStatus
    const message = encodeURIComponent(
      `مرحباً ${order.customerName}،\n\nنود إفادتكم من متجر ${storeName} بخصوص طلبكم رقم #${order.id.slice(0, 8).toUpperCase()}.\nحالة الطلب الحالية: ${statusText}.\nإجمالي الفاتورة: ${formatPrice(order.total, currentStore?.currency || 'USD')}.\n\nشكراً لتسوقكم معنا!`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const handleOpenOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setModalStatus(order.orderStatus || 'pending')
    setModalDriver(order.assignedDriverId || '')
    setModalNote('')
  }

  const handleSaveModalUpdates = () => {
    if (!selectedOrder) return
    onUpdateStatusAndDelivery(selectedOrder.id, {
      orderStatus: modalStatus,
      assignedDriverId: modalDriver || undefined,
      notes: modalNote.trim() || undefined
    })
    setSelectedOrder({
      ...selectedOrder,
      orderStatus: modalStatus,
      assignedDriverId: modalDriver || undefined
    })
    alert('Order updated successfully!')
  }

  const activeFiltersCount = 
    (statusFilter !== 'all' ? 1 : 0) +
    (dateFilter !== 'all' ? 1 : 0) +
    (zoneFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0)

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-28 sm:pb-8 max-w-full overflow-hidden">
      {/* 4 Summary Status KPIs - Touch-optimized on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        <div
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
            statusFilter === 'pending'
              ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-card border-border hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              {isRTL ? 'قيد الانتظار' : t('admin.statusPending', 'Pending')}
            </span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-amber-600 font-mono">{pendingCount}</p>
          <span className="text-[9px] text-stone-400 block mt-0.5">
            {isRTL ? 'بانتظار التأكيد' : 'Needs Review'}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
            statusFilter === 'approved'
              ? 'bg-blue-500/15 border-blue-500 shadow-md ring-2 ring-blue-500/20'
              : 'bg-card border-border hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              {isRTL ? 'قيد التجهيز' : t('admin.statusApproved', 'In Prep')}
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-blue-600 font-mono">{approvedCount}</p>
          <span className="text-[9px] text-stone-400 block mt-0.5">
            {isRTL ? 'معتمد وقيد التفصيل' : 'Approved & Tailoring'}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'shipped' ? 'all' : 'shipped')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
            statusFilter === 'shipped'
              ? 'bg-indigo-500/15 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
              : 'bg-card border-border hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              {isRTL ? 'قيد الشحن' : t('admin.statusShipped', 'In Transit')}
            </span>
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-indigo-600 font-mono">{transitCount}</p>
          <span className="text-[9px] text-stone-400 block mt-0.5">
            {isRTL ? 'مع مناديب التوصيل' : 'Dispatched Orders'}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'delivered' ? 'all' : 'delivered')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
            statusFilter === 'delivered'
              ? 'bg-green-500/15 border-green-500 shadow-md ring-2 ring-green-500/20'
              : 'bg-card border-border hover:border-green-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              {isRTL ? 'تم التوصيل' : t('admin.statusDelivered', 'Delivered')}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-green-600 font-mono">{deliveredCount}</p>
          <span className="text-[9px] text-stone-400 block mt-0.5">
            {isRTL ? 'مبيعات ناجحة ومحصلة' : 'Completed Sales'}
          </span>
        </div>
      </div>

      {/* Advanced Filter Toolbar (Mobile Optimized) */}
      <div className="bg-card rounded-2xl p-3.5 sm:p-5 border border-border space-y-3 shadow-sm">
        {/* Search Bar + Filter Trigger */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin.searchOrders', 'Search by customer, phone, or order ID...')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-8 py-2.5 bg-secondary/50 border border-border rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-secondary/60 text-stone-700 border-border hover:bg-secondary'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-gold-500 text-stone-900 text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Horizontal Scrollable Status Bar on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-secondary/50 text-stone-600 hover:bg-secondary'
            }`}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map(s => {
            const count = orders.filter(o => o.orderStatus === s.value).length
            const isSelected = statusFilter === s.value
            return (
              <button
                key={s.value}
                onClick={() => setStatusFilter(isSelected ? 'all' : s.value)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-secondary/50 text-stone-600 hover:bg-secondary'
                }`}
              >
                <span>{isRTL ? s.labelAr : s.label}</span>
                <span className="font-mono text-[9px] opacity-70">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Collapsible Date & Zone Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3 border-t border-border/70">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Date Period
              </label>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full p-2.5 bg-secondary/50 border border-border rounded-xl text-xs font-bold outline-none cursor-pointer"
              >
                <option value="all">{t('admin.allTime', 'All Time')}</option>
                <option value="today">{t('admin.today', 'Today')}</option>
                <option value="week">{t('admin.last7Days', 'Last 7 Days')}</option>
                <option value="month">{t('admin.thisMonth', 'This Month')}</option>
              </select>
            </div>

            {deliveryZones.length > 0 && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Delivery Zone
                </label>
                <select
                  value={zoneFilter}
                  onChange={e => setZoneFilter(e.target.value)}
                  className="w-full p-2.5 bg-secondary/50 border border-border rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="all">{t('admin.allZones', 'All Delivery Zones')}</option>
                  {deliveryZones.map((z: any) => (
                    <option key={z.id} value={z.id}>{z.nameAr} - {z.nameEn}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setDateFilter('all')
                  setZoneFilter('all')
                }}
                className="w-full py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-100 transition-colors"
              >
                {t('admin.clearFilters', 'Reset All Filters')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders List / Table Container */}
      <div className="bg-card rounded-2xl sm:rounded-[2rem] border border-border p-3.5 sm:p-6 md:p-8 shadow-sm sm:shadow-xl">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-stone-900 flex items-center gap-2">
              <span>{t('admin.salesOrders', 'Sales & Orders')}</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground font-mono">
                ({filteredOrders.length})
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium">
              Manage client orders, status transitions, driver dispatches, and invoices.
            </p>
          </div>
        </div>

        {/* MOBILE ORDERS LIST (Cards Optimized for Phones) */}
        <div className="md:hidden space-y-3.5">
          {filteredOrders.map((order: any) => {
            const isExpanded = expandedItemsOrderId === order.id
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/80 space-y-3 shadow-sm hover:border-stone-400 transition-all"
              >
                {/* Top Row: Order ID, Date, Status, Payment */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => copyOrderId(order.id, e)}
                        className="font-mono text-xs font-black text-stone-900 bg-stone-100 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-stone-200 active:scale-95 transition-all"
                        title="Click to copy full ID"
                      >
                        <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                        {copiedId === order.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-stone-400" />}
                      </button>
                      {getPaymentBadge(order.paymentStatus)}
                    </div>
                    <h4 className="font-bold text-stone-900 text-base mt-1.5 leading-tight">
                      {order.customerName || 'Anonymous Client'}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-medium mt-0.5">
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {getStatusBadge(order.orderStatus)}
                    <span className="font-mono font-black text-base text-stone-900 block mt-1.5">
                      {formatPrice(order.total, currentStore?.currency || 'USD')}
                    </span>
                  </div>
                </div>

                {/* Delivery Zone & Destination Details */}
                <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-700 font-bold">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate max-w-[200px]">
                        {order.zone?.nameAr || order.zone?.nameEn || 'Standard Delivery Area'}
                      </span>
                    </span>
                    {order.deliveryFee > 0 && (
                      <span className="font-mono text-[10px] text-stone-500">
                        +{formatPrice(order.deliveryFee, currentStore?.currency || 'USD')}
                      </span>
                    )}
                  </div>
                  {order.addressDetails && (
                    <p className="text-[11px] text-stone-500 line-clamp-1 pl-4.5">
                      {order.addressDetails}
                    </p>
                  )}
                  {order.latitude && order.longitude && (
                    <a
                      href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-primary font-bold hover:underline inline-flex items-center gap-1 pl-4.5"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                {/* Quick Driver Assign Dropdown on Mobile */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">Driver:</span>
                  <select
                    value={order.assignedDriverId || ''}
                    onChange={e => onUpdateStatusAndDelivery(order.id, { assignedDriverId: e.target.value || undefined })}
                    className="flex-1 text-xs font-semibold py-1.5 px-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  >
                    <option value="">No Driver Assigned</option>
                    {staffUsers.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Status Selector on Mobile */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">Status:</span>
                  <select
                    value={order.orderStatus}
                    onChange={e => onUpdateStatusAndDelivery(order.id, { orderStatus: e.target.value })}
                    className="flex-1 text-xs font-bold py-1.5 px-2.5 bg-white border border-stone-300 rounded-xl shadow-xs outline-none"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {isRTL ? opt.labelAr : opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Items Summary (Collapsible) */}
                <div className="border border-stone-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedItemsOrderId(isExpanded ? null : order.id)}
                    className="w-full px-3 py-2 bg-stone-50/60 hover:bg-stone-100/60 flex items-center justify-between text-xs font-bold text-stone-700 transition-colors"
                  >
                    <span>{order.items?.length || 0} Items Ordered</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white divide-y divide-stone-100 space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-stone-900">
                              {item.quantity}x {item.productName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {item.selectedSize && (
                                <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {item.selectedColor && (
                                <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                  Color: {item.selectedColor}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-stone-900">
                            {formatPrice(item.totalPrice || item.unitPrice * item.quantity, currentStore?.currency || 'USD')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons (Mobile Sized Touch Targets) */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-1.5">
                    {order.customerPhone && (
                      <>
                        <button
                          onClick={(e) => openWhatsApp(order, e)}
                          title="WhatsApp Client"
                          className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <a
                          href={`tel:${order.customerPhone}`}
                          title="Call Client"
                          className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      title="View & Print Invoice"
                      className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl active:scale-95 transition-all flex items-center justify-center"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenOrderDetails(order)}
                    className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Manage Details</span>
                  </button>
                </div>
              </div>
            )
          })}

          {filteredOrders.length === 0 && (
            <div className="py-16 text-center text-muted-foreground font-bold italic text-sm bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              {t('admin.noOrders', 'No orders matching your criteria.')}
            </div>
          )}
        </div>

        {/* DESKTOP ORDERS TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="py-4 px-3 font-black">{t('admin.orderId')}</th>
                <th className="py-4 px-3 font-black">{t('admin.customer')}</th>
                <th className="py-4 px-3 font-black">{t('admin.items')}</th>
                <th className="py-4 px-3 font-black">{t('admin.deliveryZones', 'Delivery Zone & Driver')}</th>
                <th className="py-4 px-3 font-black">{t('admin.status', 'Status')}</th>
                <th className="py-4 px-3 font-black">{t('admin.total')}</th>
                <th className="py-4 px-3 text-right font-black">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-5 px-3">
                    <button
                      onClick={(e) => copyOrderId(order.id, e)}
                      className="font-mono text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
                      title="Click to copy full ID"
                    >
                      <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                      {copiedId === order.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-stone-300" />}
                    </button>
                    <div className="text-[10px] text-stone-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>

                  <td className="py-5 px-3">
                    <div className="font-bold text-stone-900 text-sm">{order.customerName}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{order.customerPhone || order.customerEmail}</div>
                    {order.customerPhone && (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => openWhatsApp(order)}
                          className="text-[10px] font-black text-green-600 hover:underline flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </button>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      </div>
                    )}
                  </td>

                  <td className="py-5 px-3 max-w-[220px]">
                    <div className="space-y-1">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="text-xs font-bold text-stone-700 truncate">
                          <span className="text-primary font-black mr-1">{item.quantity}x</span>
                          {item.productName}
                          {item.selectedSize && <span className="ml-1 text-[9px] bg-stone-100 px-1 py-0.5 rounded">{item.selectedSize}</span>}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-5 px-3">
                    <div className="text-xs font-bold text-stone-800">
                      {order.zone?.nameAr || order.zone?.nameEn || 'Default Zone'}
                    </div>
                    {order.addressDetails && (
                      <div className="text-[10px] text-stone-400 truncate max-w-[160px]">{order.addressDetails}</div>
                    )}
                    {/* Driver Assignment Dropdown */}
                    <div className="mt-1.5">
                      <select
                        value={order.assignedDriverId || ''}
                        onChange={e => onUpdateStatusAndDelivery(order.id, { assignedDriverId: e.target.value || undefined })}
                        className="text-[10px] font-bold p-1.5 bg-stone-100 border border-stone-200 rounded-lg outline-none cursor-pointer max-w-[150px]"
                      >
                        <option value="">Assign Driver...</option>
                        {staffUsers.map((u: any) => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="py-5 px-3">
                    <select
                      value={order.orderStatus}
                      onChange={e => onUpdateStatusAndDelivery(order.id, { orderStatus: e.target.value })}
                      className="text-[11px] font-black p-2 rounded-xl border bg-white shadow-xs outline-none cursor-pointer"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {isRTL ? opt.labelAr : opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-5 px-3">
                    <span className="font-black text-sm text-stone-900 block">
                      {formatPrice(order.total, currentStore?.currency || 'USD')}
                    </span>
                    {getPaymentBadge(order.paymentStatus)}
                  </td>

                  <td className="py-5 px-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setInvoiceOrder(order)}
                        title="Print Official Invoice"
                        className="p-2 bg-secondary text-primary hover:bg-primary hover:text-white rounded-xl transition-all"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenOrderDetails(order)}
                        title="Order Details & Timeline"
                        className="p-2 bg-secondary text-stone-700 hover:bg-stone-900 hover:text-white rounded-xl transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground font-bold italic text-sm">
                    {t('admin.noOrders', 'No orders found matching your filter.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Audit Timeline Modal (Fully Responsive Drawer / Modal) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-8 space-y-5 shadow-2xl border border-stone-100 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Mobile swipe handle */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-1 mb-2 sm:hidden" />

            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="font-mono text-xs text-stone-400 font-bold">#{selectedOrder.id.toUpperCase()}</span>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 mt-0.5">Order Details & Timeline</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Driver Quick Manager in Modal */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                Update Order Lifecycle
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={modalStatus}
                    onChange={e => setModalStatus(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold outline-none"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{isRTL ? opt.labelAr : opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Assigned Driver</label>
                  <select
                    value={modalDriver}
                    onChange={e => setModalDriver(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="">None / Unassigned</option>
                    {staffUsers.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Audit Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Verified payment receipt, ready for courier..."
                  value={modalNote}
                  onChange={e => setModalNote(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>
              <button
                onClick={handleSaveModalUpdates}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm active:scale-98"
              >
                Save Changes to Order
              </button>
            </div>

            {/* Customer Info & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs">
              <div>
                <span className="font-bold text-stone-400 uppercase tracking-wider block text-[10px]">Customer</span>
                <p className="font-black text-stone-900 text-sm mt-0.5">{selectedOrder.customerName}</p>
                <p className="text-stone-600 font-mono mt-0.5">{selectedOrder.customerPhone || 'No Phone'}</p>
                <p className="text-stone-600 truncate">{selectedOrder.customerEmail}</p>
                {selectedOrder.customerPhone && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openWhatsApp(selectedOrder)}
                      className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </button>
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-black flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                )}
              </div>
              <div>
                <span className="font-bold text-stone-400 uppercase tracking-wider block text-[10px]">Delivery Zone & Address</span>
                <p className="font-bold text-stone-900 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{selectedOrder.zone?.nameAr || selectedOrder.zone?.nameEn || 'Standard Delivery Zone'}</span>
                </p>
                <p className="text-stone-600 mt-0.5">{selectedOrder.addressDetails || 'No street details entered'}</p>
                {selectedOrder.latitude && selectedOrder.longitude && (
                  <a
                    href={`https://maps.google.com/?q=${selectedOrder.latitude},${selectedOrder.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-black underline mt-1.5 inline-flex items-center gap-1 text-[11px]"
                  >
                    <span>Open Location in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-stone-400 mb-2">Purchased Items</h4>
              <div className="border border-stone-100 rounded-xl divide-y divide-stone-100">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-stone-900">{item.productName}</span>
                      <span className="text-stone-400 ml-2 font-mono">x{item.quantity}</span>
                      {item.selectedSize && <span className="ml-2 bg-stone-100 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.selectedSize}</span>}
                    </div>
                    <span className="font-mono font-black text-stone-900">
                      {formatPrice(item.totalPrice || item.unitPrice * item.quantity, currentStore?.currency || 'USD')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Timeline */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-stone-400 mb-3">Lifecycle Timeline & Audit</h4>
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 pl-8">
                {(selectedOrder.timeline && Array.isArray(selectedOrder.timeline) ? selectedOrder.timeline : []).map((tl: any, i: number) => (
                  <div key={i} className="relative text-xs">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white" />
                    <div className="font-bold text-stone-900 uppercase text-[11px] tracking-wider">{tl.status}</div>
                    <div className="text-stone-500 text-[10px]">{new Date(tl.timestamp).toLocaleString()} {tl.updatedBy ? `• By ${tl.updatedBy}` : ''}</div>
                    {tl.note && <div className="text-stone-700 mt-0.5 italic">{tl.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => { setInvoiceOrder(selectedOrder); setSelectedOrder(null); }}
                className="px-4 py-2.5 bg-stone-100 text-stone-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Invoice Print/Export Modal (Mobile Responsive) */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-5 sm:p-8 space-y-5 shadow-2xl border border-stone-100 max-h-[95vh] overflow-y-auto">
            {/* Mobile swipe handle */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-1 mb-2 sm:hidden" />

            <div className="flex justify-between items-center no-print border-b border-stone-100 pb-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Official Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button onClick={() => setInvoiceOrder(null)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border border-stone-200 p-4 sm:p-6 rounded-2xl space-y-5 bg-stone-50/50">
              <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                <div>
                  <h3 className="font-bodoni text-xl sm:text-2xl font-bold text-stone-900">{currentStore?.name || 'Atelier Boutique'}</h3>
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">VAT Reg: EG-9021-39401</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-stone-400">#{invoiceOrder.id.slice(0, 8).toUpperCase()}</span>
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">{new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <p><span className="font-bold text-stone-400">Billed To:</span> {invoiceOrder.customerName}</p>
                <p><span className="font-bold text-stone-400">Phone:</span> {invoiceOrder.customerPhone || 'N/A'}</p>
                <p><span className="font-bold text-stone-400">Destination:</span> {invoiceOrder.addressDetails || 'Standard Delivery'}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[280px]">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-[10px] uppercase font-bold">
                      <th className="py-2 text-left">Item</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {invoiceOrder.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-2 text-stone-900">{item.productName}</td>
                        <td className="py-2 text-center text-stone-500">{item.quantity}</td>
                        <td className="py-2 text-right font-mono font-bold text-stone-900">
                          {formatPrice(item.totalPrice || item.unitPrice * item.quantity, currentStore?.currency || 'USD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-stone-200 pt-3 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-stone-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(Number(invoiceOrder.total) - Number(invoiceOrder.deliveryFee || 0), currentStore?.currency || 'USD')}</span>
                </div>
                {invoiceOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-stone-500">
                    <span>Delivery Fee ({invoiceOrder.zone?.nameEn || 'Standard'})</span>
                    <span>{formatPrice(invoiceOrder.deliveryFee, currentStore?.currency || 'USD')}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-stone-900 border-t border-stone-200 pt-2">
                  <span>Grand Total</span>
                  <span>{formatPrice(invoiceOrder.total, currentStore?.currency || 'USD')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
