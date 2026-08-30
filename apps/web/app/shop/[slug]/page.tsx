'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/header'
import ProductCard from '@/components/product-card'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Loader, Store, AlertCircle } from 'lucide-react'

export default function ShopPage() {
  const { slug } = useParams()
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadShopData = async () => {
      if (!slug) return
      setIsLoading(true)
      try {
        // We need an API to get store by slug
        const result = await (api as any).stores?.getBySlug(slug as string)
        if (result) {
          setStore(result)
          const productsData = await api.products.list(result.id)
          setProducts(productsData)
        } else {
          setError('Store not found')
        }
      } catch (err) {
        console.error('Failed to load shop:', err)
        setError('Failed to load store data')
      } finally {
        setIsLoading(false)
      }
    }

    loadShopData()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
        <p className="text-muted-foreground">{error || 'The requested store does not exist or has been moved.'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Store Hero */}
      <section className="relative h-64 md:h-80 bg-secondary overflow-hidden">
        {store.bannerUrl && (
          <img 
            src={store.bannerUrl} 
            className="w-full h-full object-cover opacity-60" 
            alt={store.name} 
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-block"
            >
              <img 
                src={store.logoUrl || '/Digital.png'} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-contain p-2 bg-white border-4 border-background shadow-2xl mx-auto" 
                alt={store.name} 
              />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black tracking-tighter uppercase"
            >
              {store.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground font-medium mt-2 max-w-xl mx-auto"
            >
              {store.description}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-container py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Our Collection</h2>
          <span className="text-sm font-bold text-muted-foreground">{products.length} Items Available</span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-[3rem] border border-dashed border-border">
            <p className="text-muted-foreground font-medium italic">This store currently has no active products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                {...product}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-20">
        <div className="section-container text-center">
          <p className="text-sm text-muted-foreground">&copy; 2026 {store.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
