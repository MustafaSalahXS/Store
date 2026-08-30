// @ts-nocheck
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// GET /api/expenses - List expenses with filters
router.get('/', async (req, res) => {
  try {
    const { month, category, search } = req.query
    const where: any = {}

    if (category && category !== 'all') {
      where.category = String(category)
    }

    if (month && typeof month === 'string') {
      // month format: YYYY-MM
      const [yearStr, monthStr] = month.split('-')
      const year = parseInt(yearStr)
      const m = parseInt(monthStr) - 1
      const startDate = new Date(Date.UTC(year, m, 1, 0, 0, 0))
      const endDate = new Date(Date.UTC(year, m + 1, 0, 23, 59, 59, 999))
      where.paidAt = { gte: startDate, lte: endDate }
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ]
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { paidAt: 'desc' },
    })

    res.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({ error: 'Failed to fetch expenses' })
  }
})

// GET /api/expenses/monthly-summary - Aggregated summary per month
router.get('/monthly-summary', async (_req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { paidAt: 'desc' },
    })

    const summaryMap: Record<string, { month: string; total: number; categories: Record<string, number>; count: number }> = {}

    for (const exp of expenses) {
      const date = new Date(exp.paidAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!summaryMap[monthKey]) {
        summaryMap[monthKey] = {
          month: monthKey,
          total: 0,
          categories: {},
          count: 0,
        }
      }

      const amount = Number(exp.amount) || 0
      summaryMap[monthKey].total += amount
      summaryMap[monthKey].count += 1
      summaryMap[monthKey].categories[exp.category] = (summaryMap[monthKey].categories[exp.category] || 0) + amount
    }

    const result = Object.values(summaryMap).sort((a, b) => b.month.localeCompare(a.month))
    res.json(result)
  } catch (error) {
    console.error('Error fetching expense summary:', error)
    res.status(500).json({ error: 'Failed to fetch expense summary' })
  }
})

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { title, category, amount, recipientName, paidAt, paymentMethod, receiptUrl, notes } = req.body

    if (!title || amount === undefined) {
      return res.status(400).json({ error: 'Title and amount are required' })
    }

    const parsedAmount = Number(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' })
    }

    const newExpense = await prisma.expense.create({
      data: {
        title: String(title).trim(),
        category: category ? String(category).trim() : 'operational',
        amount: parsedAmount,
        recipientName: recipientName ? String(recipientName).trim() : null,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        paymentMethod: paymentMethod ? String(paymentMethod).trim() : 'cash',
        receiptUrl: receiptUrl ? String(receiptUrl).trim() : null,
        notes: notes ? String(notes).trim() : null,
      },
    })

    res.status(201).json(newExpense)
  } catch (error) {
    console.error('Error creating expense:', error)
    res.status(500).json({ error: 'Failed to create expense' })
  }
})

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, category, amount, recipientName, paidAt, paymentMethod, receiptUrl, notes } = req.body

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(category !== undefined && { category: String(category).trim() }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(recipientName !== undefined && { recipientName: recipientName ? String(recipientName).trim() : null }),
        ...(paidAt !== undefined && { paidAt: new Date(paidAt) }),
        ...(paymentMethod !== undefined && { paymentMethod: String(paymentMethod).trim() }),
        ...(receiptUrl !== undefined && { receiptUrl: receiptUrl ? String(receiptUrl).trim() : null }),
        ...(notes !== undefined && { notes: notes ? String(notes).trim() : null }),
      },
    })

    res.json(updated)
  } catch (error) {
    console.error('Error updating expense:', error)
    res.status(500).json({ error: 'Failed to update expense' })
  }
})

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.expense.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({ error: 'Failed to delete expense' })
  }
})

export default router
