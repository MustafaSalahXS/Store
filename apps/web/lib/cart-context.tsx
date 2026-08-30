'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from './types'

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  size?: string
  color?: string
  colorHex?: string
  customizations?: Record<string, any>
  addedAt: string
}

export interface CartToastPayload {
  product: Product
  quantity: number
  size?: string
  color?: string
  colorHex?: string
  timestamp: number
}

interface CartContextType {
  items: CartItem[]
  total: number
  itemCount: number
  lastAddedToast: CartToastPayload | null
  dismissToast: () => void
  addToCart: (
    product: Product,
    quantity: number,
    size?: string,
    color?: string,
    colorHex?: string,
    customizations?: Record<string, any>
  ) => void
  removeFromCart: (productId: string, size?: string, color?: string) => void
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
  getCartTotal: () => number
  isItemInCart: (productId: string, size?: string, color?: string) => boolean
  getItemQuantityInCart: (productId: string, size?: string, color?: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [lastAddedToast, setLastAddedToast] = useState<CartToastPayload | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to load cart:', error)
        localStorage.removeItem('cart')
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
    calculateTotal()
  }, [items])

  const calculateTotal = () => {
    const cartTotal = items.reduce((sum, item) => {
      let price = Number(item.product.price)
      if (item.product.discountActive && item.product.discountPercentage) {
        price = price * (1 - item.product.discountPercentage / 100)
      } else if (item.product.discountPrice) {
        price = Number(item.product.discountPrice)
      }
      return sum + price * item.quantity
    }, 0)
    setTotal(cartTotal)
  }

  const addToCart = (
    product: Product,
    quantity: number,
    size?: string,
    color?: string,
    colorHex?: string,
    customizations?: Record<string, any>
  ) => {
    const qtyToAdd = Math.max(1, quantity)

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.productId === product.id &&
          (size ? item.size === size : true) &&
          (color ? item.color === color : true)
      )

      if (existingIndex > -1 && !customizations) {
        const updated = [...prevItems]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qtyToAdd,
        }
        return updated
      } else {
        return [
          ...prevItems,
          {
            productId: product.id,
            product,
            quantity: qtyToAdd,
            size,
            color,
            colorHex,
            customizations,
            addedAt: new Date().toISOString(),
          },
        ]
      }
    })

    // Trigger informative luxury toast
    setLastAddedToast({
      product,
      quantity: qtyToAdd,
      size,
      color,
      colorHex,
      timestamp: Date.now(),
    })
  }

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.productId === productId &&
            (size ? item.size === size : true) &&
            (color ? item.color === color : true)
          )
      )
    )
  }

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId &&
        (size ? item.size === size : true) &&
        (color ? item.color === color : true)
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getCartTotal = () => total

  const isItemInCart = (productId: string, size?: string, color?: string) => {
    return items.some(
      (item) =>
        item.productId === productId &&
        (size ? item.size === size : true) &&
        (color ? item.color === color : true)
    )
  }

  const getItemQuantityInCart = (productId: string, size?: string, color?: string) => {
    const item = items.find(
      (it) =>
        it.productId === productId &&
        (size ? it.size === size : true) &&
        (color ? it.color === color : true)
    )
    return item ? item.quantity : 0
  }

  const dismissToast = () => {
    setLastAddedToast(null)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
        lastAddedToast,
        dismissToast,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        isItemInCart,
        getItemQuantityInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
