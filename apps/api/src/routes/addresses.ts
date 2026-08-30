// @ts-nocheck
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// GET /api/addresses?userId=...
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId || typeof userId !== 'string') {
      return res.json([])
    }

    const addresses = await prisma.userAddress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    res.json(addresses)
  } catch (error) {
    console.error('Error fetching user addresses:', error)
    res.status(500).json({ error: 'Failed to fetch addresses' })
  }
})

// POST /api/addresses
router.post('/', async (req, res) => {
  try {
    const { userId, title, address, apartment, city, zoneName, latitude, longitude, isDefault } = req.body

    if (!userId || !address) {
      return res.status(400).json({ error: 'User ID and address are required' })
    }

    // If default, unset previous defaults
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    const newAddress = await prisma.userAddress.create({
      data: {
        userId,
        title: title ? String(title).trim() : 'Home',
        address: String(address).trim(),
        apartment: apartment ? String(apartment).trim() : null,
        city: city ? String(city).trim() : 'Cairo',
        zoneName: zoneName ? String(zoneName).trim() : null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        isDefault: Boolean(isDefault),
      },
    })

    res.status(201).json(newAddress)
  } catch (error) {
    console.error('Error saving user address:', error)
    res.status(500).json({ error: 'Failed to save address' })
  }
})

// DELETE /api/addresses/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.userAddress.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting address:', error)
    res.status(500).json({ error: 'Failed to delete address' })
  }
})

export default router
