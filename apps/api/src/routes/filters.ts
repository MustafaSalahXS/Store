// @ts-nocheck
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

const DEFAULT_FILTERS = [
  {
    nameEn: 'Categories',
    nameAr: 'التصنيفات الرئيسية',
    type: 'category',
    options: ['Tailoring', 'Dresses', 'Evening Wear', 'Outerwear', 'Footwear', 'Accessories', 'Knitwear', 'Shirts', 'Pants'],
    isActive: true,
    position: 1,
  },
  {
    nameEn: 'Curated Collections',
    nameAr: 'التشكيلات الحصرية',
    type: 'collection',
    options: ['Archival Heritage', 'Spring/Summer 2026', 'Bespoke Atelier', 'Monogram Line', 'Past Collections'],
    isActive: true,
    position: 2,
  },
  {
    nameEn: 'Luxury Materials',
    nameAr: 'الخامات والأقمشة',
    type: 'material',
    options: ['Silk Cashmere', 'Giza Egyptian Cotton', 'Virgin Wool', 'Italian Calfskin Leather', 'Linen Blend', 'Velvet'],
    isActive: true,
    position: 3,
  },
  {
    nameEn: 'Fit & Silhouette',
    nameAr: 'القصّة والمقاس',
    type: 'tag',
    options: ['Bespoke Tailored', 'Oversized Drape', 'Structured Fit', 'Classic Fit'],
    isActive: true,
    position: 4,
  },
  {
    nameEn: 'Seasonal Drops',
    nameAr: 'الموسم',
    type: 'season',
    options: ['Summer 2026', 'Winter Archive', 'All Season Essentials', 'Runway Capsule'],
    isActive: true,
    position: 5,
  }
]

// GET /api/filters
router.get('/', async (_req, res) => {
  try {
    let filters = await prisma.storeFilter.findMany({
      orderBy: { position: 'asc' },
    })

    if (filters.length === 0) {
      await prisma.storeFilter.createMany({
        data: DEFAULT_FILTERS,
      })
      filters = await prisma.storeFilter.findMany({
        orderBy: { position: 'asc' },
      })
    }

    res.json(filters)
  } catch (error: any) {
    console.error('Error fetching filters:', error)
    res.status(500).json({ error: 'Failed to fetch store filters' })
  }
})

// POST /api/filters
router.post('/', async (req, res) => {
  try {
    const { nameEn, nameAr, type, options, isActive, position } = req.body

    if (!nameEn || !nameAr) {
      return res.status(400).json({ error: 'English and Arabic filter names are required' })
    }

    const newFilter = await prisma.storeFilter.create({
      data: {
        nameEn: String(nameEn).trim(),
        nameAr: String(nameAr).trim(),
        type: type ? String(type).trim() : 'category',
        options: Array.isArray(options) ? options.map(o => String(o).trim()).filter(Boolean) : [],
        isActive: isActive !== false,
        position: Number(position) || 0,
      },
    })

    res.status(201).json(newFilter)
  } catch (error: any) {
    console.error('Error creating filter:', error)
    res.status(500).json({ error: 'Failed to create filter' })
  }
})

// PUT /api/filters/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nameEn, nameAr, type, options, isActive, position } = req.body

    const updated = await prisma.storeFilter.update({
      where: { id },
      data: {
        ...(nameEn !== undefined && { nameEn: String(nameEn).trim() }),
        ...(nameAr !== undefined && { nameAr: String(nameAr).trim() }),
        ...(type !== undefined && { type: String(type).trim() }),
        ...(options !== undefined && { options: Array.isArray(options) ? options.map(o => String(o).trim()).filter(Boolean) : [] }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(position !== undefined && { position: Number(position) }),
      },
    })

    res.json(updated)
  } catch (error: any) {
    console.error('Error updating filter:', error)
    res.status(500).json({ error: 'Failed to update filter' })
  }
})

// DELETE /api/filters/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.storeFilter.delete({ where: { id } })
    res.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting filter:', error)
    res.status(500).json({ error: 'Failed to delete filter' })
  }
})

export default router
