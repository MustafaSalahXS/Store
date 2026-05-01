// @ts-nocheck
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { authRouter } from './routes/auth.js'
import { productsRouter } from './routes/products.js'
import { ordersRouter } from './routes/orders.js'
import { settingsRouter } from './routes/settings.js'
import { adminRouter } from './routes/admin.js'
import { uploadRouter } from './routes/upload.js'
import { paymentsRouter } from './routes/payments.js'
import { bannersRouter } from './routes/banners.js'
import couponsRouter from './routes/coupons.js'

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())

// Serve uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')))

// Health check
app.get('/', (_req, res) => {
  res.json({
    service: 'store-api',
    status: 'ok',
    health: '/health',
    apiBase: '/api',
    timestamp: new Date().toISOString(),
  })
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Compatibility alias for common typo from external checks.
app.get('/heatlh', (_req, res) => {
  res.redirect(307, '/health')
})

// Avoid noisy 404s from browser automatic favicon request.
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end()
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/banners', bannersRouter)
app.use('/api/coupons', couponsRouter)

// Start local server only outside Vercel serverless runtime
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/health`)
  })
}

export default app



