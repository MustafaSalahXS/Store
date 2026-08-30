'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from './api'

interface Store {
  id: string
  name: string
  slug?: string
  description?: string
  currency?: string
  logoUrl?: string
  darkLogoUrl?: string
  faviconUrl?: string
  bannerUrl?: string
  taxRate?: number
  shippingFee?: number
  whatsappNumber?: string
  accessoriesImageUrl?: string
  footwearImageUrl?: string
  curatedImageUrl?: string
  ethosImageUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  linkedinUrl?: string
  aboutUs?: string
  sustainability?: string
  privacy?: string
  enableReceipts?: boolean
  logoType?: 'text' | 'image'
  settings?: any
}

interface StoreContextType {
  currentStore: Store | null
  isLoading: boolean
  refreshStore: () => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStore = async () => {
    setIsLoading(true)
    try {
      const settings = await api.settings.get()
      setCurrentStore(settings)
    } catch (error) {
      console.error('Failed to load store settings:', error)
      setCurrentStore(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStore()
  }, [])

  // Dynamically update the favicon and title
  useEffect(() => {
    if (currentStore?.name) {
      document.title = currentStore.name
    }
    
    const fav = currentStore?.faviconUrl || '/Digital.png'
    const links = document.querySelectorAll("link[rel*='icon']")
    
    if (links.length > 0) {
      links.forEach(link => {
        (link as HTMLLinkElement).href = fav
      })
    } else {
      const link = document.createElement('link')
      link.rel = 'icon'
      link.href = fav
      document.getElementsByTagName('head')[0].appendChild(link)
    }
  }, [currentStore?.faviconUrl, currentStore?.name])

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        isLoading,
        refreshStore: loadStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return context
}
