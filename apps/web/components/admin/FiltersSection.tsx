'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  SlidersHorizontal, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Layers, 
  Tag, 
  Sparkles, 
  Eye, 
  EyeOff,
  FolderTree,
  CheckCircle2
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { StoreFilter } from './types'

interface FiltersSectionProps {
  filters: StoreFilter[]
  onAddFilter: () => void
  onEditFilter: (filter: StoreFilter) => void
  onDeleteFilter: (id: string) => Promise<void>
  onToggleFilterStatus: (filter: StoreFilter) => Promise<void>
  t: (key: string, fallback?: string) => string
}

export default function FiltersSection({
  filters,
  onAddFilter,
  onEditFilter,
  onDeleteFilter,
  onToggleFilterStatus,
  t
}: FiltersSectionProps) {
  const { isRTL } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  const totalOptionsCount = filters.reduce(
    (sum, f) => sum + (Array.isArray(f.options) ? f.options.length : 0),
    0
  )
  const activeCount = filters.filter(f => f.isActive).length
  const hiddenCount = filters.length - activeCount

  const filteredList = useMemo(() => {
    return filters.filter(f => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = 
        !q ||
        f.nameEn.toLowerCase().includes(q) ||
        f.nameAr.toLowerCase().includes(q) ||
        (Array.isArray(f.options) && f.options.some(opt => opt.toLowerCase().includes(q)))

      const matchesType = selectedType === 'all' || f.type === selectedType
      return matchesSearch && matchesType
    })
  }, [filters, searchQuery, selectedType])

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'category':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            {isRTL ? 'تصنيف رئيسي' : 'Category'}
          </span>
        )
      case 'collection':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            {isRTL ? 'تشكيلة خاصة' : 'Collection'}
          </span>
        )
      case 'material':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            {isRTL ? 'خامات وأقمشة' : 'Material'}
          </span>
        )
      case 'tag':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            {isRTL ? 'سمة وقصة' : 'Fit / Tag'}
          </span>
        )
      case 'season':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            {isRTL ? 'موسم' : 'Season'}
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-700">
            {type}
          </span>
        )
    }
  }

  const FILTER_TYPES = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
    { id: 'category', labelAr: 'التصنيفات', labelEn: 'Category' },
    { id: 'collection', labelAr: 'التشكيلات', labelEn: 'Collection' },
    { id: 'material', labelAr: 'الخامات', labelEn: 'Material' },
    { id: 'tag', labelAr: 'السمات', labelEn: 'Tag / Fit' },
    { id: 'season', labelAr: 'المواسم', labelEn: 'Season' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-28 sm:pb-8 max-w-full overflow-hidden">
      {/* Header & Main Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-stone-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
            <span>{isRTL ? 'إدارة التصنيفات والفلاتر' : 'Storefront Filters & Categories'}</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
            {isRTL
              ? 'إدارة التصنيفات، التشكيلات، الخامات، والسمات التي يستخدمها المتسوقون لتصفية المنتجات.'
              : 'Manage categories, collections, fabrics, and tags used by shoppers on the catalog page.'}
          </p>
        </div>

        <button
          onClick={onAddFilter}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? 'إضافة مجموعة فلتر جديدة' : 'New Filter Group'}</span>
        </button>
      </div>

      {/* KPI Cards (Mobile-friendly 2-col grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'إجمالي المجموعات' : 'Total Groups'}
            </span>
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-stone-900">
            {filters.length}{' '}
            <span className="text-xs sm:text-sm font-bold text-stone-500">{isRTL ? 'مجموعة' : 'groups'}</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-purple-700 font-medium block mt-0.5 truncate">
            {isRTL ? 'تصنيفات وخامات وسمات' : 'Attributes & Taxonomy'}
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'المفعلة بالمتجر' : 'Active on Shop'}
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-emerald-600">
            {activeCount}{' '}
            <span className="text-xs sm:text-sm font-bold text-emerald-700">{isRTL ? 'نشطة' : 'active'}</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5 truncate">
            {isRTL ? 'تظهر مباشرة للمتسوقين' : 'Visible to shoppers'}
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'إجمالي القيم' : 'Total Values'}
            </span>
            <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-amber-600">
            {totalOptionsCount}{' '}
            <span className="text-xs sm:text-sm font-bold text-amber-700">{isRTL ? 'قيمة' : 'options'}</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5 truncate">
            {isRTL ? 'عبر كافة المجموعات' : 'Across all groups'}
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'ربط الألوان' : 'Color Linking'}
            </span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-blue-600">
            {isRTL ? 'مفعل' : 'Active'}
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5 truncate">
            {isRTL ? 'ربط دوائر الألوان بالصور' : 'Swatches linked to photos'}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 sm:p-4 bg-card border border-border rounded-2xl shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              isRTL
                ? 'ابحث باسم الفلتر أو القيمة (مثل: حرير، كاجوال، صيف)...'
                : 'Search filters or options (e.g. Silk, Tailoring, Summer)...'
            }
            className="w-full pl-9 pr-8 py-2 bg-secondary/50 border border-border rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-primary transition-all"
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

        {/* Horizontal Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {FILTER_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                selectedType === type.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-secondary/60 text-stone-700 hover:bg-secondary'
              }`}
            >
              <span>{isRTL ? type.labelAr : type.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE CARDS VIEW (`md:hidden`) */}
      <div className="md:hidden space-y-3.5">
        {filteredList.map(filter => (
          <div
            key={filter.id}
            className="bg-white rounded-2xl p-4 border border-stone-200/80 space-y-3.5 shadow-xs hover:border-stone-400 transition-all"
          >
            {/* Top Row: Group Titles, Type Badge, and 1-Tap Visibility Toggle */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-stone-900 text-base leading-tight truncate">
                    {filter.nameEn}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium mt-0.5 truncate" dir="rtl">
                    {filter.nameAr}
                  </p>
                </div>
              </div>

              {/* Type Badge & Visibility Toggle */}
              <div className="flex items-center gap-1.5 shrink-0">
                {getTypeBadge(filter.type)}
                <button
                  type="button"
                  onClick={() => onToggleFilterStatus(filter)}
                  className={`p-1.5 rounded-xl transition-all active:scale-90 border ${
                    filter.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-stone-100 text-stone-400 border-stone-200'
                  }`}
                  title={filter.isActive ? 'Active on Shop' : 'Hidden'}
                >
                  {filter.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Filter Values / Options Strip */}
            <div className="bg-stone-50/90 p-2.5 rounded-xl border border-stone-100 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                <span>{isRTL ? 'القيم والخيارات' : 'Options / Values'}</span>
                <span className="text-stone-600 font-mono">
                  {Array.isArray(filter.options) ? filter.options.length : 0} {isRTL ? 'قيمة' : 'values'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-0.5">
                {Array.isArray(filter.options) && filter.options.map((opt, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white border border-stone-200 text-stone-800 rounded-md text-[11px] font-semibold shadow-2xs"
                  >
                    {opt}
                  </span>
                ))}
                {(!filter.options || filter.options.length === 0) && (
                  <span className="text-stone-400 text-xs italic">
                    {isRTL ? 'لا توجد قيم مضافة بعد' : 'No values defined'}
                  </span>
                )}
              </div>
            </div>

            {/* Full-Width Touch Action Buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
              <button
                onClick={() => onEditFilter(filter)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Edit className="w-3.5 h-3.5 text-stone-500" />
                <span>{isRTL ? 'تعديل الفلتر والقيم' : 'Edit Values'}</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(isRTL ? `هل أنت متأكد من حذف مجموعة "${filter.nameAr || filter.nameEn}"؟` : `Delete filter group "${filter.nameEn}"?`)) {
                    onDeleteFilter(filter.id)
                  }
                }}
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{isRTL ? 'حذف' : 'Delete'}</span>
              </button>
            </div>
          </div>
        ))}

        {filteredList.length === 0 && (
          <div className="py-16 text-center text-muted-foreground font-bold italic text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-2">
            <SlidersHorizontal className="w-8 h-8 mx-auto text-stone-300" />
            <p>{isRTL ? 'لا توجد فلاتر أو تصنيفات مطابقة للبحث.' : 'No filter groups match your search.'}</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedType('all'); }}
              className="text-primary font-black underline text-xs"
            >
              {isRTL ? 'إعادة تعيين البحث' : 'Reset Filter'}
            </button>
          </div>
        )}
      </div>

      {/* DESKTOP TABLE VIEW (`hidden md:block`) */}
      <div className="hidden md:block bg-card rounded-2xl sm:rounded-[2rem] border border-border p-5 md:p-8 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <SlidersHorizontal className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="font-bodoni text-lg font-bold text-stone-700 uppercase">
              {isRTL ? 'لم يتم العثور على مجموعات فلاتر' : 'No Filter Groups Found'}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              {isRTL ? 'جرب تعديل البحث أو اضغط على "إضافة مجموعة فلتر جديدة"' : 'Try adjusting your search or click "New Filter Group" to create one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  <th className="p-4 font-black">Filter Group</th>
                  <th className="p-4 font-black">Type</th>
                  <th className="p-4 font-black">Options / Values</th>
                  <th className="p-4 font-black text-center">Storefront Visibility</th>
                  <th className="p-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                {filteredList.map(filter => (
                  <tr key={filter.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-base text-stone-900">{filter.nameEn}</div>
                      <div className="text-xs text-stone-400 font-medium" dir="rtl">{filter.nameAr}</div>
                    </td>
                    <td className="p-4">
                      {getTypeBadge(filter.type)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {Array.isArray(filter.options) && filter.options.slice(0, 5).map((opt, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 bg-stone-100 text-stone-800 rounded-md text-[11px] font-medium"
                          >
                            {opt}
                          </span>
                        ))}
                        {Array.isArray(filter.options) && filter.options.length > 5 && (
                          <span className="px-2 py-0.5 bg-stone-200/70 text-stone-600 rounded-md text-[10px] font-bold">
                            +{filter.options.length - 5} more
                          </span>
                        )}
                        {(!filter.options || filter.options.length === 0) && (
                          <span className="text-stone-400 text-xs italic">No values defined</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onToggleFilterStatus(filter)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                          filter.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200 border border-stone-200'
                        }`}
                        title="Click to toggle visible on customer catalog"
                      >
                        {filter.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{filter.isActive ? (isRTL ? 'مفعل بالمتجر' : 'Active on Shop') : (isRTL ? 'مخفي' : 'Hidden')}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditFilter(filter)}
                          className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl transition-colors"
                          title="Edit Filter Group"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete filter group "${filter.nameEn}"?`)) {
                              onDeleteFilter(filter.id)
                            }
                          }}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                          title="Delete Filter Group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
