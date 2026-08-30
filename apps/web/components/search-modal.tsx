'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, ArrowRight, Sparkles, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/currency'
import { useStore } from '@/lib/store-context'
import { useLanguage } from '@/lib/language-context'
import Link from 'next/link'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const { currentStore } = useStore()
  const { t, isRTL } = useLanguage()
  const currency = currentStore?.currency || 'USD'

  const [query, setQuery] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('store_search_history')
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (e) {
      console.error(e)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      if (allProducts.length === 0) {
        setLoading(true)
        api.products.list()
          .then((data) => setAllProducts(Array.isArray(data) ? data : []))
          .catch(console.error)
          .finally(() => setLoading(false))
      }
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const q = query.toLowerCase()
    const filtered = allProducts.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.gender?.toLowerCase().includes(q)
    ).slice(0, 6)
    setResults(filtered)
  }, [query, allProducts])

  const saveQueryToHistory = (searchTerm: string) => {
    const term = searchTerm.trim()
    if (!term) return
    const updated = [term, ...history.filter((h) => h.toLowerCase() !== term.toLowerCase())].slice(0, 8)
    setHistory(updated)
    try {
      localStorage.setItem('store_search_history', JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
  }

  const removeHistoryItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = history.filter((h) => h !== term)
    setHistory(updated)
    try {
      localStorage.setItem('store_search_history', JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
  }

  const clearAllHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem('store_search_history')
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectProduct = (productId: string) => {
    if (query.trim()) {
      saveQueryToHistory(query)
    }
    onClose()
    router.push(`/product/${productId}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveQueryToHistory(query)
      onClose()
      router.push(`/?search=${encodeURIComponent(query.trim())}#product-feed`)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/65 backdrop-blur-md">
          {/* Click outside backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 z-10"
          >
            {/* Search Input Header */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center p-4 sm:p-5 border-b border-stone-100">
              <Search className="w-5 h-5 text-stone-400 shrink-0 ml-1 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-1 bg-transparent text-sm sm:text-base font-jost text-stone-900 placeholder:text-stone-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-900 mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-jost text-xs font-bold uppercase tracking-wider"
              >
                ESC
              </button>
            </form>

            <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Search History Section */}
              {!query && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{t('search.recent')}</span>
                    </span>
                    {history.length > 0 && (
                      <button
                        onClick={clearAllHistory}
                        className="text-[10px] font-jost font-bold uppercase tracking-wider text-rose-600 hover:underline"
                      >
                        {t('search.clearAll')}
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <p className="font-jost text-xs text-stone-400 py-4 text-center">
                      {t('search.noRecent')}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {history.map((term, i) => (
                        <div
                          key={i}
                          onClick={() => setQuery(term)}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-jost font-medium cursor-pointer transition-all group"
                        >
                          <Clock className="w-3 h-3 text-stone-400 group-hover:text-stone-900" />
                          <span>{term}</span>
                          <button
                            onClick={(e) => removeHistoryItem(term, e)}
                            className="text-stone-400 hover:text-rose-600 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Instant Search Results */}
              {query && (
                <div className="space-y-3">
                  <span className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Results ({results.length})
                  </span>

                  {results.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <p className="font-bodoni text-lg font-bold uppercase text-stone-400">
                        No matches found
                      </p>
                      <p className="font-jost text-xs text-stone-500">
                        Try searching for &quot;denim&quot;, &quot;silk&quot;, &quot;tailoring&quot;, or &quot;cashmere&quot;
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {results.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p.id)}
                          className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/80 -mx-2 px-2 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-14 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                              <img
                                src={p.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200'}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-serif font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
                                {p.name}
                              </p>
                              <span className="text-[9px] font-jost font-bold uppercase tracking-wider text-stone-400">
                                {p.category || 'Atelier'} • {p.gender?.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono font-bold text-xs sm:text-sm text-stone-900">
                              {formatPrice(Number(p.discountPrice || p.price), currency)}
                            </span>
                            <ArrowRight className="w-4 h-4 text-stone-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
