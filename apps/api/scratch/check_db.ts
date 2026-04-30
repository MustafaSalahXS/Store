import { prisma } from 'database'

async function checkUsers() {
  try {
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({ take: 5 })
    console.log(`Total users in DB: ${userCount}`)
    console.log('Sample users:', JSON.stringify(users, null, 2))
    
    const storeCount = await prisma.store.count()
    console.log(`Total stores in DB: ${storeCount}`)
  } catch (err) {
    console.error('Error checking DB:', err)
  } finally {
    process.exit()
  }
}

checkUsers()
