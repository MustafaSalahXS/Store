import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { prisma } from 'database'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function syncMetadata() {
  const emails = ['superadmin@system.com', 'mustafasalah4@gmail.com', 'demo@example.com']
  
  for (const email of emails) {
    try {
      const user = await prisma.user.findFirst({ where: { email } })
      if (!user) continue

      console.log(`Syncing metadata for ${email}...`)
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { name: user.name, role: user.role }
      })
      console.log(`Successfully synced ${email} metadata.`)
    } catch (err) {
      console.error(`Failed to sync ${email}:`, err)
    }
  }
  process.exit()
}

syncMetadata()
