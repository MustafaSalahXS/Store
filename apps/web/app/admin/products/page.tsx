'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import { getStoreProducts, createProduct, updateProduct, deleteProduct, AdminProduct } from '@/lib/admin'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Edit, Trash2, AlertCircle, Search } from 'lucide-react'
import Link from 'next/link'

export default function ProductsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentStore } = useStore()

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !['super_admin', 'store_admin'].includes(user.role)) {
      router.push('/dashboard')
      return
    }

    if (currentStore) loadProducts()
  }, [user, currentStore, router])

  const loadProducts = async () => {
    try {
      setLoading(true)
      if (!currentStore) return
      const data = await getStoreProducts(currentStore.id)
      setProducts(data)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setDeletingId(productId)
      const success = await deleteProduct(productId)
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== productId))
        setSuccess('Product deleted successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to delete product')
      }
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
            <p className="text-slate-600">Manage your product catalog</p>
          </div>
          <Link href="/admin">
            <Button>Back to Admin</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Alerts */}
        {error && (
          <Card className="mb-4 p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {success && (
          <Card className="mb-4 p-4 bg-green-50 border-green-200">
            <p className="text-green-800">{success}</p>
          </Card>
        )}

        {/* Search & Create */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Link href="/admin/products/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Product
              </Button>
            </Link>
          </div>
        </Card>

        {/* Products Table */}
        {filteredProducts.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-600">{product.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{product.category}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">EGP {product.price}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          product.is_active
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/admin/products/${product.id}`}>
                            <button className="p-2 hover:bg-slate-100 rounded transition">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="p-2 hover:bg-slate-100 rounded transition disabled:opacity-50"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'No products found matching your search' : 'No products yet'}
            </p>
            {!searchTerm && (
              <Link href="/admin/products/create">
                <Button>Create Your First Product</Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
