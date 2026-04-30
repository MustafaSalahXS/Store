'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import { getStoreOrders, updateOrderStatus, AdminOrder } from '@/lib/admin'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, Eye } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentStore } = useStore()

  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !['super_admin', 'store_admin', 'accountant'].includes(user.role)) {
      router.push('/dashboard')
      return
    }

    if (currentStore) loadOrders()
  }, [user, currentStore, router, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      if (!currentStore) return
      const status = statusFilter === 'all' ? undefined : statusFilter
      const data = await getStoreOrders(currentStore.id, status)
      setOrders(data)
    } catch (err) {
      setError('Failed to load orders')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId)
      const success = await updateOrderStatus(orderId, newStatus)
      if (success) {
        setOrders(prev =>
          prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o)
        )
        setSelectedOrder(prev =>
          prev?.id === orderId ? { ...prev, order_status: newStatus } : prev
        )
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-slate-100 text-slate-800'
  }

  const orderStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
            <p className="text-slate-600">Manage customer orders</p>
          </div>
          <Link href="/admin">
            <Button>Back to Admin</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Alerts */}
        {error && (
          <Card className="mb-4 p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6 flex gap-2 flex-wrap">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card
                    key={order.id}
                    className={`p-4 cursor-pointer hover:shadow transition ${
                      selectedOrder?.id === order.id ? 'ring-2 ring-blue-600' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">Order {order.id.substring(0, 8)}...</p>
                        <p className="text-slate-600 text-sm">{order.customer_name}</p>
                        <p className="text-slate-600 text-xs">{order.customer_email}</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">EGP {order.total}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`${paymentStatusColors[order.payment_status]}`}>
                        Pay: {order.payment_status.toUpperCase()}
                      </Badge>
                      <Badge className={`${orderStatusColors[order.order_status]}`}>
                        {order.order_status.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-slate-600">No orders found</p>
              </Card>
            )}
          </div>

          {/* Order Details Sidebar */}
          {selectedOrder && (
            <Card className="p-6 h-fit">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Order Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-600 text-sm">Order ID</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.id}</p>
                </div>

                <div>
                  <p className="text-slate-600 text-sm">Customer</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.customer_name}</p>
                  <p className="text-slate-600 text-sm">{selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && (
                    <p className="text-slate-600 text-sm">{selectedOrder.customer_phone}</p>
                  )}
                </div>

                <div>
                  <p className="text-slate-600 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900">EGP {selectedOrder.total}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-slate-600 text-sm mb-2">Payment Status</p>
                  <Badge className={`${paymentStatusColors[selectedOrder.payment_status]}`}>
                    {selectedOrder.payment_status.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="text-slate-600 text-sm mb-2">Order Status</p>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                    disabled={updatingId === selectedOrder.id}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <p className="text-slate-600 text-sm">Payment Method</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.payment_method.toUpperCase()}</p>
                </div>

                <div>
                  <p className="text-slate-600 text-sm">Ordered</p>
                  <p className="font-semibold text-slate-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
