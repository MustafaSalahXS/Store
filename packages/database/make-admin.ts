import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const email = process.argv[2]

async function makeAdmin() {
  if (!email) {
    console.error('❌ Please provide an email address!')
    console.log('Usage: npx tsx make-admin.ts <user-email>')
    process.exit(1)
  }

  try {
    const user = await prisma.user.updateMany({
      where: { email },
      data: { role: 'admin' }
    })

    if (user.count > 0) {
      console.log(`✅ Success! ${email} has been promoted to Admin.`)
    } else {
      console.log(`⚠️ No user found with email: ${email}. Please register first on the website.`)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
