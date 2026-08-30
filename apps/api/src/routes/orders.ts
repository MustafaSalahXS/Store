// @ts-nocheck
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { createClient } from '@supabase/supabase-js'

const router = Router()

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const { userId, status, limit = '50', offset = '0' } = req.query

    const where: any = {}
    if (userId) where.userId = userId as string
    if (status) where.orderStatus = status as string

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    })

    res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { 
      userId, 
      customerName, 
      customerEmail, 
      customerPhone, 
      items, 
      total, 
      paymentMethod,
      notes,
      orderStatus,
      paymentStatus
    } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' })
    }

    // Resolve userId safely so foreign key mismatches never crash order creation
    let validUserId: string | null = null
    const cleanUserId = userId === '' || !userId ? null : String(userId).trim()

    if (cleanUserId) {
      const existingUser = await prisma.user.findUnique({ where: { id: cleanUserId } })
      if (existingUser) {
        validUserId = existingUser.id
      } else {
        // Attempt to auto-sync user from Supabase Auth if they exist there
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
          if (supabaseUrl && serviceRoleKey) {
            const sb = createClient(supabaseUrl, serviceRoleKey)
            const { data: authData } = await sb.auth.admin.getUserById(cleanUserId)
            if (authData?.user) {
              const name = authData.user.user_metadata?.name || customerName || 'Customer'
              const role = (authData.user.user_metadata?.role as string) || (authData.user.email?.includes('admin') ? 'admin' : 'customer')
              const newUser = await prisma.user.create({
                data: {
                  id: authData.user.id,
                  email: authData.user.email || customerEmail || '',
                  name,
                  role,
                  phone: authData.user.phone || customerPhone || null,
                  isActive: true,
                },
              })
              validUserId = newUser.id
            }
          }
        } catch (syncErr) {
          console.warn('Could not auto-provision user from Supabase for order:', syncErr)
          // Fall back to null so order creation NEVER fails due to foreign key
          validUserId = null
        }
      }
    }

    // Validate and format items
    const orderItemsData = []
    for (const item of items) {
      const pId = (item.productId || item.product_id) === '' ? null : (item.productId || item.product_id)
      
      if (!pId) {
        return res.status(400).json({ error: 'Every item in the order must have a valid productId.' })
      }

      const productExists = await prisma.product.findUnique({ where: { id: pId } })
      if (!productExists) {
        return res.status(400).json({
          error: `Product "${item.productName || item.product_name || pId}" is no longer available.`
        })
      }

      const unitPrice = Number(item.unitPrice ?? item.price ?? 0)
      const quantity = Number(item.quantity || 1)

      orderItemsData.push({
        productId: pId,
        productName: item.productName || item.product_name || productExists.name,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        selectedSize: item.selectedSize || item.size || null,
        customizations: item.customizations || null,
      })
    }

    // Compute COGS
    let calculatedCogs = 0
    for (const item of items) {
      const pId = item.productId || item.product_id
      if (pId) {
        const p = await prisma.product.findUnique({ where: { id: pId } })
        if (p && p.cost) {
          calculatedCogs += Number(p.cost) * Number(item.quantity || 1)
        }
      }
    }

    const {
      zoneId,
      deliveryFee,
      taxRate,
      latitude,
      longitude,
      addressDetails
    } = req.body

    const initialTimeline = [
      {
        timestamp: new Date().toISOString(),
        status: orderStatus || 'pending',
        note: 'Order submitted by customer',
        updatedBy: 'Customer'
      }
    ]

    const order = await prisma.order.create({
      data: {
        userId: validUserId,
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || null,
        total: Number(total || 0),
        paymentMethod: paymentMethod || 'card',
        orderStatus: orderStatus || 'pending',
        paymentStatus: paymentStatus || 'unpaid',
        notes: notes || null,
        zoneId: zoneId || null,
        deliveryFee: Number(deliveryFee || 0),
        taxRate: Number(taxRate || 0),
        cogsTotal: calculatedCogs,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        addressDetails: addressDetails ? String(addressDetails) : null,
        timeline: initialTimeline,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true, zone: true },
    })

    // Automatically initialize delivery tracking record
    try {
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          currentStatus: orderStatus === 'shipped' ? 'in_transit' : 'pending',
          trackingNumber: `TRK-${order.id.slice(0, 8).toUpperCase()}`,
          deliveryNotes: 'Order received at central intake. Awaiting payment & order approval.',
        },
      })
    } catch (deliveryErr) {
      console.warn('Could not auto-create delivery record:', deliveryErr)
    }

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        deliveries: {
          include: {
            deliveryPerson: { select: { id: true, name: true, phone: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
      },
    })

    res.status(201).json(fullOrder || order)
  } catch (error: any) {
    console.error('Create order error:', error)
    res.status(500).json({ 
      error: error?.message || 'Failed to create order' 
    })
  }
})

// GET /api/orders/financial-monthly
router.get('/financial-monthly', async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { orderStatus: 'approved' },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    const expenses = await prisma.expense.findMany({
      orderBy: { paidAt: 'desc' },
    })

    const monthlyMap: Record<string, {
      month: string
      grossRevenue: number
      cogsTotal: number
      expensesTotal: number
      netProfit: number
      profitMargin: number
      orderCount: number
    }> = {}

    for (const o of orders) {
      const d = new Date(o.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          month: key,
          grossRevenue: 0,
          cogsTotal: 0,
          expensesTotal: 0,
          netProfit: 0,
          profitMargin: 0,
          orderCount: 0,
        }
      }
      const rev = Number(o.total || 0)
      const cogs = Number(o.cogsTotal || 0)
      monthlyMap[key].grossRevenue += !isNaN(rev) ? rev : 0
      monthlyMap[key].cogsTotal += !isNaN(cogs) ? cogs : 0
      monthlyMap[key].orderCount += 1
    }

    for (const exp of expenses) {
      const d = new Date(exp.paidAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          month: key,
          grossRevenue: 0,
          cogsTotal: 0,
          expensesTotal: 0,
          netProfit: 0,
          profitMargin: 0,
          orderCount: 0,
        }
      }
      monthlyMap[key].expensesTotal += Number(exp.amount || 0)
    }

    const results = Object.values(monthlyMap).map(m => {
      const net = m.grossRevenue - m.cogsTotal - m.expensesTotal
      const margin = m.grossRevenue > 0 ? (net / m.grossRevenue) * 100 : 0
      return {
        ...m,
        netProfit: Number(net.toFixed(2)),
        profitMargin: Number(margin.toFixed(1)),
      }
    }).sort((a, b) => b.month.localeCompare(a.month))

    res.json(results)
  } catch (error: any) {
    console.error('Error fetching monthly financials:', error)
    res.status(500).json({ error: 'Failed to fetch monthly financial report' })
  }
})

// GET /api/orders/:id  (real-time order & shipment tracking)
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        deliveries: {
          include: {
            deliveryPerson: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (error: any) {
    console.error('Get order by ID error:', error)
    res.status(500).json({ error: error?.message || 'Failed to fetch order details' })
  }
})

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { orderStatus, paymentStatus, location, trackingNumber, deliveryStatus } = req.body
    const data: any = {}
    if (orderStatus) data.orderStatus = orderStatus
    if (paymentStatus) data.paymentStatus = paymentStatus

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: { deliveries: true },
    })

    // Update or create linked delivery checkpoint if provided
    if (location || trackingNumber || deliveryStatus || orderStatus) {
      const activeDelivery = order.deliveries?.[0]
      const deliveryUpdate: any = {}
      if (location) deliveryUpdate.deliveryNotes = location
      if (trackingNumber) deliveryUpdate.trackingNumber = trackingNumber
      if (deliveryStatus) deliveryUpdate.currentStatus = deliveryStatus
      else if (orderStatus === 'shipped') deliveryUpdate.currentStatus = 'in_transit'
      else if (orderStatus === 'delivered') {
        deliveryUpdate.currentStatus = 'delivered'
        deliveryUpdate.deliveredAt = new Date()
      } else if (orderStatus === 'approved') {
        deliveryUpdate.currentStatus = 'picking_up'
        if (!location) deliveryUpdate.deliveryNotes = 'Payment approved. Order is being packaged at central facility.'
      }

      if (activeDelivery) {
        await prisma.delivery.update({
          where: { id: activeDelivery.id },
          data: deliveryUpdate,
        })
      } else {
        await prisma.delivery.create({
          data: {
            orderId: order.id,
            currentStatus: deliveryUpdate.currentStatus || 'pending',
            trackingNumber: trackingNumber || `TRK-${order.id.slice(0, 8).toUpperCase()}`,
            deliveryNotes: location || 'Order approved and awaiting dispatch.',
          },
        })
      }
    }

    const updated = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        deliveries: {
          include: {
            deliveryPerson: { select: { id: true, name: true, phone: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
      },
    })

    res.json(updated || order)
  } catch (error: any) {
    console.error('Update order status error:', error)
    res.status(500).json({ error: error?.message || 'Failed to update order' })
  }
})

// PATCH /api/orders/:id/status-and-delivery
router.patch('/:id/status-and-delivery', async (req, res) => {
  try {
    const { id } = req.params
    const { orderStatus, assignedDriverId, notes, trackingNumber } = req.body

    const existingOrder = await prisma.order.findUnique({ where: { id } })
    if (!existingOrder) return res.status(404).json({ error: 'Order not found' })

    const currentTimeline = Array.isArray(existingOrder.timeline) ? existingOrder.timeline : []
    const updatedTimeline = [
      ...currentTimeline,
      {
        timestamp: new Date().toISOString(),
        status: orderStatus || existingOrder.orderStatus,
        driverId: assignedDriverId || existingOrder.assignedDriverId,
        note: notes || `Order status updated to ${orderStatus || existingOrder.orderStatus}`,
        updatedBy: 'Admin',
      },
    ]

    const data: any = {
      timeline: updatedTimeline,
    }
    if (orderStatus) data.orderStatus = orderStatus
    if (assignedDriverId !== undefined) data.assignedDriverId = assignedDriverId || null

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: {
        items: true,
        zone: true,
        deliveries: true,
      },
    })

    // Update active delivery record
    if (assignedDriverId || orderStatus || trackingNumber) {
      const activeDelivery = updated.deliveries?.[0]
      const deliveryUpdate: any = {}
      if (assignedDriverId) deliveryUpdate.deliveryPersonId = assignedDriverId
      if (trackingNumber) deliveryUpdate.trackingNumber = trackingNumber
      if (orderStatus === 'shipped') deliveryUpdate.currentStatus = 'in_transit'
      else if (orderStatus === 'delivered') {
        deliveryUpdate.currentStatus = 'delivered'
        deliveryUpdate.deliveredAt = new Date()
      } else if (orderStatus === 'out_for_delivery') {
        deliveryUpdate.currentStatus = 'out_for_delivery'
      }

      if (activeDelivery) {
        await prisma.delivery.update({
          where: { id: activeDelivery.id },
          data: deliveryUpdate,
        })
      } else {
        await prisma.delivery.create({
          data: {
            orderId: updated.id,
            deliveryPersonId: assignedDriverId || null,
            trackingNumber: trackingNumber || `TRK-${updated.id.slice(0, 8).toUpperCase()}`,
            currentStatus: deliveryUpdate.currentStatus || 'pending',
            deliveryNotes: notes || 'Delivery assigned.',
          },
        })
      }
    }

    res.json(updated)
  } catch (error: any) {
    console.error('Error updating status and delivery:', error)
    res.status(500).json({ error: 'Failed to update order status and delivery' })
  }
})

export { router as ordersRouter }




