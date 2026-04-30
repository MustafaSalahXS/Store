import { Router } from 'express'
import { prisma } from 'database'

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

    const cleanUserId = userId === '' ? null : userId

    const order = await prisma.order.create({
      data: {
        userId: cleanUserId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        total,
        paymentMethod: paymentMethod || 'card',
        orderStatus: orderStatus || 'pending',
        paymentStatus: paymentStatus || 'unpaid',
        notes: notes || null,
        items: {
          create: items.map((item: any) => {
            const pId = (item.productId || item.product_id) === '' ? null : (item.productId || item.product_id)
            return {
              productId: pId,
              productName: item.productName || item.product_name,
              quantity: item.quantity,
              unitPrice: item.unitPrice || item.price,
              totalPrice: (item.unitPrice || item.price) * item.quantity,
              customizations: item.customizations || null,
            }
          }),
        },
      },
      include: { items: true },
    })

    res.status(201).json(order)
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body
    const data: any = {}
    if (orderStatus) data.orderStatus = orderStatus
    if (paymentStatus) data.paymentStatus = paymentStatus

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
    })

    res.json(order)
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ error: 'Failed to update order' })
  }
})

export { router as ordersRouter }
