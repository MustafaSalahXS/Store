'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, SlidersHorizontal, Check, Sparkles } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { StoreFilter } from './types'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  editingFilter: StoreFilter | null
  onSave: (data: Partial<StoreFilter>) => Promise<void>
  t: (key: string, fallback?: string) => string
}

export default function FilterModal({
  isOpen,
  onClose,
  editingFilter,
  onSave,
  t
}: FilterModalProps) {
  const { isRTL } = useLanguage()
  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [type, setType] = useState('category')
  const [options, setOptions] = useState<string[]>([])
  const [newOptionInput, setNewOptionInput] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [position, setPosition] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Popular smart presets based on filter type
  const TYPE_PRESETS: Record<string, { label: string; value: string }[]> = {
    category: [
      { label: 'قمصان (Shirts)', value: 'Shirts' },
      { label: 'بدل (Suits)', value: 'Suits' },
      { label: 'فساتين (Dresses)', value: 'Dresses' },
      { label: 'بناطيل (Trousers)', value: 'Trousers' },
      { label: 'أحذية (Shoes)', value: 'Shoes' },
      { label: 'حقائب (Bags)', value: 'Bags' }
    ],
    material: [
      { label: 'حرير (Silk)', value: 'Silk' },
      { label: 'كتان (Linen)', value: 'Linen' },
      { label: 'كشمير (Cashmere)', value: 'Cashmere' },
      { label: 'قطن مصري (Egyptian Cotton)', value: 'Egyptian Cotton' },
      { label: 'صوف (Wool)', value: 'Wool' }
    ],
    collection: [
      { label: 'أرشيف كوتور (Haute Couture)', value: 'Haute Couture' },
      { label: 'إصدار محدود (Limited Edition)', value: 'Limited Edition' },
      { label: 'تشكيلة صيفية (Summer Collection)', value: 'Summer Collection' },
      { label: 'تشكيلة شتوية (Winter Archive)', value: 'Winter Archive' }
    ],
    season: [
      { label: 'Spring (ربيع)', value: 'Spring' },
      { label: 'Summer (صيف)', value: 'Summer' },
      { label: 'Autumn (خريف)', value: 'Autumn' },
      { label: 'Winter (شتاء)', value: 'Winter' }
    ],
    tag: [
      { label: 'Slim Fit', value: 'Slim Fit' },
      { label: 'Relaxed Fit', value: 'Relaxed Fit' },
      { label: 'Oversized', value: 'Oversized' },
      { label: 'Bespoke Tailored', value: 'Bespoke Tailored' }
    ]
  }

  useEffect(() => {
    if (editingFilter) {
      setNameEn(editingFilter.nameEn || '')
      setNameAr(editingFilter.nameAr || '')
      setType(editingFilter.type || 'category')
      setOptions(Array.isArray(editingFilter.options) ? [...editingFilter.options] : [])
      setIsActive(editingFilter.isActive !== false)
      setPosition(editingFilter.position || 1)
    } else {
      setNameEn('')
      setNameAr('')
      setType('category')
      setOptions([])
      setIsActive(true)
      setPosition(1)
    }
    setNewOptionInput('')
  }, [editingFilter, isOpen])

  const handleAddOption = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = newOptionInput.trim()
    if (!trimmed) return
    if (!options.includes(trimmed)) {
      setOptions([...options, trimmed])
    }
    setNewOptionInput('')
  }

  const handleAddPresetValue = (val: string) => {
    if (!options.includes(val)) {
      setOptions([...options, val])
    }
  }

  const handleRemoveOption = (opt: string) => {
    setOptions(options.filter(o => o !== opt))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameEn.trim() || !nameAr.trim()) {
      alert(isRTL ? 'يرجى إدخال اسم الفلتر باللغتين العربية والإنجليزية.' : 'Please provide both English and Arabic filter names.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim(),
        type,
        options,
        isActive,
        position: Number(position) || 0
      })
      onClose()
    } catch (error) {
      console.error('Error saving filter:', error)
      alert(isRTL ? 'فشل حفظ الفلتر.' : 'Failed to save filter.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-stone-900/60 backdrop-blur-xs"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-stone-100 relative max-h-[92vh] flex flex-col"
          >
            {/* Mobile swipe indicator */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-1 mb-3 sm:hidden shrink-0" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 leading-tight">
                  {editingFilter
                    ? (isRTL ? 'تعديل مجموعة الفلتر والتصنيف' : 'Edit Filter Group')
                    : (isRTL ? 'إضافة مجموعة تصنيف أو فلتر جديدة' : 'New Filter Group')}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-400 font-medium">
                  {editingFilter
                    ? (isRTL ? 'تحديث الاسم والقيم المعروضة بالمتجر' : 'Update filter properties and values')
                    : (isRTL ? 'إنشاء تصنيف جديد لتصفية منتجات الكتالوج' : 'Create a new storefront filter category or attribute')}
                </p>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 pb-2">
              {/* English & Arabic Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                    {isRTL ? 'اسم الفلتر (إنجليزي) *' : 'Filter Name (EN) *'}
                  </label>
                  <input
                    required
                    value={nameEn}
                    onChange={e => setNameEn(e.target.value)}
                    placeholder="e.g. Luxury Fabrics"
                    className="w-full p-2.5 sm:p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                    {isRTL ? 'اسم الفلتر (عربي) *' : 'Filter Name (AR) *'}
                  </label>
                  <input
                    required
                    dir="rtl"
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                    placeholder="مثال: الخامات والأقمشة"
                    className="w-full p-2.5 sm:p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Type and Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                    {isRTL ? 'نوع الفلتر' : 'Filter Type'}
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full p-2.5 sm:p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 outline-none focus:bg-white focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="category">{isRTL ? 'تصنيف رئيسي (Category)' : 'Category (تصنيف رئيسي)'}</option>
                    <option value="collection">{isRTL ? 'تشكيلة خاصة (Collection)' : 'Collection (تشكيلة خاصة)'}</option>
                    <option value="material">{isRTL ? 'خامة وقماش (Material)' : 'Material / Fabric (خامة)'}</option>
                    <option value="tag">{isRTL ? 'سمة وقصة (Fit / Tag)' : 'Tag / Silhouette (سمة وقصة)'}</option>
                    <option value="season">{isRTL ? 'موسم (Season)' : 'Season (موسم)'}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                    {isRTL ? 'ترتيب الظهور' : 'Display Order'}
                  </label>
                  <input
                    type="number"
                    value={position}
                    onChange={e => setPosition(Number(e.target.value))}
                    className="w-full p-2.5 sm:p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Options & Values Section */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                    {isRTL ? 'القيم والخيارات المتاحة' : 'Filter Options & Values'}
                  </label>
                  <span className="text-[10px] text-stone-500 font-mono font-bold">
                    {options.length} {isRTL ? 'قيم' : 'values'}
                  </span>
                </div>

                {/* Quick Presets for fast mobile tapping */}
                {TYPE_PRESETS[type] && (
                  <div className="space-y-1 bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-amber-900 flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{isRTL ? 'اقتراحات سريعة بنقرة واحدة:' : 'Quick Presets (Tap to Add):'}</span>
                    </span>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {TYPE_PRESETS[type].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddPresetValue(preset.value)}
                          className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 rounded-lg text-[10px] font-bold transition-all active:scale-95 flex items-center gap-0.5"
                        >
                          <Plus className="w-2.5 h-2.5 text-amber-600" />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input row */}
                <div className="flex gap-2">
                  <input
                    value={newOptionInput}
                    onChange={e => setNewOptionInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddOption()
                      }
                    }}
                    placeholder={isRTL ? 'اكتب قيمة جديدة ثم اضغط إضافة...' : 'Type value & tap Add...'}
                    className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:bg-white focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddOption()}
                    className="px-4 py-2 bg-stone-900 hover:bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>

                {/* Options Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1 max-h-32 overflow-y-auto">
                  {options.map((opt, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-bold border border-stone-200/80"
                    >
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt)}
                        className="w-4 h-4 rounded-full hover:bg-rose-500 hover:text-white text-stone-400 flex items-center justify-center transition-colors"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {options.length === 0 && (
                    <span className="text-[11px] text-stone-400 italic">
                      {isRTL ? 'لم يتم إضافة قيم بعد. أضف بعض القيم بالأعلى.' : 'No values added yet. Add some above.'}
                    </span>
                  )}
                </div>
              </div>

              {/* Active on Storefront Toggle */}
              <div className="pt-1">
                <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl cursor-pointer border border-stone-200/70">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {isRTL ? 'تفعيل الفلتر في واجهة المتجر' : 'Enable on Customer Storefront'}
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {isRTL ? 'إظهار هذا الفلتر للمتسوقين في صفحة المنتجات' : 'Show this filter to normal shoppers in catalog'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="rounded border-stone-300 text-primary focus:ring-primary w-5 h-5 cursor-pointer"
                  />
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors active:scale-95"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting
                    ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
                    : editingFilter
                    ? (isRTL ? 'حفظ التعديلات' : 'Save Changes')
                    : (isRTL ? 'إنشاء الفلتر' : 'Create Filter')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
