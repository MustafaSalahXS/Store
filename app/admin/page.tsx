'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, BarChart3, ShoppingCart, Users, Zap, X, Loader } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import {
  getStoreProducts,
  getStoreOrders,
  createProduct,
  updateProduct,
  deleteProduct,
  AdminProduct,
  AdminOrder
} from '@/lib/admin'

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { currentStore } = useStore()

  // Protect route
  useEffect(() => {
    if (!isAuthLoading && (!user || (user.role !== 'store_admin' && user.role !== 'super_admin'))) {
      window.location.href = '/login'
    }
  }, [user, isAuthLoading])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    sku: '',
    cost: 0,
    is_active: true
  })

  const [themes, setThemes] = useState([
    { id: 'light', name: 'Light', color: 'White', colorHex: '#ffffff' },
    { id: 'dark', name: 'Dark', color: 'Slate', colorHex: '#1f2937' },
    { id: 'blue', name: 'Blue', color: 'Vibrant', colorHex: '#2563eb' },
    { id: 'rose', name: 'Rose', color: 'Modern', colorHex: '#e11d48' },
  ])

  const [showThemeForm, setShowThemeForm] = useState(false)
  const [newTheme, setNewTheme] = useState({ name: '', color: '#ffffff' })

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!currentStore) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const [productsData, ordersData] = await Promise.all([
          getStoreProducts(currentStore.id),
          getStoreOrders(currentStore.id)
        ])
        setProducts(productsData)
        setOrders(ordersData)
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentStore])

  const stats = [
    { label: 'Total Revenue', value: '$12,847', icon: ShoppingCart, color: 'text-primary' },
    { label: 'Total Orders', value: '456', icon: Zap, color: 'text-accent' },
    { label: 'Total Customers', value: '324', icon: Users, color: 'text-primary' },
    { label: 'Avg. Rating', value: '4.9/5', icon: BarChart3, color: 'text-accent' },
  ]

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentStore) return

    setIsSubmitting(true)
    try {
      if (editingProduct) {
        const success = await updateProduct(editingProduct.id, productFormData)
        if (success) {
          setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productFormData } : p))
        }
      } else {
        const newProduct = await createProduct(currentStore.id, productFormData)
        if (newProduct) {
          setProducts([newProduct, ...products])
        }
      }
      setShowProductForm(false)
      setEditingProduct(null)
      setProductFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        sku: '',
        cost: 0,
        is_active: true
      })
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product)
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      sku: product.sku,
      cost: product.cost,
      is_active: product.is_active
    })
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const success = await deleteProduct(productId)
      if (success) {
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleAddTheme = () => {
    if (newTheme.name) {
      setThemes([
        ...themes,
        {
          id: Date.now().toString(),
          name: newTheme.name,
          color: 'Custom',
          colorHex: newTheme.color,
        },
      ])
      setNewTheme({ name: '', color: '#ffffff' })
      setShowThemeForm(false)
    }
  }

  const handleDeleteTheme = (id: string) => {
    setThemes(themes.filter((t) => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="section-container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your products, themes, and orders</p>
        </div>

        {/* Stats Grid */}
        {!currentStore ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Store Linked</h2>
            <p className="text-muted-foreground mb-6">
              You are logged in as an admin, but you haven't created or been assigned to a store yet.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Go to Homepage
            </motion.button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card rounded-xl p-6 border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">{stat.label}</h3>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Products Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Products</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingProduct(null)
                      setProductFormData({
                        name: '',
                        description: '',
                        price: 0,
                        category: '',
                        stock: 0,
                        sku: '',
                        cost: 0,
                        is_active: true
                      })
                      setShowProductForm(true)
                    }}
                    className="btn-primary text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Add Product
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground text-sm">Loading products...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground">No products found. Add your first product!</p>
                    </div>
                  ) : (
                    products.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{product.name}</h3>
                            {!product.is_active && (
                              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase font-bold">Draft</span>
                            )}
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            <span>${Number(product.price).toFixed(2)}</span>
                            <span>{product.category}</span>
                            <span>Stock: {product.stock}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleEditProduct(product)}
                            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-accent" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Product Modal */}
              <AnimatePresence>
                {showProductForm && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                    >
                      <div className="p-6 border-b border-border flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <button
                          onClick={() => setShowProductForm(false)}
                          className="p-2 hover:bg-secondary rounded-full transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSubmitProduct} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <input
                              required
                              value={productFormData.name}
                              onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="e.g. Wedding Invitation Suite"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <input
                              required
                              value={productFormData.category}
                              onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="e.g. Invitations"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Price ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={productFormData.price}
                              onChange={(e) => setProductFormData({ ...productFormData, price: parseFloat(e.target.value) })}
                              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Stock</label>
                            <input
                              type="number"
                              required
                              value={productFormData.stock}
                              onChange={(e) => setProductFormData({ ...productFormData, stock: parseInt(e.target.value) })}
                              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">SKU</label>
                            <input
                              value={productFormData.sku}
                              onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="INV-001"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Cost ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={productFormData.cost}
                              onChange={(e) => setProductFormData({ ...productFormData, cost: parseFloat(e.target.value) })}
                              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <textarea
                            rows={3}
                            value={productFormData.description}
                            onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                            placeholder="Describe your product..."
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="is_active"
                            checked={productFormData.is_active}
                            onChange={(e) => setProductFormData({ ...productFormData, is_active: e.target.checked })}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                          />
                          <label htmlFor="is_active" className="text-sm font-medium">Published</label>
                        </div>

                        <div className="pt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => setShowProductForm(false)}
                            className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : null}
                            {editingProduct ? 'Save Changes' : 'Create Product'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Theme Manager */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Themes</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowThemeForm(!showThemeForm)}
                    className="btn-primary text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Add Theme Form */}
                {showThemeForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-secondary rounded-lg space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Theme name"
                      value={newTheme.name}
                      onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newTheme.color}
                        onChange={(e) => setNewTheme({ ...newTheme, color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddTheme}
                        className="flex-1 btn-primary text-sm"
                      >
                        Create Theme
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Themes List */}
                <div className="space-y-3">
                  {themes.map((theme, idx) => (
                    <motion.div
                      key={theme.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border hover:shadow-md transition-shadow"
                    >
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm border border-border"
                        style={{ backgroundColor: theme.colorHex }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{theme.name}</p>
                        <p className="text-xs text-muted-foreground">{theme.colorHex}</p>
                      </div>
                      {theme.id !== 'light' && theme.id !== 'dark' && theme.id !== 'blue' && theme.id !== 'rose' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDeleteTheme(theme.id)}
                          className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Recent Orders</h2>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground text-sm">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">No orders yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Payment</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Total</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-border hover:bg-secondary transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-medium text-foreground">{order.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${order.order_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              order.order_status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                'bg-primary/20 text-primary'
                              }`}>
                              {order.order_status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${order.payment_status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                              'bg-muted text-muted-foreground'
                              }`}>
                              {order.payment_status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-primary">${Number(order.total).toFixed(2)}</td>
                          <td className="py-4 px-4 text-muted-foreground" suppressHydrationWarning>
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
        </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
