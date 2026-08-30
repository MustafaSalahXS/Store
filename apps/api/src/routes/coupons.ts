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
    
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Coupon code is required' })
    }

    const numValue = Number(discountValue)
    if (isNaN(numValue) || numValue <= 0) {
      return res.status(400).json({ error: 'A valid positive discount value is required' })
    }

    const formattedCode = code.trim().toUpperCase()

    // Check if code exists
    const existing = await prisma.coupon.findUnique({
      where: { code: formattedCode }
    })
    if (existing) {
      return res.status(400).json({ error: `Coupon code '${formattedCode}' already exists` })
    }

    let parsedExpiry: Date | null = null
    if (expiresAt) {
      const d = new Date(expiresAt)
      if (!isNaN(d.getTime())) {
        parsedExpiry = d
      }
    }

    let parsedUsageLimit: number | null = null
    if (usageLimit !== undefined && usageLimit !== null && usageLimit !== '') {
      const lim = Number(usageLimit)
      if (!isNaN(lim) && lim > 0) {
        parsedUsageLimit = Math.floor(lim)
      }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: formattedCode,
        discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
        discountValue: numValue,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        usageLimit: parsedUsageLimit,
        expiresAt: parsedExpiry
      }
    })
    res.status(201).json(coupon)
  } catch (error: any) {
    console.error('Failed to create coupon:', error)
    res.status(500).json({ error: error?.message || 'Failed to create coupon' })
  }
})

// PUT /api/coupons/:id - Update a coupon
router.put('/:id', async (req, res) => {
  try {
    const { code, discountType, discountValue, isActive, usageLimit, expiresAt } = req.body
    
    const formattedCode = (code && typeof code === 'string') ? code.trim().toUpperCase() : undefined

    // Optional: check uniqueness if code changed
    if (formattedCode) {
      const existing = await prisma.coupon.findFirst({
        where: { code: formattedCode, id: { not: req.params.id } }
      })
      if (existing) {
        return res.status(400).json({ error: `Coupon code '${formattedCode}' already exists` })
      }
    }

    let parsedExpiry: Date | null | undefined = undefined
    if (expiresAt !== undefined) {
      if (!expiresAt) {
        parsedExpiry = null
      } else {
        const d = new Date(expiresAt)
        parsedExpiry = !isNaN(d.getTime()) ? d : null
      }
    }

    let parsedUsageLimit: number | null | undefined = undefined
    if (usageLimit !== undefined) {
      if (!usageLimit && usageLimit !== 0) {
        parsedUsageLimit = null
      } else {
        const lim = Number(usageLimit)
        parsedUsageLimit = (!isNaN(lim) && lim > 0) ? Math.floor(lim) : null
      }
    }

    const numValue = discountValue !== undefined ? Number(discountValue) : undefined

    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        ...(formattedCode && { code: formattedCode }),
        ...(discountType && { discountType: discountType === 'fixed' ? 'fixed' : 'percentage' }),
        ...(numValue !== undefined && !isNaN(numValue) && { discountValue: numValue }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(parsedUsageLimit !== undefined && { usageLimit: parsedUsageLimit }),
        ...(parsedExpiry !== undefined && { expiresAt: parsedExpiry })
      }
    })
    res.json(coupon)
  } catch (error: any) {
    console.error('Failed to update coupon:', error)
    res.status(500).json({ error: error?.message || 'Failed to update coupon' })
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




