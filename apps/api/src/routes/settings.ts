import { Router } from 'express'
import { prisma } from 'database'

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
          name: 'My Store',
          currency: 'USD',
          slug: 'default-store',
        },
      })
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
