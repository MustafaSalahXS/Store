'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

interface Theme {
  id: string
  name: string
  color: string
  description?: string
}

interface ProductCustomizerProps {
  productName: string
  price: number
  themes?: Theme[]
  onCustomize?: (selection: CustomSelection) => void
}

export interface CustomSelection {
  themeId: string
  quantity: number
  customColor?: string
}

const DEFAULT_THEMES: Theme[] = [
  { id: 'light', name: 'Light', color: '#ffffff', description: 'Clean white theme' },
  { id: 'dark', name: 'Dark', color: '#1a1a1a', description: 'Dark slate theme' },
  { id: 'blue', name: 'Blue', color: '#2563eb', description: 'Vibrant blue' },
  { id: 'purple', name: 'Purple', color: '#9333ea', description: 'Elegant purple' },
  { id: 'rose', name: 'Rose', color: '#e11d48', description: 'Modern rose' },
]

export default function ProductCustomizer({
  productName,
  price,
  themes = DEFAULT_THEMES,
  onCustomize,
}: ProductCustomizerProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(themes[0]?.id || 'light')
  const [quantity, setQuantity] = useState(1)
  const [customColor, setCustomColor] = useState<string>('')

  const currentTheme = themes.find((t) => t.id === selectedTheme)
  const totalPrice = price * quantity

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(1, quantity + delta)
    setQuantity(newQty)
  }

  const handleAddToCart = () => {
    onCustomize?.({
      themeId: selectedTheme,
      quantity,
      customColor: customColor || undefined,
    })
  }

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">Select Theme</h3>
          <p className="text-sm text-muted-foreground">
            Choose a color theme for your product
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {themes.map((theme) => (
            <motion.button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-xl transition-all duration-300 ${
                selectedTheme === theme.id
                  ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900'
                  : 'hover:ring-2 hover:ring-muted'
              }`}
              style={{
                backgroundColor: theme.color,
                color: parseInt(theme.color.replace('#', ''), 16) > 0x7fffff ? '#000' : '#fff',
              }}
            >
              <div className="space-y-2">
                <div className="text-xs font-semibold">{theme.name}</div>
                {theme.description && (
                  <div className="text-xs opacity-70">{theme.description}</div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Custom Color Option */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">Custom Color (Optional)</h3>
          <p className="text-sm text-muted-foreground">
            Add your own custom color
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="color"
            value={customColor || currentTheme?.color || '#2563eb'}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-20 h-20 rounded-lg cursor-pointer"
          />
          <div className="flex-1 p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <div
              className="w-full h-10 rounded-lg shadow-md transition-colors"
              style={{ backgroundColor: customColor || currentTheme?.color }}
            />
          </div>
        </div>
      </motion.div>

      {/* Quantity Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">Quantity</h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-2 hover:bg-secondary transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-6 py-2 font-semibold text-foreground min-w-[60px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-2 hover:bg-secondary transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">
            {quantity} {quantity === 1 ? 'item' : 'items'}
          </span>
        </div>
      </motion.div>

      {/* Price & CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4 pt-6 border-t border-border"
      >
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Total Price:</span>
          <span className="text-4xl font-bold text-primary">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="w-full btn-primary text-lg py-4"
        >
          Add to Cart
        </motion.button>

        <p className="text-xs text-muted-foreground text-center">
          30-day money-back guarantee • Lifetime access
        </p>
      </motion.div>
    </div>
  )
}
