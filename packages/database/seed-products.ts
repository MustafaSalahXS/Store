import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STORE_ID = '53f69e8e-efb2-4059-87a8-db5caf027606'

const CATEGORIES = [
  {
    name: 'IPHONE',
    items: [
      { name: 'iPhone 15 Pro', price: 1000, img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80' },
      { name: 'iPhone 15', price: 800, img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80' },
      { name: 'iPhone 14 Pro', price: 900, img: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&q=80' },
      { name: 'iPhone 13 Mini', price: 600, img: 'https://images.unsplash.com/photo-1635352738725-7096e7368d90?w=800&q=80' },
    ]
  },
  {
    name: 'TABLET',
    items: [
      { name: 'iPad Pro M2', price: 1100, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80' },
      { name: 'iPad Air', price: 600, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80' },
      { name: 'Samsung Galaxy Tab S9', price: 800, img: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800&q=80' },
    ]
  },
  {
    name: 'TVS',
    items: [
      { name: 'Samsung 65" QLED 4K', price: 1200, img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80' },
      { name: 'LG OLED C3 55"', price: 1500, img: 'https://images.unsplash.com/photo-1558888401-3cc1de440bb0?w=800&q=80' },
      { name: 'Sony Bravia XR', price: 1800, img: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&q=80' },
    ]
  },
  {
    name: 'LAPTOPS',
    items: [
      { name: 'MacBook Pro 14"', price: 2000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' },
      { name: 'Dell XPS 15', price: 1800, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80' },
      { name: 'Razer Blade 16', price: 2500, img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80' },
    ]
  },
  {
    name: 'Clothes',
    items: [
      { name: 'Oversized Hoodie', price: 60, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80' },
      { name: 'Slim Fit Jeans', price: 80, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80' },
      { name: 'Leather Jacket', price: 250, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80' },
    ]
  },
  {
    name: 'Makup',
    items: [
      { name: 'Matte Lipstick', price: 25, img: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800&q=80' },
      { name: 'Eyeshadow Palette', price: 45, img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80' },
      { name: 'Foundation Fluid', price: 40, img: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb1a?w=800&q=80' },
    ]
  }
]

async function seed() {
  console.log('🚀 Seeding products...')

  for (const cat of CATEGORIES) {
    for (const item of cat.items) {
      // Create multiple instances of each item to create "load"
      for (let i = 1; i <= 5; i++) {
        await prisma.product.create({
          data: {
            storeId: STORE_ID,
            name: `${item.name} #${i}`,
            description: `Premium ${item.name} with high quality features and modern design.`,
            price: item.price,
            category: cat.name,
            image: item.items ? item.img : item.img, // Fix: Use item.img
            isActive: true,
            stock: 50,
            trackStock: true,
            ctaText: 'Add to Cart',
          }
        })
      }
    }
  }

  console.log('✅ Seeding completed!')
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
