// @ts-nocheck
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// GET /api/coupons - List all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(coupons)
  } catch (error) {
    console.error('Failed to fetch coupons:', error)
    res.status(500).json({ error: 'Failed to fetch coupons' })
  }
})

// POST /api/coupons/validate - Validate a coupon code
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' })
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: 'This coupon is no longer active' })
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'This coupon has reached its usage limit' })
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'This coupon has expired' })
    }

    res.json(coupon)
  } catch (error) {
    console.error('Failed to validate coupon:', error)
    res.status(500).json({ error: 'Failed to validate coupon' })
  }
})

// POST /api/coupons - Create a new coupon
router.post('/', async (req, res) => {
  try {
    const { code, discountType, discountValue, isActive, usageLimit, expiresAt } = req.body
    
    // Check if code exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        isActive: isActive ?? true,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })
    res.status(201).json(coupon)
  } catch (error) {
    console.error('Failed to create coupon:', error)
    res.status(500).json({ error: 'Failed to create coupon' })
  }
})

// PUT /api/coupons/:id - Update a coupon
router.put('/:id', async (req, res) => {
  try {
    const { code, discountType, discountValue, isActive, usageLimit, expiresAt } = req.body
    
    // Optional: check uniqueness if code changed
    if (code) {
      const existing = await prisma.coupon.findFirst({
        where: { code: code.toUpperCase(), id: { not: req.params.id } }
      })
      if (existing) {
        return res.status(400).json({ error: 'Coupon code already exists' })
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(isActive !== undefined && { isActive }),
        usageLimit: usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined
      }
    })
    res.json(coupon)
  } catch (error) {
    console.error('Failed to update coupon:', error)
    res.status(500).json({ error: 'Failed to update coupon' })
  }
})

// DELETE /api/coupons/:id - Delete a coupon
router.delete('/:id', async (req, res) => {
  try {
    await prisma.coupon.delete({
      where: { id: req.params.id }
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Failed to delete coupon:', error)
    res.status(500).json({ error: 'Failed to delete coupon' })
  }
})

export default router




