import { Router } from 'express'
import { prisma } from 'database'

const router = Router()

// GET /api/banners
router.get('/', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { position: 'asc' }
    })
    res.json(banners)
  } catch (error) {
    console.error('Get banners error:', error)
    res.status(500).json({ error: 'Failed to fetch banners' })
  }
})

// POST /api/banners
router.post('/', async (req, res) => {
  try {
    const banner = await prisma.banner.create({
      data: req.body
    })
    res.json(banner)
  } catch (error) {
    console.error('Create banner error:', error)
    res.status(500).json({ error: 'Failed to create banner' })
  }
})

// PUT /api/banners/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const banner = await prisma.banner.update({
      where: { id },
      data: req.body
    })
    res.json(banner)
  } catch (error) {
    console.error('Update banner error:', error)
    res.status(500).json({ error: 'Failed to update banner' })
  }
})

// DELETE /api/banners/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.banner.delete({
      where: { id }
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Delete banner error:', error)
    res.status(500).json({ error: 'Failed to delete banner' })
  }
})

export { router as bannersRouter }
