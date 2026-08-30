'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Product } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  X, 
  Check, 
  Archive, 
  Tag, 
  Layers, 
  Palette, 
  RefreshCw 
} from 'lucide-react'
import Link from 'next/link'

export default function AdminProductsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('tailoring')
  const [gender, setGender] = useState('both')
  const [price, setPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [cost, setCost] = useState('')
  const [stock, setStock] = useState('10')
  const [sku, setSku] = useState('')
  const [image, setImage] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isPastCollection, setIsPastCollection] = useState(false)

  // Color Variants
  const [colors, setColors] = useState<Array<{ name: string; hex: string }>>([
    { name: 'Onyx Black', hex: '#09090B' },
  ])
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#000000')

  // Sizes
  const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL'])

  useEffect(() => {
    if (!user) return
    const allowed = ['admin', 'super_admin', 'store_admin']
    if (!allowed.includes(user.role)) {
      router.push('/dashboard')
      return
    }
    loadProducts()
  }, [user])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.products.list()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedProductId(null)
    setName('')
    setDescription('')
    setCategory('tailoring')
    setGender('both')
    setPrice('150')
    setDiscountPrice('')
    setCost('60')
    setStock('15')
    setSku(`SKU-${Date.now().toString().slice(-6)}`)
    setImage('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000')
    setVideoUrl('')
    setIsActive(true)
    setIsPastCollection(false)
    setColors([
      { name: 'Onyx Black', hex: '#09090B' },
      { name: 'Ivory Cream', hex: '#FDFBF7' },
    ])
    setSelectedSizes(['S', 'M', 'L', 'XL'])
    setIsModalOpen(true)
  }

  const openEditModal = (p: Product) => {
    setModalMode('edit')
    setSelectedProductId(p.id)
    setName(p.name)
    setDescription(p.description || '')
    setCategory(p.category || 'tailoring')
    setGender(p.gender || 'both')
    setPrice(String(p.price || ''))
    setDiscountPrice(p.discountPrice ? String(p.discountPrice) : '')
    setCost(p.cost ? String(p.cost) : '')
    setStock(String(p.stock ?? 0))
    setSku(p.sku || '')
    setImage(p.image || '')
    setVideoUrl(p.videoUrl || '')
    setIsActive(p.isActive)
    setIsPastCollection(Boolean(p.isPastCollection || p.customizationOptions?.isPastCollection))

    const existingColors = p.colors || p.customizationOptions?.colors
    setColors(
      Array.isArray(existingColors) && existingColors.length > 0
        ? existingColors
        : [{ name: 'Onyx Black', hex: '#09090B' }]
    )
    setSelectedSizes(Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L'])
    setIsModalOpen(true)
  }

  const handleAddColor = () => {
    if (!newColorName.trim()) return
    setColors((prev) => [...prev, { name: newColorName.trim(), hex: newColorHex }])
    setNewColorName('')
  }

  const handleRemoveColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const payload: Partial<Product> = {
      name,
      description,
      category,
      gender,
      price: Number(price) || 0,
      discountPrice: discountPrice ? Number(discountPrice) : null as any,
      cost: Number(cost) || 0,
      stock: Number(stock) || 0,
      sku,
      image,
      videoUrl: videoUrl.trim() || undefined,
      isActive,
      isPastCollection,
      sizes: selectedSizes,
      colors,
      customizationOptions: {
        colors,
        isPastCollection,
      },
    }

    try {
      if (modalMode === 'create') {
        const created = await api.products.create(payload)
        setProducts((prev) => [created, ...prev])
        setSuccess('Product established successfully!')
      } else if (selectedProductId) {
        const updated = await api.products.update(selectedProductId, payload)
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProductId ? { ...p, ...updated } : p))
        )
        setSuccess('Product updated successfully!')
      }
      setIsModalOpen(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err?.message || 'Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleArchive = async (p: Product) => {
    const nextStatus = !(p.isPastCollection || p.customizationOptions?.isPastCollection)
    try {
      const updated = await api.products.update(p.id, {
        isPastCollection: nextStatus,
        customizationOptions: {
          ...(p.customizationOptions || {}),
          isPastCollection: nextStatus,
        },
      })
      setProducts((prev) =>
        prev.map((it) =>
          it.id === p.id ? { ...it, isPastCollection: nextStatus } : it
        )
      )
    } catch (err: any) {
      alert(`Could not update archive status: ${err?.message}`)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setDeletingId(productId)
      const res = await api.products.delete(productId)
      if (res?.success !== false) {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
        setSuccess('Product removed successfully')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Responsive Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 px-2.5">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight">
                Product Catalog
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Manage color options, sizes, gender portals, and archive status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              onClick={loadProducts}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> 
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={openCreateModal}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Alerts */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200 text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="p-4 bg-emerald-50 border-emerald-200 text-emerald-800 flex items-center gap-3">
            <Check className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{success}</p>
          </Card>
        )}

        {/* Search */}
        <Card className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, category, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 text-xs sm:text-sm"
            />
          </div>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Loading Products...
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            {/* Mobile Cards View (< md) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredProducts.map((p) => {
                const isArchival = Boolean(
                  p.isPastCollection || p.customizationOptions?.isPastCollection
                )
                const pColors = p.colors || p.customizationOptions?.colors || []

                return (
                  <Card key={p.id} className="p-4 bg-white shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={
                            p.image ||
                            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200'
                          }
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
                            {p.gender || 'both'}
                          </span>
                          <span className="font-mono font-bold text-sm text-slate-900">
                            EGP {Number(p.price).toFixed(2)}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-xs truncate mt-0.5">{p.name}</p>
                        <p className="font-mono text-[10px] text-slate-500">{p.sku}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      {/* Swatches */}
                      <div className="flex items-center gap-1">
                        {pColors.map((col: any, idx: number) => (
                          <span
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-sm shrink-0"
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          />
                        ))}
                      </div>

                      {/* Stock Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          p.stock > 5
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.stock > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.stock} units
                      </span>

                      {/* Archive Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleArchive(p)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition ${
                          isArchival
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isArchival ? 'Archive' : 'Current'}
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Desktop Table View (>= md) */}
            <Card className="hidden md:block overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Garment</th>
                      <th className="px-4 py-3">Portal / Category</th>
                      <th className="px-4 py-3">Colors</th>
                      <th className="px-4 py-3">Sizes</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Collection</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredProducts.map((p) => {
                      const isArchival = Boolean(
                        p.isPastCollection || p.customizationOptions?.isPastCollection
                      )
                      const pColors = p.colors || p.customizationOptions?.colors || []

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                <img
                                  src={
                                    p.image ||
                                    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200'
                                  }
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{p.name}</p>
                                <p className="font-mono text-[10px] text-slate-500">{p.sku}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                              {p.gender || 'both'}
                            </span>
                            <p className="text-[11px] text-slate-500 capitalize mt-0.5">
                              {p.category || 'Apparel'}
                            </p>
                          </td>

                          {/* Colors Preview */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap max-w-[120px]">
                              {pColors.length > 0 ? (
                                pColors.map((col: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="w-4 h-4 rounded-full border border-slate-300 shadow-sm shrink-0"
                                    style={{ backgroundColor: col.hex }}
                                    title={col.name}
                                  />
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400">Default</span>
                              )}
                            </div>
                          </td>

                          {/* Sizes Preview */}
                          <td className="px-4 py-3 font-mono font-semibold text-slate-600">
                            {Array.isArray(p.sizes) && p.sizes.length > 0
                              ? p.sizes.join(', ')
                              : 'N/A'}
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">
                            EGP {Number(p.price).toFixed(2)}
                          </td>

                          {/* Stock */}
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.stock > 5
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.stock > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>

                          {/* Collection Status */}
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleToggleArchive(p)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                                isArchival
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              title="Click to toggle between Current Season and Archive"
                            >
                              {isArchival ? 'Archive' : 'Current'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
                                title="Edit Garment"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                disabled={deletingId === p.id}
                                className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition disabled:opacity-50"
                                title="Delete Garment"
                              >
                                {deletingId === p.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-12 text-center text-slate-400">
            <p className="text-xs font-bold uppercase tracking-wider mb-4">
              No products found
            </p>
            <Button onClick={openCreateModal}>Create Your First Garment</Button>
          </Card>
        )}
      </div>

      {/* Responsive Modal for Create / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
                  {modalMode === 'create' ? 'Create New Garment' : 'Edit Garment Details'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configure color swatches, sizes, and collection status
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 text-xs">
              {/* Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    Garment Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cashmere Overcoat"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. SKU-01"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              {/* Portal & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    Gender Portal
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs"
                  >
                    <option value="both">Unisex / Both</option>
                    <option value="men">Men&apos;s Atelier (/men)</option>
                    <option value="women">Women&apos;s Atelier (/women)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs"
                  >
                    <option value="tailoring">Suits & Tailoring</option>
                    <option value="dresses">Gowns & Evening</option>
                    <option value="knitwear">Cashmere & Knitwear</option>
                    <option value="silks">Silks & Blouses</option>
                    <option value="outerwear">Coats & Outerwear</option>
                    <option value="footwear">Fine Footwear</option>
                    <option value="accessories">Handbags & Accessories</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Stock - Mobile 2-cols */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    Retail Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    Discount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Stock</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              {/* Color Swatches Manager */}
              <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase text-[10px] flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> Color Variants & Swatches
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {colors.length} active
                  </span>
                </div>

                {/* Current Colors */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {colors.map((col, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(i)}
                        className="text-slate-400 hover:text-rose-600 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Color Sub-form */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-8 h-8 p-0.5 rounded-lg border border-slate-300 cursor-pointer bg-white shrink-0"
                  />
                  <input
                    type="text"
                    placeholder="e.g. Camel Tan"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="flex-1 p-2 border border-slate-200 rounded-xl bg-white text-xs min-w-0"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddColor}
                    className="shrink-0 text-xs font-bold"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Sizes Selector */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 uppercase text-[10px]">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {AVAILABLE_SIZES.map((sz) => {
                    const isSelected = selectedSizes.includes(sz)
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sz}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Archive / Collection Status Toggle */}
              <div className="p-3 sm:p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-amber-700 shrink-0" /> Past Collection / Archive
                  </p>
                  <p className="text-[10px] text-amber-800/80 mt-0.5">
                    Display in the permanent Archival Vault and Past Collections section.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isPastCollection}
                  onChange={(e) => setIsPastCollection(e.target.checked)}
                  className="w-5 h-5 accent-amber-600 rounded cursor-pointer shrink-0"
                />
              </div>

              {/* Image & Video URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    Primary Image URL
                  </label>
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    Fashion Film / Video URL (Optional MP4)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://commondatastorage.googleapis.com/...mp4"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">
                  Materiality & Story
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tailored with double-faced virgin wool..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 sm:px-6 text-xs"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : modalMode === 'create' ? (
                    'Establish Garment'
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
