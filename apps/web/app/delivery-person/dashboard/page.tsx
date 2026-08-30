'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/header'
import { useAuth } from '@/lib/auth-context'
import { getDeliveryPersonAssignments, updateDeliveryStatus, Delivery } from '@/lib/deliveries'
import { motion } from 'framer-motion'
import { Package, Truck, MapPin, Phone, Check, ChevronRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const STATUS_CONFIG = {
  pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
  assigned: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Assigned' },
  picking_up: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Picking Up' },
  in_transit: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'In Transit' },
  delivered: { color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
  failed: { color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' },
}

export default function DeliveryPersonDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [assignments, setAssignments] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    const loadAssignments = async () => {
      if (!user || (user.role as string) !== 'delivery_person') {
        setIsLoading(false)
        return
      }

      try {
        const result = await getDeliveryPersonAssignments(user.id)
        setAssignments(result)
        if (result.length > 0) {
          setSelectedDelivery(result[0])
        }
      } catch (error) {
        console.error('Failed to load assignments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAssignments()
  }, [user])

  const handleStatusUpdate = async (deliveryId: string, newStatus: any) => {
    setUpdatingStatus(deliveryId)
    try {
      const result = await updateDeliveryStatus(deliveryId, newStatus)
      if (result.success) {
        setAssignments(prev =>
          prev.map(d =>
            d.id === deliveryId ? { ...d, current_status: newStatus } : d
          )
        )
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-12 text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role as string) !== 'delivery_person') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">This page is for delivery personnel only</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  const activeDeliveries = assignments.filter(a =>
    ['assigned', 'picking_up', 'in_transit'].includes(a.current_status)
  )
  const completedDeliveries = assignments.filter(a => a.current_status === 'delivered')

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="section-container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Delivery Dashboard</h1>
          <p className="text-muted-foreground">Manage your deliveries and track progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg border border-border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Deliveries</p>
                <p className="text-3xl font-bold text-foreground">{activeDeliveries.length}</p>
              </div>
              <Truck className="w-10 h-10 text-primary opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-lg border border-border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-3xl font-bold text-foreground">
                  {completedDeliveries.filter(d =>
                    new Date(d.actual_delivery || '').toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Check className="w-10 h-10 text-accent opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-lg border border-border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Completed</p>
                <p className="text-3xl font-bold text-foreground">{completedDeliveries.length}</p>
              </div>
              <Package className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </motion.div>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Assignments Yet</h2>
            <p className="text-muted-foreground">You don&apos;t have any deliveries assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Delivery List */}
            <div className="lg:col-span-2 space-y-4">
              {activeDeliveries.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Active Deliveries</h2>
                  {activeDeliveries.map((delivery, idx) => {
                    const config = STATUS_CONFIG[delivery.current_status]
                    return (
                      <motion.button
                        key={delivery.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedDelivery(delivery)}
                        className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                          selectedDelivery?.id === delivery.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-primary'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-foreground">
                              {delivery.customer_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Order {delivery.order_id.slice(0, 8)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{delivery.delivery_address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{delivery.customer_phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end mt-3 text-primary">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {completedDeliveries.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Completed</h2>
                  {completedDeliveries.slice(0, 3).map((delivery, idx) => (
                    <motion.div
                      key={delivery.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (activeDeliveries.length + idx) * 0.1 }}
                      className="p-6 rounded-lg border border-border bg-card mb-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{delivery.customer_name}</h3>
                          <p className="text-sm text-muted-foreground">{delivery.delivery_address}</p>
                        </div>
                        <Check className="w-5 h-5 text-accent" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Details */}
            {selectedDelivery && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-lg border border-border p-6 h-fit sticky top-24"
              >
                <h3 className="text-xl font-bold text-foreground mb-6">Current Delivery</h3>

                {/* Customer */}
                <div className="mb-6 pb-6 border-b border-border">
                  <p className="text-xs text-muted-foreground uppercase mb-2">Customer</p>
                  <p className="font-semibold text-foreground">{selectedDelivery.customer_name}</p>
                  <a
                    href={`tel:${selectedDelivery.customer_phone}`}
                    className="text-primary hover:underline text-sm flex items-center gap-1 mt-2"
                  >
                    <Phone className="w-4 h-4" />
                    {selectedDelivery.customer_phone}
                  </a>
                </div>

                {/* Delivery Address */}
                <div className="mb-6 pb-6 border-b border-border">
                  <p className="text-xs text-muted-foreground uppercase mb-2">Delivery Address</p>
                  <p className="text-foreground">{selectedDelivery.delivery_address}</p>
                </div>

                {/* Status Update */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase mb-3">Update Status</p>
                  {['picking_up', 'in_transit', 'delivered'].map((status) => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusUpdate(selectedDelivery.id, status)}
                      disabled={
                        updatingStatus === selectedDelivery.id ||
                        ['delivered', 'failed'].includes(selectedDelivery.current_status)
                      }
                      className="w-full px-4 py-3 bg-secondary text-foreground rounded-lg font-semibold hover:opacity-80 disabled:opacity-50 transition-opacity"
                    >
                      {status === 'picking_up' && 'Picking Up'}
                      {status === 'in_transit' && 'In Transit'}
                      {status === 'delivered' && 'Mark Delivered'}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
