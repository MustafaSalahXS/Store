'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDeliveryByOrder, getDeliveryHistory } from '@/lib/deliveries'
import { Delivery, DeliveryStatusHistory } from '@/lib/deliveries'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, MapPin, Package, CheckCircle2, AlertCircle, Phone, Calendar } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  picking_up: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}

const statusIcons: Record<string, any> = {
  pending: Package,
  assigned: Package,
  picking_up: Package,
  in_transit: MapPin,
  delivered: CheckCircle2,
  failed: AlertCircle
}

const statusSteps = ['pending', 'assigned', 'picking_up', 'in_transit', 'delivered']

export default function DeliveryTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [history, setHistory] = useState<DeliveryStatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDelivery = async () => {
      try {
        const deliveryData = await getDeliveryByOrder(orderId)
        if (!deliveryData) {
          setError('Delivery not found')
          return
        }

        setDelivery(deliveryData)

        // Load status history
        const historyData = await getDeliveryHistory(deliveryData.id)
        setHistory(historyData)
      } catch (err) {
        setError('Failed to load delivery information')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) loadDelivery()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Loading delivery information...</p>
        </div>
      </div>
    )
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Delivery Not Found</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </Card>
      </div>
    )
  }

  const currentStatusIndex = statusSteps.indexOf(delivery.current_status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Track Your Delivery</h1>
        </div>

        {/* Status Overview */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-600 text-sm">Order ID</p>
              <p className="text-2xl font-bold text-slate-900">{delivery.order_id.substring(0, 12)}...</p>
            </div>
            <Badge className={`${statusColors[delivery.current_status]}`}>
              {delivery.current_status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-slate-600 text-sm">Estimated Delivery</p>
              <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(delivery.estimated_delivery).toLocaleDateString()}
              </p>
            </div>
            {delivery.actual_delivery && (
              <div>
                <p className="text-slate-600 text-sm">Delivered</p>
                <p className="text-lg font-semibold text-green-600">
                  {new Date(delivery.actual_delivery).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {delivery.delivery_person_name && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-slate-600 text-sm mb-2">Assigned Delivery Person</p>
              <p className="font-semibold text-slate-900">{delivery.delivery_person_name}</p>
              {delivery.delivery_person_phone && (
                <p className="text-blue-600 flex items-center gap-2 mt-2 hover:underline cursor-pointer">
                  <Phone className="w-4 h-4" />
                  {delivery.delivery_person_phone}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Delivery Timeline */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Delivery Timeline</h2>

          {/* Status Progress */}
          <div className="mb-8">
            <div className="flex justify-between gap-2">
              {statusSteps.map((status, index) => {
                const isCompleted = index <= currentStatusIndex
                const Icon = statusIcons[status]
                return (
                  <div key={status} className="flex-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full mx-auto mb-2 ${
                        isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-center text-slate-600">
                      {status.replace('_', ' ')}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 h-1 bg-slate-200 rounded">
              <div
                className="h-1 bg-blue-600 rounded transition-all"
                style={{
                  width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Status History */}
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600 mt-2" />
                    {index < history.length - 1 && (
                      <div className="w-0.5 h-12 bg-slate-200 my-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-slate-900">
                      {entry.status.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-slate-700 mt-1">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-600">No updates yet. We'll notify you as soon as we have news.</p>
            )}
          </div>
        </Card>

        {/* Delivery Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Delivery Details</h2>

          <div className="space-y-4">
            <div>
              <p className="text-slate-600 text-sm">Recipient</p>
              <p className="font-semibold text-slate-900">{delivery.customer_name}</p>
              <p className="text-slate-600">{delivery.customer_phone}</p>
            </div>

            <div>
              <p className="text-slate-600 text-sm">Delivery Address</p>
              <p className="font-semibold text-slate-900">{delivery.delivery_address}</p>
            </div>

            <div>
              <p className="text-slate-600 text-sm">Pickup Address</p>
              <p className="font-semibold text-slate-900">{delivery.pickup_address}</p>
            </div>

            {delivery.notes && (
              <div>
                <p className="text-slate-600 text-sm">Notes</p>
                <p className="font-semibold text-slate-900">{delivery.notes}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
