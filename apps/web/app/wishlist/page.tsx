'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWishlist } from '@/lib/wishlist-context'

export default function WishlistPage() {
  const router = useRouter()
  const { setShowWishlistDrawer } = useWishlist()

  useEffect(() => {
    setShowWishlistDrawer(true)
    router.replace('/')
  }, [router, setShowWishlistDrawer])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse font-bold text-sm text-stone-400">
        جاري فتح قائمة الرغبات والمفضلة...
      </div>
    </div>
  )
}
