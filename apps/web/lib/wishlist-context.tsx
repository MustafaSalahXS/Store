'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { Product } from './types'
import { useAuth } from './auth-context'
import { supabase } from './supabase'

interface WishlistContextType {
  wishlist: Product[]
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (product: Product) => void
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void
  wishlistCount: number
  showWishlistDrawer: boolean
  setShowWishlistDrawer: (open: boolean) => void
  isSyncedWithAccount: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const GUEST_STORAGE_KEY = 'store_wishlist_guest'
const LEGACY_STORAGE_KEY = 'store_wishlist'

const getUserStorageKey = (userId: string) => `store_wishlist_${userId}`

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Track the previous user ID to detect login, logout, and account switch
  const prevUserIdRef = useRef<string | null | undefined>(undefined)

  // Safe JSON parser helper
  const parseSaved = (key: string): Product[] => {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) {
      console.error(`Error parsing wishlist from ${key}:`, e)
    }
    return []
  }

  // Synchronize with Supabase user metadata in the cloud if authenticated
  const syncWithCloud = useCallback(async (items: Product[], userId: string) => {
    try {
      const productIds = items.map((p) => p.id)
      await supabase.auth.updateUser({
        data: { wishlist_ids: productIds },
      })
    } catch {
      // Cloud sync is best-effort and non-blocking
    }
  }, [])

  // Manage storage and synchronization based on authentication state
  useEffect(() => {
    if (authLoading) return

    const currentUserId = user?.id || null
    const prevUserId = prevUserIdRef.current

    // Case 1: Initial mount
    if (prevUserId === undefined) {
      if (currentUserId) {
        // Authenticated on first load: load account wishlist
        const userItems = parseSaved(getUserStorageKey(currentUserId))
        const guestItems = parseSaved(GUEST_STORAGE_KEY)
        const legacyItems = parseSaved(LEGACY_STORAGE_KEY)

        // Merge any guest or legacy items into the user's account
        const map = new Map<string, Product>()
        userItems.forEach((item) => map.set(item.id, item))
        guestItems.forEach((item) => map.set(item.id, item))
        legacyItems.forEach((item) => map.set(item.id, item))

        const merged = Array.from(map.values())
        setWishlist(merged)

        try {
          localStorage.setItem(getUserStorageKey(currentUserId), JSON.stringify(merged))
          localStorage.removeItem(GUEST_STORAGE_KEY)
          localStorage.removeItem(LEGACY_STORAGE_KEY)
        } catch {}

        syncWithCloud(merged, currentUserId)
      } else {
        // Guest on first load: load guest items or migrate legacy
        const guestItems = parseSaved(GUEST_STORAGE_KEY)
        const legacyItems = parseSaved(LEGACY_STORAGE_KEY)
        const items = guestItems.length > 0 ? guestItems : legacyItems
        setWishlist(items)
      }

      prevUserIdRef.current = currentUserId
      setMounted(true)
      return
    }

    // Case 2: Auth State Changed
    if (prevUserId !== currentUserId) {
      if (currentUserId && !prevUserId) {
        // USER LOGGED IN (Guest -> Authenticated)
        // Merge guest items into the user's permanent account wishlist
        const userItems = parseSaved(getUserStorageKey(currentUserId))
        const guestItems = [...wishlist, ...parseSaved(GUEST_STORAGE_KEY)]

        const map = new Map<string, Product>()
        userItems.forEach((item) => map.set(item.id, item))
        guestItems.forEach((item) => map.set(item.id, item))

        const merged = Array.from(map.values())
        setWishlist(merged)

        try {
          localStorage.setItem(getUserStorageKey(currentUserId), JSON.stringify(merged))
          localStorage.removeItem(GUEST_STORAGE_KEY)
          localStorage.removeItem(LEGACY_STORAGE_KEY)
        } catch {}

        syncWithCloud(merged, currentUserId)
      } else if (!currentUserId && prevUserId) {
        // USER LOGGED OUT (Authenticated -> Guest)
        // Per user directive: Clear active wishlist on logout
        setWishlist([])
        try {
          localStorage.removeItem(GUEST_STORAGE_KEY)
          localStorage.removeItem(LEGACY_STORAGE_KEY)
        } catch {}
      } else if (currentUserId && prevUserId && currentUserId !== prevUserId) {
        // ACCOUNT SWITCH (User A -> User B)
        const newAccountItems = parseSaved(getUserStorageKey(currentUserId))
        setWishlist(newAccountItems)
      }

      prevUserIdRef.current = currentUserId
    }
  }, [user, authLoading, syncWithCloud, wishlist])

  // Persist wishlist helper
  const persistWishlist = useCallback(
    (items: Product[]) => {
      setWishlist(items)
      try {
        if (user?.id) {
          // Linked and synced to user's account
          localStorage.setItem(getUserStorageKey(user.id), JSON.stringify(items))
          syncWithCloud(items, user.id)
        } else {
          // Temporary guest wishlist until user signs in
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items))
        }
      } catch (err) {
        console.error('Failed to persist wishlist:', err)
      }
    },
    [user, syncWithCloud]
  )

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlist.some((p) => p.id === productId)
    },
    [wishlist]
  )

  const addToWishlist = useCallback(
    (product: Product) => {
      if (isInWishlist(product.id)) return
      const updated = [product, ...wishlist]
      persistWishlist(updated)
    },
    [isInWishlist, wishlist, persistWishlist]
  )

  const removeFromWishlist = useCallback(
    (productId: string) => {
      const updated = wishlist.filter((p) => p.id !== productId)
      persistWishlist(updated)
    },
    [wishlist, persistWishlist]
  )

  const toggleWishlist = useCallback(
    (product: Product) => {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id)
      } else {
        addToWishlist(product)
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist]
  )

  const clearWishlist = useCallback(() => {
    setWishlist([])
    try {
      if (user?.id) {
        localStorage.removeItem(getUserStorageKey(user.id))
        syncWithCloud([], user.id)
      } else {
        localStorage.removeItem(GUEST_STORAGE_KEY)
      }
    } catch {}
  }, [user, syncWithCloud])

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount: mounted ? wishlist.length : 0,
        showWishlistDrawer,
        setShowWishlistDrawer,
        isSyncedWithAccount: !!user,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
