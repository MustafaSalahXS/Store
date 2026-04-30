import { Router } from 'express'
import { prisma } from 'database'
import { Prisma } from '@prisma/client'

const router = Router()

type Product = Prisma.ProductGetPayload<{}>
type ProductWhere = Prisma.ProductWhereInput

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, limit = '100', offset = '0' } = req.query

    const where: ProductWhere = { isActive: true }
    if (category) where.category = category as string

    const take = Math.min(parseInt(limit as string) || 100, 1000)
    const skip = parseInt(offset as string) || 0

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    })

    res.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /api/products/csv/export
router.get('/csv/export', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const headers = [
      'name','description','price','category','stock','sku','cost','isActive',
      'image','videoUrl','discountActive','discountPercentage','sizes','gender',
      'isAccessory','isFootwear','isCurated','hasCounter','ctaText',
      'directCheckout','trackStock'
    ]

    const escapeCSV = (val: unknown): string => {
      if (val === null || val === undefined) return ''
      const str = String(val)
      if (/[,"\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = products.map((p: Product) => [
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

// POST /api/products/csv/import
router.post('/csv/import', async (req, res) => {
  try {
    const { csvData } = req.body
    if (!csvData) return res.status(400).json({ error: 'csvData is required' })

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

    const results = { created: 0, updated: 0, errors: [] as string[] }

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i] || '')
        const row: Record<string, string> = {}

        headers.forEach((h, idx) => {
          row[h] = values[idx] || ''
        })

        const parseBool = (val: string, fallback: boolean) =>
          val ? val.toLowerCase() === 'true' : fallback

        const data: Prisma.ProductCreateInput = {
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
          sizes: row.sizes ? row.sizes.split(';').map(s => s.trim()).filter(Boolean) : [],
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
          const existing = await prisma.product.findFirst({ where: { sku: data.sku } })

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

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, isActive: true },
    })

    if (!product) return res.status(404).json({ error: 'Product not found' })

    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const data: Prisma.ProductCreateInput = {
      ...req.body,
      description: req.body.description || '',
      stock: req.body.stock || 0,
      cost: req.body.cost || 0,
      isActive: req.body.isActive !== false,
      image: req.body.image || null,
      images: req.body.images || [],
      videoUrl: req.body.videoUrl || null,
      hasCounter: req.body.hasCounter ?? true,
      ctaText: req.body.ctaText || 'Add to Cart',
      directCheckout: req.body.directCheckout ?? false,
      trackStock: req.body.trackStock ?? true,
      discountActive: req.body.discountActive ?? false,
      discountPercentage: req.body.discountPercentage || 0,
      sizes: req.body.sizes || [],
      gender: req.body.gender || 'both',
      isAccessory: req.body.isAccessory ?? false,
      isFootwear: req.body.isFootwear ?? false,
      isCurated: req.body.isCurated ?? false,
    }

    const product = await prisma.product.create({ data })
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    })

    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export { router as productsRouter }