import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { prisma } from 'database'
import bcryptjs from 'bcryptjs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function createSuperAdmin() {
  const email = 'superadmin@system.com'
  const password = '01026330651'
  const name = 'MustafaSalah'

  try {
    let user = await prisma.user.findFirst({ where: { email } })
    
    if (!user) {
      console.log('Creating SuperAdmin in Supabase...')
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role: 'super_admin' },
      })

      if (authError) throw authError

      console.log('Creating SuperAdmin in Database...')
      const passwordHash = await bcryptjs.hash(password, 10)
      user = await prisma.user.create({
        data: {
          id: authUser.user.id,
          email,
          name,
          passwordHash,
          role: 'super_admin',
          isActive: true,
        },
      })
      console.log('SuperAdmin created successfully!')
    } else {
      console.log('SuperAdmin already exists. Updating role...')
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'super_admin' }
      })
    }
  } catch (err) {
    console.error('Failed to create SuperAdmin:', err)
  } finally {
    process.exit()
  }
}

createSuperAdmin()
