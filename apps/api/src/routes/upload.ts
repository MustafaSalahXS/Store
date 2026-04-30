import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { supabase } from '../lib/supabase.js'

const router = Router()

// Configure storage to use memory
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
})

// Helper to upload to Supabase
async function uploadToSupabase(file: Express.Multer.File, bucket: string) {
  const fileExt = path.extname(file.originalname)
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`
  const filePath = fileName

  console.log(`[Upload] Starting upload to bucket: ${bucket}, path: ${filePath}`)

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    })

  if (error) {
    console.error(`[Upload] Supabase error:`, error)
    throw error
  }

  console.log(`[Upload] Success:`, data)

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  console.log(`[Upload] Public URL: ${publicUrl}`)
  return publicUrl
}


// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const bucket = (req.query.bucket as string) || 'Pics'
    const fileUrl = await uploadToSupabase(req.file, bucket)
    
    res.json({ url: fileUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    res.status(500).json({ error: error.message || 'Failed to upload file' })
  }
})

// POST /api/upload/multiple
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const bucket = (req.query.bucket as string) || 'Pics'
    const uploadPromises = files.map(file => uploadToSupabase(file, bucket))
    const urls = await Promise.all(uploadPromises)

    res.json({ urls })
  } catch (error: any) {
    console.error('Multiple upload error:', error)
    res.status(500).json({ error: error.message || 'Failed to upload files' })
  }
})

export { router as uploadRouter }

