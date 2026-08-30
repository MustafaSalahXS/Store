'use client'

import React, { useState, useMemo } from 'react'
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Search,
  Plus,
  Minus,
  Layers,
  RefreshCw,
  Edit,
  ArrowUpDown,
  Coins,
  X,
  Sparkles,
  SlidersHorizontal,
  Check
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'

interface InventorySectionProps {
  products: any[]
  currentStore: any
  onUpdateStock: (productId: string, newStock: number) => void
  onOpenEditProduct: (product: any) => void
  t: (key: string, fallback?: string) => string
}

export default function InventorySection({
  products,
  currentStore,
  onUpdateStock,
  onOpenEditProduct,
  t
}: InventorySectionProps) {
  const { isRTL } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'in'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc' | 'valuation_desc'>('stock_asc')
  const [batchRestockOpen, setBatchRestockOpen] = useState(false)
  const [restockAmount, setRestockAmount] = useState<number>(10)
  const [editingStockMap, setEditingStockMap] = useState<{ [id: string]: number }>({})

  // Calculations
  const totalUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0)
  const retailValue = products.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0), 0)
  const costValue = products.reduce((acc, p) => acc + (Number(p.cost) || 0) * (Number(p.stock) || 0), 0)
  const lowStockCount = products.filter(p => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 5).length
  const outOfStockCount = products.filter(p => (Number(p.stock) || 0) <= 0).length

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = (p.name || '').toLowerCase().includes(q)
        const matchSku = (p.sku || '').toLowerCase().includes(q)
        const matchCat = (p.category || '').toLowerCase().includes(q)
        if (!matchName && !matchSku && !matchCat) return false
      }

      const stock = Number(p.stock) || 0
      if (stockFilter === 'low') return stock > 0 && stock <= 5
      if (stockFilter === 'out') return stock <= 0
      if (stockFilter === 'in') return stock > 5
      return true
    })

    // Sorting
    result.sort((a, b) => {
      const stockA = Number(a.stock) || 0
      const stockB = Number(b.stock) || 0
      if (sortBy === 'stock_asc') return stockA - stockB
      if (sortBy === 'stock_desc') return stockB - stockA
      if (sortBy === 'valuation_desc') {
        return (stockB * (Number(b.price) || 0)) - (stockA * (Number(a.price) || 0))
      }
      return (a.name || '').localeCompare(b.name || '')
    })

    return result
  }, [products, searchQuery, stockFilter, sortBy])

  const handleBatchRestock = () => {
    if (isNaN(restockAmount) || restockAmount <= 0) return
    filteredProducts.forEach(p => {
      onUpdateStock(p.id, (Number(p.stock) || 0) + restockAmount)
    })
    setBatchRestockOpen(false)
  }

  const handleSetStockValue = (productId: string, val: number) => {
    const safeVal = Math.max(0, val)
    onUpdateStock(productId, safeVal)
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* 4 Inventory Metric Cards (Mobile Optimized) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {/* Total Stock Units */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {t('admin.totalStockUnits', 'Total Stock Units')}
            </span>
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-stone-900">
            {totalUnits} <span className="text-xs sm:text-sm font-bold text-stone-500">units</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5">
            Across {products.length} SKUs
          </span>
        </div>

        {/* Retail Valuation */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {t('admin.inventoryRetailValue', 'Retail Valuation')}
            </span>
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-green-600 truncate">
            {formatPrice(retailValue, currentStore?.currency || 'USD')}
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5">
            Estimated Inventory Worth
          </span>
        </div>

        {/* Low Stock Filter Card */}
        <div
          onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
            stockFilter === 'low'
              ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-card border-border hover:border-amber-300'
          }`}
        >
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 truncate">
              {t('admin.lowStockAlerts', 'Low Stock (≤ 5)')}
            </span>
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-amber-600">
            {lowStockCount} <span className="text-xs sm:text-sm font-bold text-amber-700">items</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-amber-600/80 font-medium block mt-0.5">
            Needs replenishment soon
          </span>
        </div>

        {/* Out of Stock Filter Card */}
        <div
          onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
            stockFilter === 'out'
              ? 'bg-rose-500/15 border-rose-500 shadow-md ring-2 ring-rose-500/20'
              : 'bg-card border-border hover:border-rose-300'
          }`}
        >
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 truncate">
              {t('admin.outOfStock', 'Out of Stock (0)')}
            </span>
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-rose-600">
            {outOfStockCount} <span className="text-xs sm:text-sm font-bold text-rose-700">items</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-rose-600/80 font-medium block mt-0.5">
            Depleted inventory
          </span>
        </div>
      </div>

      {/* Toolbar (Search, Filter Pills & Batch Restock) */}
      <div className="bg-card rounded-2xl p-3.5 sm:p-5 border border-border space-y-3 shadow-xs">
        {/* Search Bar + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin.searchInventory', 'Search product by name, SKU, or category...')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-secondary/50 border border-border rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center bg-secondary/60 border border-border rounded-xl px-2.5 py-2 text-xs font-bold shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 mr-1.5" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent outline-none cursor-pointer text-stone-800 text-xs font-bold"
              >
                <option value="stock_asc">Stock: Low → High</option>
                <option value="stock_desc">Stock: High → Low</option>
                <option value="valuation_desc">Valuation: High → Low</option>
                <option value="name">Name: A → Z</option>
              </select>
            </div>

            {/* Batch Restock Button */}
            <button
              onClick={() => setBatchRestockOpen(true)}
              className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Batch Restock</span>
              <span className="xs:hidden">Restock</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Strip (Scrollable on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              stockFilter === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-secondary/50 text-stone-600 hover:bg-secondary'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
              stockFilter === 'low'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Low Stock (≤5)</span>
            <span className="font-mono opacity-80">({lowStockCount})</span>
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
              stockFilter === 'out'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <TrendingDown className="w-3 h-3" />
            <span>Out of Stock</span>
            <span className="font-mono opacity-80">({outOfStockCount})</span>
          </button>
          <button
            onClick={() => setStockFilter('in')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
              stockFilter === 'in'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>In Stock (&gt;5)</span>
            <span className="font-mono opacity-80">({products.length - lowStockCount - outOfStockCount})</span>
          </button>
        </div>
      </div>

      {/* Inventory List Container */}
      <div className="bg-card rounded-2xl sm:rounded-[2rem] border border-border p-3.5 sm:p-6 md:p-8 shadow-sm sm:shadow-xl">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-stone-900 flex items-center gap-2">
              <span>{t('admin.inventoryLedger', 'Live Inventory Ledger')}</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground font-mono">
                ({filteredProducts.length} items)
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium">
              Real-time product stock control, unit cost valuation, and instant stock adjustments.
            </p>
          </div>
        </div>

        {/* MOBILE INVENTORY CARDS (Designed specifically for phone screens) */}
        <div className="md:hidden space-y-3.5">
          {filteredProducts.map(p => {
            const stock = Number(p.stock) || 0
            const unitPrice = Number(p.price) || 0
            const unitCost = Number(p.cost) || 0
            const totalItemValuation = stock * unitPrice

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/80 space-y-3.5 shadow-xs hover:border-stone-400 transition-all"
              >
                {/* Top Row: Thumbnail, Title, SKU, Price */}
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 relative">
                    <img
                      src={p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    {stock <= 0 && (
                      <span className="absolute inset-0 bg-rose-900/60 flex items-center justify-center text-[8px] font-black text-white uppercase tracking-wider">
                        Depleted
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 truncate">
                        {p.category || 'General'}
                      </span>
                      <button
                        onClick={() => onOpenEditProduct(p)}
                        className="p-1 text-stone-400 hover:text-stone-900 rounded-lg shrink-0"
                        title="Edit Full Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm truncate leading-tight">
                      {p.name}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-stone-500">
                      <span>SKU: {p.sku || 'N/A'}</span>
                      {unitCost > 0 && (
                        <span>• Cost: {formatPrice(unitCost, currentStore?.currency || 'USD')}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-black text-primary font-mono">
                        {formatPrice(unitPrice, currentStore?.currency || 'USD')}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Value: {formatPrice(totalItemValuation, currentStore?.currency || 'USD')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock Status Pill + Quick Presets Row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-stone-400">Status:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        stock <= 0
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : stock <= 5
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {stock <= 0 ? 'Out of Stock' : stock <= 5 ? `Low Stock (${stock})` : `In Stock (${stock})`}
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSetStockValue(p.id, stock + 5)}
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-black active:scale-95"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleSetStockValue(p.id, stock + 10)}
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-black active:scale-95"
                    >
                      +10
                    </button>
                    {stock > 0 && (
                      <button
                        onClick={() => handleSetStockValue(p.id, 0)}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black active:scale-95"
                        title="Set to Out of Stock"
                      >
                        Set 0
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Touch Adjuster Controls: [-] [Input Number] [+] */}
                <div className="flex items-center justify-between gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200/70">
                  <span className="text-xs font-bold text-stone-700 pl-1">Adjust Quantity:</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSetStockValue(p.id, Math.max(0, stock - 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-stone-300 text-stone-800 flex items-center justify-center font-bold hover:bg-stone-100 active:scale-90 transition-all shadow-xs"
                      aria-label="Decrease Stock"
                    >
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={e => handleSetStockValue(p.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-10 text-center font-mono font-black text-sm bg-white border border-stone-300 rounded-xl outline-none focus:border-primary shadow-xs"
                    />

                    <button
                      onClick={() => handleSetStockValue(p.id, stock + 1)}
                      className="w-10 h-10 rounded-xl bg-white border border-stone-300 text-stone-800 flex items-center justify-center font-bold hover:bg-stone-100 active:scale-90 transition-all shadow-xs"
                      aria-label="Increase Stock"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Sizes or Colors Preview (if present) */}
                {Array.isArray(p.sizes) && p.sizes.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    <span className="text-[9px] font-bold uppercase text-stone-400">Sizes:</span>
                    {p.sizes.map((s: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded text-[9px] font-bold font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center text-muted-foreground font-bold italic text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-2">
              <Package className="w-8 h-8 mx-auto text-stone-300" />
              <p>No products match your inventory filter.</p>
              <button
                onClick={() => { setSearchQuery(''); setStockFilter('all'); }}
                className="text-primary font-black underline text-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* DESKTOP INVENTORY TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="py-4 px-3 font-black">Item & SKU</th>
                <th className="py-4 px-3 font-black">Category</th>
                <th className="py-4 px-3 font-black">Unit Cost</th>
                <th className="py-4 px-3 font-black">Unit Price</th>
                <th className="py-4 px-3 font-black">Total Stock</th>
                <th className="py-4 px-3 font-black">Valuation</th>
                <th className="py-4 px-3 text-right font-black">Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map(p => {
                const stock = Number(p.stock) || 0
                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                          <img
                            src={p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80'}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 text-sm">{p.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">SKU: {p.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-xs font-bold uppercase text-stone-500">
                      {p.category || 'General'}
                    </td>

                    <td className="py-4 px-3 font-mono text-xs font-bold text-stone-600">
                      {formatPrice(p.cost || 0, currentStore?.currency || 'USD')}
                    </td>

                    <td className="py-4 px-3 font-mono text-xs font-bold text-stone-900">
                      {formatPrice(p.price, currentStore?.currency || 'USD')}
                    </td>

                    <td className="py-4 px-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          stock <= 0
                            ? 'bg-rose-100 text-rose-600'
                            : stock <= 5
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {stock} units
                      </span>
                    </td>

                    <td className="py-4 px-3 font-mono text-xs font-bold text-stone-800">
                      {formatPrice(stock * (Number(p.price) || 0), currentStore?.currency || 'USD')}
                    </td>

                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSetStockValue(p.id, Math.max(0, stock - 1))}
                          className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-200 active:scale-95"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={stock}
                          onChange={e => handleSetStockValue(p.id, Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-14 text-center font-mono font-bold text-xs p-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none"
                        />
                        <button
                          onClick={() => handleSetStockValue(p.id, stock + 1)}
                          className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-200 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditProduct(p)}
                          className="p-2 text-stone-400 hover:text-stone-900 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground font-bold italic text-sm">
                    No products found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Restock Modal (Mobile Responsive Bottom Sheet / Centered Modal) */}
      {batchRestockOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-stone-100">
            {/* Mobile swipe handle */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-1 mb-2 sm:hidden" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900">Batch Inventory Restock</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Add stock in bulk to all {filteredProducts.length} filtered products.
                </p>
              </div>
              <button
                onClick={() => setBatchRestockOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-full text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Quantity to add per product
              </label>
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={e => setRestockAmount(parseInt(e.target.value) || 0)}
                className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xl font-black text-stone-900 outline-none text-center"
              />

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                {[5, 10, 20, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRestockAmount(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                      restockAmount === val
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-3 border-t border-stone-100">
              <button
                onClick={() => setBatchRestockOpen(false)}
                className="flex-1 sm:flex-none px-5 py-3 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchRestock}
                className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-98"
              >
                Apply Restock (+{restockAmount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
