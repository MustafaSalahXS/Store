'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Order } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Truck, 
  Package, 
  RefreshCw, 
  MapPin, 
  DollarSign, 
  Clock, 
  ArrowLeft 
} from 'lucide-react'
import Link from 'next/link'

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [dispatchLocation, setDispatchLocation] = useState('')
  const [showLocationInput, setShowLocationInput] = useState(false)

  useEffect(() => {
    if (!user) return
    const allowed = ['admin', 'super_admin', 'store_admin', 'accountant']
    if (!allowed.includes(user.role)) {
      router.push('/dashboard')
      return
    }
    loadOrders()
  }, [user, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.orders.list()
      const list = Array.isArray(data) ? data : []
      const filtered = statusFilter === 'all' 
        ? list 
        : list.filter((o: Order) => o.orderStatus === statusFilter)
      setOrders(filtered)
      if (selectedOrder) {
        const refreshed = list.find((o: Order) => o.id === selectedOrder.id)
        if (refreshed) setSelectedOrder(refreshed)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load orders')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (
    orderId: string, 
    updates: { orderStatus?: string; paymentStatus?: string; location?: string }
  ) => {
    try {
      setActionLoadingId(orderId)
      const updated = await api.orders.updateStatus(orderId, updates)
      if (updated) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o))
        setSelectedOrder(prev => prev?.id === orderId ? { ...prev, ...updated } : prev)
        setShowLocationInput(false)
      }
    } catch (err: any) {
      alert(`Update failed: ${err?.message || 'Unknown error'}`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const paymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500 text-white">PAID</Badge>
      case 'pending_verification':
        return <Badge className="bg-amber-500 text-white">PENDING REVIEW</Badge>
      case 'unpaid':
      default:
        return <Badge className="bg-rose-500 text-white">UNPAID</Badge>
    }
  }

  const orderStatusBadge = (status?: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-emerald-600 text-white">DELIVERED</Badge>
      case 'shipped':
        return <Badge className="bg-sky-600 text-white">SHIPPED</Badge>
      case 'approved':
        return <Badge className="bg-indigo-600 text-white">APPROVED</Badge>
      case 'processing':
        return <Badge className="bg-purple-600 text-white">PROCESSING</Badge>
      case 'cancelled':
        return <Badge className="bg-slate-600 text-white">CANCELLED</Badge>
      case 'pending':
      default:
        return <Badge className="bg-amber-500 text-white">PENDING APPROVAL</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 shrink-0 text-xs h-9">
                <ArrowLeft className="w-4 h-4" /> Admin Portal
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-black uppercase text-slate-900 tracking-tight truncate">Order Verification</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">Approve payments, manage orders, and update live courier tracking</p>
            </div>
          </div>

          <Button 
            onClick={loadOrders} 
            variant="outline" 
            size="sm" 
            disabled={loading} 
            className="flex items-center gap-2 self-end sm:self-auto text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 sm:space-y-6">
        {error && (
          <Card className="p-4 bg-rose-50 border-rose-200 text-rose-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </Card>
        )}

        {/* Status Filters */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-1 sm:flex-wrap">
          {['all', 'pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition shrink-0 ${
                statusFilter === st 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Orders...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders Feed */}
            <div className="lg:col-span-2 space-y-4">
              {orders.length === 0 ? (
                <Card className="p-12 text-center text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-sm">No orders matching filter</p>
                </Card>
              ) : (
                orders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id
                  return (
                    <Card
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`p-5 cursor-pointer transition-all hover:shadow-lg ${
                        isSelected ? 'ring-2 ring-slate-900 bg-slate-50/50' : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-black text-slate-900">
                              #{ord.id.slice(-8).toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-bold text-slate-600">
                              {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 mt-1">{ord.customerName}</p>
                          <p className="text-xs text-slate-500">{ord.customerEmail} {ord.customerPhone ? `• ${ord.customerPhone}` : ''}</p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-lg font-black text-slate-900">EGP {Number(ord.total).toFixed(2)}</p>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Method: {ord.paymentMethod?.toUpperCase() || 'CARD'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <div className="flex items-center gap-2">
                          {paymentStatusBadge(ord.paymentStatus)}
                          {orderStatusBadge(ord.orderStatus)}
                        </div>

                        {ord.deliveries?.[0]?.deliveryNotes && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 max-w-xs truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{ord.deliveries[0].deliveryNotes}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })
              )}
            </div>

            {/* Selected Order Actions & Live Control */}
            <div className="lg:col-span-1">
              {selectedOrder ? (
                <Card className="p-6 sticky top-24 bg-white shadow-xl space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-mono font-black text-slate-900">
                        #{selectedOrder.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-xs text-slate-500">Order Management</p>
                    </div>
                    {paymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Customer</p>
                    <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                    <p className="text-slate-600">{selectedOrder.customerEmail}</p>
                    {selectedOrder.customerPhone && (
                      <p className="text-slate-600">{selectedOrder.customerPhone}</p>
                    )}
                  </div>

                  {/* Quick Verification Actions */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">One-Click Admin Controls</p>

                    {/* Step 1: Approve Payment & Order */}
                    {selectedOrder.paymentStatus !== 'paid' && (
                      <Button
                        onClick={() => handleUpdate(selectedOrder.id, { paymentStatus: 'paid', orderStatus: 'approved' })}
                        disabled={actionLoadingId === selectedOrder.id}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Payment & Order
                      </Button>
                    )}

                    {/* Step 2: Mark Processing */}
                    {selectedOrder.orderStatus === 'approved' && (
                      <Button
                        onClick={() => handleUpdate(selectedOrder.id, { orderStatus: 'processing', location: 'Staged in Packaging Bay' })}
                        disabled={actionLoadingId === selectedOrder.id}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" /> Start Warehouse Packaging
                      </Button>
                    )}

                    {/* Step 3: Dispatch & Set Location */}
                    {['approved', 'processing'].includes(selectedOrder.orderStatus) && (
                      <div className="space-y-2">
                        {!showLocationInput ? (
                          <Button
                            onClick={() => {
                              setShowLocationInput(true)
                              setDispatchLocation('Dispatched from Main Hub — In Transit')
                            }}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-2"
                          >
                            <Truck className="w-4 h-4" /> Dispatch & Set Live Location
                          </Button>
                        ) : (
                          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                            <label className="text-[10px] font-bold uppercase text-sky-800">Current Checkpoint / Location</label>
                            <input
                              type="text"
                              value={dispatchLocation}
                              onChange={(e) => setDispatchLocation(e.target.value)}
                              placeholder="e.g. Cairo Central Sorting Facility"
                              className="w-full text-xs p-2 rounded-lg border border-sky-300 bg-white"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdate(selectedOrder.id, { orderStatus: 'shipped', location: dispatchLocation })}
                                disabled={actionLoadingId === selectedOrder.id}
                                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs"
                              >
                                Confirm Dispatch
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowLocationInput(false)}
                                className="text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Mark Delivered */}
                    {selectedOrder.orderStatus === 'shipped' && (
                      <Button
                        onClick={() => handleUpdate(selectedOrder.id, { orderStatus: 'delivered', location: 'Delivered to recipient address' })}
                        disabled={actionLoadingId === selectedOrder.id}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark as Successfully Delivered
                      </Button>
                    )}
                  </div>

                  {/* Manual Status Dropdowns */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Manual Adjustments</p>

                    <div>
                      <label className="text-slate-500 block mb-1">Order Status</label>
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => handleUpdate(selectedOrder.id, { orderStatus: e.target.value })}
                        disabled={actionLoadingId === selectedOrder.id}
                        className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 text-xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-1">Payment Status</label>
                      <select
                        value={selectedOrder.paymentStatus}
                        onChange={(e) => handleUpdate(selectedOrder.id, { paymentStatus: e.target.value })}
                        disabled={actionLoadingId === selectedOrder.id}
                        className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 text-xs"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="pending_verification">Pending Verification</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Items */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Purchased Items</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {selectedOrder.items.map((it, idx) => (
                          <div key={it.id || idx} className="flex justify-between text-xs py-1 text-slate-700">
                            <span>{it.quantity}x {it.productName}</span>
                            <span className="font-mono font-bold">EGP {Number(it.totalPrice || it.unitPrice * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-8 text-center text-slate-400 sticky top-24">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-wider">Select an order to view controls</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
