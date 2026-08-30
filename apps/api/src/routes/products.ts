// @ts-nocheck
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// نوع آمن بدون Prisma types (عشان Vercel ما يوقعش)
type Product = any

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      gender, 
      search, 
      size,
      tag,
      material,
      minPrice,
      maxPrice,
      includeInactive,
      limit = '100', 
      offset = '0' 
    } = req.query

    const where: any = {}
    if (includeInactive !== 'true') {
      where.isActive = true
    }

    if (category) {
      where.category = category as string
    }

    if (material) {
      where.material = { contains: material as string, mode: 'insensitive' }
    }

    if (tag) {
      where.tags = { has: tag as string }
    }

    if (size) {
      where.sizes = { has: size as string }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }

    if (gender) {
      if (gender === 'men') {
        where.OR = [{ gender: 'men' }, { gender: 'both' }]
      } else if (gender === 'women') {
        where.OR = [{ gender: 'women' }, { gender: 'both' }]
      } else {
        where.gender = gender as string
      }
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { category: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const take = Math.min(Number(limit) || 100, 1000)
    const skip = Number(offset) || 0

    const products: Product[] = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    })

    const formatted = products.map((p) => ({
      ...p,
      colors: (p.colors && Array.isArray(p.colors) && p.colors.length > 0)
        ? p.colors
        : ((p.customizationOptions as any)?.colors || []),
      tags: Array.isArray(p.tags) ? p.tags : [],
      isPastCollection: Boolean((p.customizationOptions as any)?.isPastCollection),
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET CSV EXPORT
router.get('/csv/export', async (_req, res) => {
  try {
    const products: Product[] = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const headers = [
      'name','description','price','category','stock','sku','cost','isActive',
      'image','videoUrl','discountActive','discountPercentage','sizes','gender',
      'isAccessory','isFootwear','isCurated','hasCounter','ctaText',
      'directCheckout','trackStock'
    ]

    const escapeCSV = (val: unknown) => {
      if (val === null || val === undefined) return ''
      const str = String(val)
      return /[,"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
    }

    const rows = products.map((p) => [
      escapeCSV(p.name),
      escapeCSV(p.description),
      p.price,
      escapeCSV(p.category),
      p.stock,
      escapeCSV(p.sku),
      p.cost,
      p.isActive,
      escapeCSV(p.image),
      escapeCSV(p.videoUrl),
      p.discountActive,
      p.discountPercentage,
      escapeCSV(Array.isArray(p.sizes) ? p.sizes.join(';') : ''),
      escapeCSV(p.gender),
      p.isAccessory,
      p.isFootwear,
      p.isCurated,
      p.hasCounter,
      escapeCSV(p.ctaText),
      p.directCheckout,
      p.trackStock,
    ].join(','))

    const csv = [headers.join(','), ...rows].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"')
    res.send(csv)
  } catch (error) {
    console.error('CSV export error:', error)
    res.status(500).json({ error: 'Failed to export products' })
  }
})

// CSV IMPORT
router.post('/csv/import', async (req, res) => {
  try {
    const { csvData } = req.body

    if (!csvData) {
      return res.status(400).json({ error: 'csvData is required' })
    }

    const lines = csvData.split('\n').filter((l: string) => l.trim())

    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV must contain header + data' })
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase())

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }

      result.push(current.trim())
      return result
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    }

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i] || '')

        const row: Record<string, string> = {}

        headers.forEach((h: string, idx: number) => {
          row[h] = values[idx] || ''
        })

        const parseBool = (val: string, fallback: boolean) =>
          val ? val.toLowerCase() === 'true' : fallback

        const data = {
          name: row.name || 'Untitled Product',
          description: row.description || '',
          price: Number(row.price) || 0,
          category: row.category || '',
          stock: Number(row.stock) || 0,
          sku: row.sku || '',
          cost: Number(row.cost) || 0,
          isActive: parseBool(row.isactive, true),
          image: row.image || null,
          videoUrl: row.videourl || null,
          discountActive: parseBool(row.discountactive, false),
          discountPercentage: Number(row.discountpercentage) || 0,
          sizes: row.sizes
            ? row.sizes.split(';').map((s: string) => s.trim()).filter(Boolean)
            : [],
          gender: row.gender || 'both',
          isAccessory: parseBool(row.isaccessory, false),
          isFootwear: parseBool(row.isfootwear, false),
          isCurated: parseBool(row.iscurated, false),
          hasCounter: parseBool(row.hascounter, true),
          ctaText: row.ctatext || 'Add to Cart',
          directCheckout: parseBool(row.directcheckout, false),
          trackStock: parseBool(row.trackstock, true),
        }

        if (data.sku) {
          const existing = await prisma.product.findFirst({
            where: { sku: data.sku },
          })

          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data,
            })
            results.updated++
          } else {
            await prisma.product.create({ data })
            results.created++
          }
        } else {
          await prisma.product.create({ data })
          results.created++
        }
      } catch (err: any) {
        results.errors.push(`Row ${i + 1}: ${err.message}`)
      }
    }

    res.json(results)
  } catch (error) {
    console.error('CSV import error:', error)
    res.status(500).json({ error: 'Failed to import products' })
  }
})

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        isActive: true,
      },
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({
      ...product,
      colors: (product.colors && Array.isArray(product.colors) && product.colors.length > 0)
        ? product.colors
        : ((product.customizationOptions as any)?.colors || []),
      tags: Array.isArray(product.tags) ? product.tags : [],
      isPastCollection: Boolean((product.customizationOptions as any)?.isPastCollection),
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// CREATE
router.post('/', async (req, res) => {
  try {
    const { isPastCollection, colors, tags, material, ...rest } = req.body
    const customization = {
      ...(req.body.customizationOptions || {}),
      ...(colors ? { colors } : {}),
      ...(isPastCollection !== undefined ? { isPastCollection } : {}),
    }

    const product = await prisma.product.create({
      data: {
        name: rest.name,
        description: rest.description || '',
        price: rest.price,
        discountPrice: rest.discountPrice ? Number(rest.discountPrice) : null,
        cost: rest.cost ? Number(rest.cost) : 0,
        category: rest.category || null,
        sku: rest.sku || null,
        stock: rest.stock ? Number(rest.stock) : 0,
        isActive: rest.isActive !== false,
        image: rest.image || null,
        images: rest.images || [],
        videoUrl: rest.videoUrl || null,
        colors: Array.isArray(colors) ? colors : [],
        tags: Array.isArray(tags) ? tags : [],
        material: material || null,
        hasCounter: rest.hasCounter ?? true,
        ctaText: rest.ctaText || 'Add to Cart',
        directCheckout: rest.directCheckout ?? false,
        trackStock: rest.trackStock ?? true,
        discountActive: rest.discountActive ?? false,
        discountPercentage: rest.discountPercentage ? Number(rest.discountPercentage) : 0,
        sizes: Array.isArray(rest.sizes) ? rest.sizes : [],
        gender: rest.gender || 'both',
        isAccessory: rest.isAccessory ?? false,
        isFootwear: rest.isFootwear ?? false,
        isCurated: rest.isCurated ?? false,
        customizationOptions: Object.keys(customization).length > 0 ? customization : null,
      },
    })

    res.status(201).json({
      ...product,
      colors: (product.colors && Array.isArray(product.colors) && product.colors.length > 0)
        ? product.colors
        : ((product.customizationOptions as any)?.colors || []),
      tags: Array.isArray(product.tags) ? product.tags : [],
      isPastCollection: Boolean((product.customizationOptions as any)?.isPastCollection),
    })
  } catch (error: any) {
    console.error('Create product error:', error)
    res.status(500).json({ error: error?.message || 'Failed to create product' })
  }
})

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { isPastCollection, colors, tags, material, ...rest } = req.body
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } })
    const existingCustomization = (existing?.customizationOptions as any) || {}
    const customization = {
      ...existingCustomization,
      ...(req.body.customizationOptions || {}),
      ...(colors ? { colors } : {}),
      ...(isPastCollection !== undefined ? { isPastCollection } : {}),
    }

    const data: any = {}
    if (rest.name !== undefined) data.name = rest.name
    if (rest.description !== undefined) data.description = rest.description
    if (rest.price !== undefined) data.price = rest.price
    if (rest.discountPrice !== undefined) data.discountPrice = rest.discountPrice ? Number(rest.discountPrice) : null
    if (rest.cost !== undefined) data.cost = rest.cost ? Number(rest.cost) : 0
    if (rest.category !== undefined) data.category = rest.category
    if (rest.sku !== undefined) data.sku = rest.sku
    if (rest.stock !== undefined) data.stock = rest.stock ? Number(rest.stock) : 0
    if (rest.isActive !== undefined) data.isActive = rest.isActive
    if (rest.image !== undefined) data.image = rest.image
    if (rest.images !== undefined) data.images = rest.images
    if (rest.videoUrl !== undefined) data.videoUrl = rest.videoUrl
    if (rest.sizes !== undefined) data.sizes = rest.sizes
    if (rest.gender !== undefined) data.gender = rest.gender
    if (colors !== undefined) data.colors = Array.isArray(colors) ? colors : []
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : []
    if (material !== undefined) data.material = material
    if (Object.keys(customization).length > 0) {
      data.customizationOptions = customization
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    })

    res.json({
      ...product,
      colors: (product.colors && Array.isArray(product.colors) && product.colors.length > 0)
        ? product.colors
        : ((product.customizationOptions as any)?.colors || []),
      tags: Array.isArray(product.tags) ? product.tags : [],
      isPastCollection: Boolean((product.customizationOptions as any)?.isPastCollection),
    })
  } catch (error: any) {
    console.error('Update product error:', error)
    res.status(500).json({ error: error?.message || 'Failed to update product' })
  }
})

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    })

    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to delete product' })
  }
})

export { router as productsRouter }



