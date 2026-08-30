// @ts-nocheck
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

export const ALL_EGYPT_ZONES = [
  // User's specifically requested top priority zones:
  { nameEn: 'Qena', nameAr: 'قنا', city: 'Qena', deliveryFee: 85, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Sohag', nameAr: 'سوهاج', city: 'Sohag', deliveryFee: 85, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Luxor', nameAr: 'الأقصر', city: 'Luxor', deliveryFee: 90, taxRate: 14, estimatedDays: '2-4 Days' },
  { nameEn: 'Hurghada', nameAr: 'الغردقة', city: 'Hurghada', deliveryFee: 95, taxRate: 14, estimatedDays: '2-3 Days' },

  // Metropolitan Hubs
  { nameEn: 'Greater Cairo', nameAr: 'القاهرة الكبرى', city: 'Cairo', deliveryFee: 50, taxRate: 14, estimatedDays: '1-2 Days' },
  { nameEn: 'Giza & October', nameAr: 'الجيزة و 6 أكتوبر', city: 'Giza', deliveryFee: 50, taxRate: 14, estimatedDays: '1-2 Days' },
  { nameEn: 'Alexandria', nameAr: 'الإسكندرية', city: 'Alexandria', deliveryFee: 65, taxRate: 14, estimatedDays: '2-3 Days' },

  // Upper Egypt (الصعيد)
  { nameEn: 'Aswan', nameAr: 'أسوان', city: 'Aswan', deliveryFee: 100, taxRate: 14, estimatedDays: '3-4 Days' },
  { nameEn: 'Asyut', nameAr: 'أسيوط', city: 'Asyut', deliveryFee: 80, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Minya', nameAr: 'المنيا', city: 'Minya', deliveryFee: 75, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Beni Suef', nameAr: 'بني سويف', city: 'Beni Suef', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Fayoum', nameAr: 'الفيوم', city: 'Fayoum', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'New Valley', nameAr: 'الوادي الجديد', city: 'Kharga', deliveryFee: 120, taxRate: 14, estimatedDays: '3-5 Days' },

  // Delta & Lower Egypt (وجه بحري والدلتا)
  { nameEn: 'Mansoura & Dakahlia', nameAr: 'المنصورة والدقهلية', city: 'Mansoura', deliveryFee: 65, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Tanta & Gharbia', nameAr: 'طنطا والغربية', city: 'Tanta', deliveryFee: 65, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Zagazig & Sharqia', nameAr: 'الزقازيق والشرقية', city: 'Zagazig', deliveryFee: 65, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Qalyubia', nameAr: 'القليوبية', city: 'Banha', deliveryFee: 60, taxRate: 14, estimatedDays: '1-2 Days' },
  { nameEn: 'Monufia', nameAr: 'المنوفية', city: 'Shibin El Kom', deliveryFee: 65, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Beheira', nameAr: 'البحيرة', city: 'Damanhur', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', city: 'Kafr El Sheikh', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Damietta', nameAr: 'دمياط', city: 'Damietta', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },

  // Canal Cities (مدن القناة)
  { nameEn: 'Port Said', nameAr: 'بورسعيد', city: 'Port Said', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Ismailia', nameAr: 'الإسماعيلية', city: 'Ismailia', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { nameEn: 'Suez', nameAr: 'السويس', city: 'Suez', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },

  // Coastal & Red Sea
  { nameEn: 'Red Sea (Safaga, El Gouna)', nameAr: 'البحر الأحمر (سفاجا، الجونة)', city: 'Red Sea', deliveryFee: 100, taxRate: 14, estimatedDays: '3-4 Days' },
  { nameEn: 'Sharm El Sheikh & South Sinai', nameAr: 'شرم الشيخ وجنوب سيناء', city: 'Sharm El Sheikh', deliveryFee: 110, taxRate: 14, estimatedDays: '3-4 Days' },
  { nameEn: 'Marsa Matrouh & North Coast', nameAr: 'مرسى مطروح والساحل الشمالي', city: 'Matrouh', deliveryFee: 100, taxRate: 14, estimatedDays: '3-4 Days' },
  { nameEn: 'North Sinai', nameAr: 'شمال سيناء', city: 'Arish', deliveryFee: 120, taxRate: 14, estimatedDays: '3-5 Days' },
]

// GET /api/delivery-zones
router.get('/', async (_req, res) => {
  try {
    let zones = await prisma.deliveryZone.findMany({
      orderBy: { createdAt: 'asc' },
    })

    // Auto-seed default Egyptian delivery zones if empty
    if (zones.length === 0) {
      await prisma.deliveryZone.createMany({
        data: ALL_EGYPT_ZONES,
      })
      zones = await prisma.deliveryZone.findMany({
        orderBy: { createdAt: 'asc' },
      })
    } else {
      // Ensure priority zones Qena, Sohag, Luxor, Hurghada exist
      const existingNames = new Set(zones.map(z => z.nameEn.toLowerCase()))
      const priorityToAdd = ALL_EGYPT_ZONES.filter(z => 
        ['qena', 'sohag', 'luxor', 'hurghada'].includes(z.nameEn.toLowerCase()) &&
        !existingNames.has(z.nameEn.toLowerCase())
      )

      if (priorityToAdd.length > 0) {
        await prisma.deliveryZone.createMany({
          data: priorityToAdd,
        })
        zones = await prisma.deliveryZone.findMany({
          orderBy: { createdAt: 'asc' },
        })
      }
    }

    res.json(zones)
  } catch (error) {
    console.error('Error fetching delivery zones:', error)
    res.status(500).json({ error: 'Failed to fetch delivery zones' })
  }
})

// POST /api/delivery-zones/seed-defaults (Admin: ensure all 27 governorates exist)
router.post('/seed-defaults', async (_req, res) => {
  try {
    const existing = await prisma.deliveryZone.findMany()
    const existingNames = new Set(existing.map(z => z.nameEn.toLowerCase()))
    const toCreate = ALL_EGYPT_ZONES.filter(z => !existingNames.has(z.nameEn.toLowerCase()))

    if (toCreate.length > 0) {
      await prisma.deliveryZone.createMany({
        data: toCreate,
      })
    }

    const updatedZones = await prisma.deliveryZone.findMany({
      orderBy: { createdAt: 'asc' },
    })

    res.json({ message: `Added ${toCreate.length} missing Egyptian zones`, zones: updatedZones })
  } catch (error) {
    console.error('Error seeding delivery zones:', error)
    res.status(500).json({ error: 'Failed to seed delivery zones' })
  }
})

// POST /api/delivery-zones (Admin)
router.post('/', async (req, res) => {
  try {
    const { nameEn, nameAr, city, deliveryFee, taxRate, estimatedDays, isActive } = req.body

    if (!nameEn || !nameAr) {
      return res.status(400).json({ error: 'Zone English and Arabic names are required' })
    }

    const newZone = await prisma.deliveryZone.create({
      data: {
        nameEn: String(nameEn).trim(),
        nameAr: String(nameAr).trim(),
        city: city ? String(city).trim() : 'Cairo',
        deliveryFee: Number(deliveryFee) || 0,
        taxRate: Number(taxRate) || 0,
        estimatedDays: estimatedDays ? String(estimatedDays).trim() : '1-3 Days',
        isActive: isActive !== false,
      },
    })

    res.status(201).json(newZone)
  } catch (error) {
    console.error('Error creating delivery zone:', error)
    res.status(500).json({ error: 'Failed to create delivery zone' })
  }
})

// PUT /api/delivery-zones/:id (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nameEn, nameAr, city, deliveryFee, taxRate, estimatedDays, isActive } = req.body

    const updated = await prisma.deliveryZone.update({
      where: { id },
      data: {
        ...(nameEn !== undefined && { nameEn: String(nameEn).trim() }),
        ...(nameAr !== undefined && { nameAr: String(nameAr).trim() }),
        ...(city !== undefined && { city: String(city).trim() }),
        ...(deliveryFee !== undefined && { deliveryFee: Number(deliveryFee) }),
        ...(taxRate !== undefined && { taxRate: Number(taxRate) }),
        ...(estimatedDays !== undefined && { estimatedDays: String(estimatedDays).trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })

    res.json(updated)
  } catch (error) {
    console.error('Error updating delivery zone:', error)
    res.status(500).json({ error: 'Failed to update delivery zone' })
  }
})

// DELETE /api/delivery-zones/:id (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.deliveryZone.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting delivery zone:', error)
    res.status(500).json({ error: 'Failed to delete delivery zone' })
  }
})

export default router
