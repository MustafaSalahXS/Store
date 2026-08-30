'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login?mode=register')
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-xs uppercase font-black tracking-widest text-muted-foreground animate-pulse">
        Opening Luxury Registration Portal...
      </div>
    </div>
  )
}
