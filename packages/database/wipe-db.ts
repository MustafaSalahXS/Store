import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function wipeDatabase() {
  console.log('🧹 Wiping all values from the database...')
  
  try {
    // Delete in order to respect foreign key constraints
    await prisma.orderItem.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.delivery.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()
    
    // Unlink users from stores before deleting stores
    await prisma.user.updateMany({ data: { storeId: null } })
    
    await prisma.store.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Database successfully wiped clean!')
  } catch (error) {
    console.error('❌ Error wiping database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

wipeDatabase()
