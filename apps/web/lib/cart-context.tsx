'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from './api'

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  size?: string
  customizations?: Record<string, any>
  addedAt: string
}

interface CartContextType {
  items: CartItem[]
  total: number
  itemCount: number
  addToCart: (product: Product, quantity: number, size?: string, customizations?: Record<string, any>) => void
  removeFromCart: (productId: string, size?: string) => void
  updateQuantity: (productId: string, quantity: number, size?: string) => void
  clearCart: () => void
  getCartTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)

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
      } else if (item.product.discountPrice || item.product.discount_price) {
        price = Number(item.product.discountPrice || item.product.discount_price)
      }
      return sum + price * item.quantity
    }, 0)
    setTotal(cartTotal)
  }

  const addToCart = (
    product: Product,
    quantity: number,
    size?: string,
    customizations?: Record<string, any>
  ) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === product.id && item.size === size
      )

      if (existingItem && !customizations) {
        return prevItems.map((item) =>
          item.productId === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [
          ...prevItems,
          {
            productId: product.id,
            product,
            quantity,
            size,
            customizations,
            addedAt: new Date().toISOString(),
          },
        ]
      }
    })
  }

  const removeFromCart = (productId: string, size?: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.productId === productId && item.size === size))
    )
  }

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.size === size ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getCartTotal = () => total

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount: items.length,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
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
