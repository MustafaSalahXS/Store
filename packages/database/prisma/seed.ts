import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create global store settings
  const settings = await prisma.storeSettings.upsert({
    where: { slug: 'timeless-templates' },
    update: {},
    create: {
      name: 'Timeless Templates Official',
      slug: 'timeless-templates',
      description: 'Premium digital products and templates.',
      currency: 'USD',
    },
  })

  console.log(`✅ Global Settings created: ${settings.name}`)

  // Create default Admin
  const admin = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000000' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'admin@example.com',
      name: 'Store Admin',
      role: 'admin',
      isActive: true,
    },
  })

  console.log(`✅ Default Admin created: ${admin.email}`)

  // Create demo products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Wedding Invitation Suite',
        description: 'Beautiful customizable wedding invitation templates with themes.',
        price: 49.99,
        category: 'Invitations',
        stock: 100,
        sku: 'INV-001',
        isActive: true,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      },
    }),
    prisma.product.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Reception Menu Design',
        description: 'Elegant menu cards for your wedding reception.',
        price: 39.99,
        category: 'Menus',
        stock: 80,
        sku: 'MNU-001',
        isActive: true,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      },
    }),
    prisma.product.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Seating Chart Collection',
        description: 'Premium seating arrangement templates.',
        price: 44.99,
        category: 'Seating',
        stock: 60,
        sku: 'SCH-001',
        isActive: true,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      },
    }),
    prisma.product.upsert({
      where: { id: '00000000-0000-0000-0000-000000000004' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'Thank You Cards',
        description: 'Personalized thank you card designs.',
        price: 29.99,
        category: 'Cards',
        stock: 120,
        sku: 'THK-001',
        isActive: true,
        image: 'https://images.unsplash.com/photo-1505631346881-b72b27e84530?w=800&q=80',
      },
    }),
  ])

  console.log(`✅ Created ${products.length} demo products`)
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
