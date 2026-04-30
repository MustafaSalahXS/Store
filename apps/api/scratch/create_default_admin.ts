import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { prisma } from 'database'
import bcryptjs from 'bcryptjs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function createDefaultAdmin() {
  const email = 'mustafasalah@admin.com'
  const password = '01026330651'
  const name = 'MustafaSalah'

  try {
    // 1. Check if user exists in our DB
    let user = await prisma.user.findFirst({ where: { email } })
    
    if (!user) {
      console.log('Creating default admin in Supabase...')
      // 2. Create in Supabase
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role: 'store_admin' },
      })

      if (authError) throw authError

      console.log('Creating default admin in Database...')
      // 3. Create in our DB
      const passwordHash = await bcryptjs.hash(password, 10)
      user = await prisma.user.create({
        data: {
          id: authUser.user.id,
          email,
          name,
          passwordHash,
          role: 'store_admin',
          isActive: true,
        },
      })
      console.log('Default admin created successfully!')
    } else {
      console.log('Default admin already exists.')
      // Ensure role is correct
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'store_admin' }
      })
    }
  } catch (err) {
    console.error('Failed to create default admin:', err)
  } finally {
    process.exit()
  }
}

createDefaultAdmin()
