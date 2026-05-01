import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

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

  console.log(`Settings created: ${settings.name}`)

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

  console.log(`Default admin created: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
