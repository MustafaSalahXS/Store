// @ts-nocheck
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    // Return the first (and only) settings record
    let settings = await prisma.storeSettings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.storeSettings.create({
        data: {
          name: 'DigitalStoreEG',
          currency: 'EGP',
          slug: 'default-store',
          logoUrl: '/Digital.png',
          faviconUrl: '/Digital.png',
        },
      })
    } else {
      if (!settings.logoUrl) settings.logoUrl = '/Digital.png'
      if (!settings.faviconUrl) settings.faviconUrl = '/Digital.png'
    }
    
    res.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const settings = await prisma.storeSettings.findFirst()
    if (!settings) return res.status(404).json({ error: 'Settings not found' })

    const { id, updatedAt, ...updateData } = req.body

    const updated = await prisma.storeSettings.update({
      where: { id: settings.id },
      data: updateData,
    })

    res.json(updated)
  } catch (error: any) {
    console.error('Update settings error:', error)
    res.status(500).json({ error: error.message || 'Failed to update settings' })
  }
})

export { router as settingsRouter }




