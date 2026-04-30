import { prisma } from 'database'

async function promoteUser() {
  const email = 'mustafasalah4@gmail.com'
  try {
    const user = await prisma.user.findFirst({ where: { email } })
    if (!user) {
       console.log(`User ${email} not found`)
       return
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'super_admin' }
    })
    console.log(`Successfully promoted ${email} to super_admin`)
  } catch (err) {
    console.error('Promotion failed:', err)
  } finally {
    process.exit()
  }
}

promoteUser()
