import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// GET /api/admin/users  (list all users)
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })

    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    })

    res.json(user)
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ error: 'Failed to update role' })
  }
})

// DELETE /api/admin/users/:id (delete user)
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id
    // Note: In a real app, you'd also delete from Supabase Auth
    await prisma.user.delete({ where: { id: userId } })
    res.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// GET /api/admin/stats  (platform stats)
router.get('/stats', async (req, res) => {
  try {
    const [userCount, productCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
    ])

    res.json({ userCount, productCount, orderCount })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export { router as adminRouter }

