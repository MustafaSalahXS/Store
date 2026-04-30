'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/header'
import { getDelivery, getDeliveryHistory, Delivery, DeliveryStatusHistory } from '@/lib/deliveries'
import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Package, Truck, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react'

const STATUS_CONFIG = {
  pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Package, label: 'Pending Assignment' },
  assigned: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Truck, label: 'Assigned' },
  picking_up: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Truck, label: 'Picking Up' },
  in_transit: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Truck, label: 'In Transit' },
  delivered: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, label: 'Delivered' },
  failed: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle, label: 'Failed' },
}

export default function DeliveryTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const deliveryId = params.id as string

  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [history, setHistory] = useState<DeliveryStatusHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDelivery = async () => {
      try {
        const result = await getDelivery(deliveryId)
        if (!result) {
          setError('Delivery not found')
        } else {
          setDelivery(result)
          const historyData = await getDeliveryHistory(deliveryId)
          setHistory(historyData)
        }
      } catch (err) {
        setError('Failed to load delivery information')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDelivery()
  }, [deliveryId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-12 text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading delivery information...</p>
        </div>
      </div>
    )
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-12">
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-destructive">{error || 'Delivery not found'}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:underline font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Go Back
          </motion.button>
        </div>
      </div>
    )
  }

  const config = STATUS_CONFIG[delivery.current_status]
  const StatusIcon = config.icon

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="section-container py-12">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:underline font-semibold mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Delivery Tracking</h1>
              <p className="text-muted-foreground mt-2">Order {delivery.order_id.slice(0, 8)}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${config.bg}`}>
              <StatusIcon className={`w-6 h-6 ${config.color}`} />
              <span className={`font-bold text-lg ${config.color}`}>{config.label}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg border border-border p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-8">Delivery Progress</h2>

              {history.length > 0 ? (
                <div className="space-y-6">
                  {history.map((item, idx) => {
                    const itemConfig = STATUS_CONFIG[item.status]
                    const ItemIcon = itemConfig.icon
                    const isLast = idx === history.length - 1

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative"
                      >
                        <div className="flex gap-4">
                          {/* Timeline Line */}
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${itemConfig.bg}`}>
                              <ItemIcon className={`w-6 h-6 ${itemConfig.color}`} />
                            </div>
                            {!isLast && (
                              <div className="w-1 h-12 bg-secondary mt-2" />
                            )}
                          </div>

                          {/* Status Info */}
                          <div className="pb-6">
                            <h3 className={`font-bold text-lg ${itemConfig.color}`}>
                              {itemConfig.label}
                            </h3>
                            <p className="text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                            {item.notes && (
                              <p className="text-foreground mt-2">{item.notes}</p>
                            )}
                            {item.location && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No tracking information available yet.</p>
              )}
            </motion.div>

            {/* Delivery Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-lg border border-border p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Delivery Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pickup Address */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Pickup Address</h3>
                  </div>
                  <p className="text-muted-foreground">{delivery.pickup_address}</p>
                </div>

                {/* Delivery Address */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Delivery Address</h3>
                  </div>
                  <p className="text-muted-foreground">{delivery.delivery_address}</p>
                </div>

                {/* Estimated Delivery */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Estimated Delivery</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {new Date(delivery.estimated_delivery).toLocaleDateString()} 
                    {new Date(delivery.estimated_delivery).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                {/* Delivery Type */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Delivery Type</h3>
                  </div>
                  <p className="text-muted-foreground capitalize">
                    {delivery.delivery_type === 'standard' && 'Standard Delivery'}
                    {delivery.delivery_type === 'express' && 'Express Delivery'}
                    {delivery.delivery_type === 'overnight' && 'Overnight Delivery'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Delivery Person Info */}
            {delivery.delivery_person_name && (
              <motion.div
                className="bg-card rounded-lg border border-border p-6"
              >
                <h3 className="font-bold text-lg text-foreground mb-4">Delivery Person</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold text-foreground">{delivery.delivery_person_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <a
                      href={`tel:${delivery.delivery_person_phone}`}
                      className="font-semibold text-primary hover:underline flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      {delivery.delivery_person_phone}
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Customer Info */}
            <motion.div
              className="bg-card rounded-lg border border-border p-6"
            >
              <h3 className="font-bold text-lg text-foreground mb-4">Customer</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold text-foreground">{delivery.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${delivery.customer_phone}`}
                    className="font-semibold text-primary hover:underline flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {delivery.customer_phone}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Notes */}
            {delivery.notes && (
              <motion.div
                className="bg-card rounded-lg border border-border p-6"
              >
                <h3 className="font-bold text-lg text-foreground mb-3">Notes</h3>
                <p className="text-muted-foreground">{delivery.notes}</p>
              </motion.div>
            )}

            {/* Proof */}
            {(delivery.photo_proof || delivery.signature_proof) && (
              <motion.div
                className="bg-card rounded-lg border border-border p-6"
              >
                <h3 className="font-bold text-lg text-foreground mb-4">Proof of Delivery</h3>
                {delivery.photo_proof && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Photo</p>
                    <img
                      src={delivery.photo_proof}
                      alt="Delivery photo"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
                {delivery.signature_proof && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Signature</p>
                    <img
                      src={delivery.signature_proof}
                      alt="Signature"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
