import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database cleanup...')

  try {
    // Delete in reverse order of dependencies
    console.log('Deleting OrderItems...')
    await prisma.orderItem.deleteMany({})

    console.log('Deleting Payments...')
    await prisma.payment.deleteMany({})

    console.log('Deleting Deliveries...')
    await prisma.delivery.deleteMany({})

    console.log('Deleting Orders...')
    await prisma.order.deleteMany({})

    console.log('Deleting Products...')
    await prisma.product.deleteMany({})

    console.log('Deleting Stores...')
    // Note: This will set storeId to null for all users due to onDelete: SetNull
    await prisma.store.deleteMany({})

    console.log('Cleanup complete. Admins and Customers (User table) have been preserved.')
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
