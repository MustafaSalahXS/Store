import { prisma } from 'database'

async function tryDeleteStore() {
  const storeName = "Ad's Store"
  try {
    const store = await prisma.store.findFirst({ where: { name: storeName } })
    if (!store) {
      console.log(`Store "${storeName}" not found`)
      return
    }

    console.log(`Found store ID: ${store.id}. Attempting delete...`)
    
    // Attempt deletion
    await prisma.store.delete({ where: { id: store.id } })
    console.log(`Successfully deleted "${storeName}"`)
  } catch (err: any) {
    console.error(`Failed to delete store: ${err.message}`)
    if (err.code === 'P2003') {
       console.log('Foreign key constraint failed. This store has related data (orders, products, etc) that cannot be auto-deleted.')
    }
  } finally {
    process.exit()
  }
}

tryDeleteStore()
