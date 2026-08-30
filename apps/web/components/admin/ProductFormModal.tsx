'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader, Upload, FileVideo, Plus, Palette, Trash2, Image as ImageIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingProduct: any
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  isUploading: boolean
  mainImageRef: React.RefObject<HTMLInputElement | null>
  galleryImagesRef: React.RefObject<HTMLInputElement | null>
  videoFileRef: React.RefObject<HTMLInputElement | null>
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery' | 'video') => void
  sizeOptions: string[]
  t: (key: string, fallback?: string) => string
}

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  isUploading,
  mainImageRef,
  galleryImagesRef,
  videoFileRef,
  handleFileUpload,
  sizeOptions,
  t
}: ProductFormModalProps) {
  const { isRTL } = useLanguage()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-stone-900/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            className="bg-white w-full max-w-5xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-4 sm:p-8 md:p-10 border border-stone-100 shadow-2xl relative"
          >
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-3 sm:hidden" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 rtl:right-auto rtl:left-4 rtl:sm:left-6 p-2 hover:bg-stone-50 rounded-full z-20 transition-colors text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="mb-6 sm:mb-8 md:mb-12 pr-8 sm:pr-0">
              <h3 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight uppercase">
                {editingProduct 
                  ? (isRTL ? 'تعديل بيانات المنتج' : 'Update Product') 
                  : (isRTL ? 'إضافة منتج جديد' : 'New Product')}
                <br />
                <span className="text-primary">{isRTL ? 'كتالوج المتجر' : 'Catalog Creation'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 font-bold uppercase tracking-widest mt-1 sm:mt-2">
                {isRTL ? 'تخصيص تفاصيل القطعة، المقاسات، الألوان والصور' : 'Product Configuration & Media Assets'}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8 md:space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 md:gap-12">
                {/* Column 1: Essentials */}
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                      {isRTL ? 'اسم المنتج *' : t('admin.productName', 'Product Name *')}
                    </label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isRTL ? 'مثال: معطف صوف كشمير ناعم' : 'e.g. Silk Cashmere Overcoat'}
                      className="w-full p-3.5 sm:p-4 md:p-5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl font-bold text-sm sm:text-base md:text-lg text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                      {isRTL ? 'التصنيف والقسم *' : t('admin.category', 'Category *')}
                    </label>
                    <input
                      required
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      placeholder={isRTL ? 'مثال: فساتين، بدلات، قمصان، إكسسوارات' : 'e.g. Outerwear, Tailoring, Accessories'}
                      className="w-full p-3.5 sm:p-4 md:p-5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl font-bold text-sm sm:text-base text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                        {isRTL ? 'سعر البيع *' : t('admin.price', 'Price *')}
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="0.00"
                        className="w-full p-3.5 sm:p-4 md:p-5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl font-bold text-sm sm:text-base text-stone-900 focus:bg-white focus:border-primary transition-all outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                        {isRTL ? 'سعر التكلفة (رأس المال)' : 'Cost Basis (COGS)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                        placeholder="0.00"
                        className="w-full p-3.5 sm:p-4 md:p-5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl font-bold text-sm sm:text-base text-stone-900 focus:bg-white focus:border-primary transition-all outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                        {isRTL ? 'الكمية المتوفرة بالمخزون *' : t('admin.stock', 'Stock Quantity *')}
                      </label>
                      <input
                        required
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                        placeholder="10"
                        className="w-full p-3.5 sm:p-4 md:p-5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl font-bold text-sm sm:text-base text-stone-900 focus:bg-white focus:border-primary transition-all outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                        {isRTL ? 'رمز المنتج (SKU)' : 'SKU / Barcode'}
                      </label>
                      <input
                        value={formData.sku}
                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="OPT-001"
                        className="w-full p-3.5 sm:p-4 md:p-5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl font-bold text-sm sm:text-base text-stone-900 focus:bg-white focus:border-primary transition-all outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Sizes Matrix */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                      {isRTL ? 'المقاسات المتاحة' : 'Available Sizes'}
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {sizeOptions.map(sz => {
                        const hasSize = formData.sizes.includes(sz)
                        return (
                          <button
                            type="button"
                            key={sz}
                            onClick={() => {
                              if (hasSize) {
                                setFormData({ ...formData, sizes: formData.sizes.filter((s: string) => s !== sz) })
                              } else {
                                setFormData({ ...formData, sizes: [...formData.sizes, sz] })
                              }
                            }}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-mono text-[10px] sm:text-xs font-bold transition-all active:scale-95 ${
                              hasSize ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            {sz}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Gender Classification */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                      {isRTL ? 'الفئة المستهدفة' : 'Gender Classification'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'women', label: isRTL ? 'نسائي' : 'Women' },
                        { id: 'men', label: isRTL ? 'رجالي' : 'Men' },
                        { id: 'both', label: isRTL ? 'الجنسين' : 'Unisex / Both' }
                      ].map(g => (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() => setFormData({ ...formData, gender: g.id })}
                          className={`py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wider transition-all active:scale-95 ${
                            formData.gender === g.id
                              ? 'bg-stone-900 text-white shadow-md font-black'
                              : 'bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Curated Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <label className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isAccessory}
                        onChange={e => setFormData({ ...formData, isAccessory: e.target.checked })}
                        className="rounded border-stone-300 text-primary focus:ring-primary"
                      />
                      <span className="text-[11px] font-bold text-stone-700">
                        {isRTL ? 'إكسسوارات' : 'Accessory'}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFootwear}
                        onChange={e => setFormData({ ...formData, isFootwear: e.target.checked })}
                        className="rounded border-stone-300 text-primary focus:ring-primary"
                      />
                      <span className="text-[11px] font-bold text-stone-700">
                        {isRTL ? 'أحذية' : 'Footwear'}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isCurated}
                        onChange={e => setFormData({ ...formData, isCurated: e.target.checked })}
                        className="rounded border-stone-300 text-primary focus:ring-primary"
                      />
                      <span className="text-[11px] font-bold text-stone-700">
                        {isRTL ? 'تشكيلة مميزة' : 'Curated'}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                      {isRTL ? 'وصف وتفاصيل المنتج' : t('admin.description', 'Description')}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder={isRTL ? 'تفاصيل الخامة، القصة، التنسيقات المقترحة...' : 'Detail the materials, cut, craftsmanship, and styling recommendations...'}
                      className="w-full p-3.5 sm:p-4 md:p-5 bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl font-medium text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                        {isRTL ? 'نوع القماش والخامة' : 'Fabric & Material'}
                      </label>
                      <input
                        value={formData.material || ''}
                        onChange={e => setFormData({ ...formData, material: e.target.value })}
                        placeholder={isRTL ? 'مثال: حرير، كشمير، قطن مصري' : 'e.g. Silk Cashmere'}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-xs text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                        {isRTL ? 'الكلمات الدلالية (مفصولة بفواصل)' : 'Tags (comma separated)'}
                      </label>
                      <input
                        value={Array.isArray(formData.tags) ? formData.tags.join(', ') : (formData.tags || '')}
                        onChange={e => {
                          const tagList = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          setFormData({ ...formData, tags: tagList })
                        }}
                        placeholder={isRTL ? 'مثال: صيفي، حصري، كلاسيك' : 'e.g. Bespoke, New, Runway'}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-xs text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2: Media & Configuration */}
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                  {/* Main Image */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                      {isRTL ? 'الصورة الأساسية للمنتج *' : t('admin.productImage', 'Main Product Image *')}
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
                        {formData.image ? (
                          <img src={formData.image} alt="Main Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-6 h-6 text-stone-300" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={mainImageRef}
                          hidden
                          accept="image/*"
                          onChange={e => handleFileUpload(e, 'main')}
                        />
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => mainImageRef.current?.click()}
                          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                        >
                          {isUploading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>{isRTL ? 'رفع الصورة الرئيسية' : 'Select Main File'}</span>
                        </button>
                        <p className="text-[10px] text-stone-400">
                          {isRTL ? 'يُفضل صورة عمودية واضحة بجودة عالية (JPEG, PNG)' : 'Recommended: High-res portrait JPEG/PNG'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                      {isRTL ? 'ألبوم صور إضافية (المعرض)' : 'Product Gallery'}
                    </label>
                    <input
                      type="file"
                      ref={galleryImagesRef}
                      hidden
                      multiple
                      accept="image/*"
                      onChange={e => handleFileUpload(e, 'gallery')}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      {formData.images.map((img: string, i: number) => (
                        <div key={i} className="aspect-square bg-stone-50 border border-stone-200 rounded-xl overflow-hidden relative group">
                          <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, images: formData.images.filter((_: any, idx: number) => idx !== i) })}
                            className="absolute top-1 right-1 p-1 bg-stone-900/80 text-white rounded-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => galleryImagesRef.current?.click()}
                        className="aspect-square bg-stone-50 border border-dashed border-stone-300 hover:border-primary rounded-xl flex flex-col items-center justify-center gap-1 text-stone-500 hover:text-primary transition-colors active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[9px] font-bold uppercase">{isRTL ? 'إضافة صورة' : 'Add Photo'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Video */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                      {isRTL ? 'فيديو استعراضي للمنتج (اختياري)' : 'Showcase Video (Optional)'}
                    </label>
                    <input
                      type="file"
                      ref={videoFileRef}
                      hidden
                      accept="video/*"
                      onChange={e => handleFileUpload(e, 'video')}
                    />
                    <div className="flex gap-2">
                      <input
                        value={formData.videoUrl}
                        onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder={isRTL ? 'رابط الفيديو https:// أو ارفع فيديو' : 'https://... or upload MP4'}
                        className="flex-1 p-3.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => videoFileRef.current?.click()}
                        className="px-4 bg-stone-100 hover:bg-stone-200 rounded-xl flex items-center justify-center text-stone-600 transition-colors active:scale-95"
                        title={isRTL ? 'رفع ملف فيديو' : 'Upload Video'}
                      >
                        <FileVideo className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Promotion Settings */}
                  <div className="p-4 sm:p-6 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        {isRTL ? 'تفعيل خصم موسمي على المنتج' : 'Seasonal Discount'}
                      </span>
                      <input
                        type="checkbox"
                        checked={formData.discountActive}
                        onChange={e => setFormData({ ...formData, discountActive: e.target.checked })}
                        className="rounded border-stone-300 text-primary focus:ring-primary"
                      />
                    </label>
                    {formData.discountActive && (
                      <div className="space-y-1.5 pt-2 border-t border-stone-200/50">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                          {isRTL ? 'نسبة الخصم (%)' : 'Markdown Percentage (%)'}
                        </label>
                        <input
                          type="number"
                          value={formData.discountPercentage}
                          onChange={e => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                          placeholder="20"
                          className="w-full p-3 bg-white border border-stone-200 rounded-xl font-bold text-sm text-stone-900 outline-none font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: COLOR OPTIONS & PICTURE LINKING */}
              <div className="pt-6 sm:pt-8 border-t border-stone-100 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50/80 p-4 sm:p-6 rounded-2xl border border-stone-100">
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-stone-900 flex items-center gap-2.5">
                      <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      <span>{isRTL ? 'خيارات الألوان وربط الصور التفاعلية' : 'Color Options & Picture Linking'}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                      {isRTL 
                        ? 'إضافة درجات الألوان وربط كل درجة بصورة معينة من صور المنتج، بحيث يتغير المعرض تلقائياً عند نقر العميل على اللون.' 
                        : 'Configure color variants and link each shade to a specific photo. Selecting a color on the storefront automatically switches the picture.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentColors = Array.isArray(formData.colors) ? formData.colors : []
                      const defaultImg = formData.image || (Array.isArray(formData.images) && formData.images[0]) || ''
                      setFormData({
                        ...formData,
                        colors: [
                          ...currentColors,
                          { name: isRTL ? `لون جديد ${currentColors.length + 1}` : `Shade ${currentColors.length + 1}`, hex: '#1C1917', image: defaultImg }
                        ]
                      })
                    }}
                    className="w-full sm:w-auto px-5 py-3 bg-stone-900 hover:bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRTL ? 'إضافة درجة لون +' : 'Add Color Shade'}</span>
                  </button>
                </div>

                {(!formData.colors || formData.colors.length === 0) ? (
                  <div className="p-8 sm:p-12 bg-stone-50 border border-dashed border-stone-200 rounded-2xl sm:rounded-3xl text-center">
                    <Palette className="w-10 h-10 sm:w-12 sm:h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-sm sm:text-base font-bold text-stone-600">
                      {isRTL ? 'لا توجد ألوان أو درجات مرتبطة بعد' : 'No Color Variants Linked Yet'}
                    </p>
                    <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-md mx-auto">
                      {isRTL 
                        ? 'انقر على "إضافة درجة لون +" لإنشاء درجات ألوان وربط كل منها بصورة المعطف أو الفستان.' 
                        : 'Click "Add Color Shade" above to create color swatches and link each to a specific garment photo.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {formData.colors.map((col: any, idx: number) => {
                      const allAvailableImages = [
                        ...(formData.image ? [formData.image] : []),
                        ...(Array.isArray(formData.images) ? formData.images : [])
                      ].filter((img, i, arr) => arr.indexOf(img) === i)

                      return (
                        <div 
                          key={idx} 
                          className="p-4 sm:p-5 bg-white border border-stone-200 rounded-2xl space-y-3 relative group hover:border-primary/50 hover:shadow-md transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const nextColors = formData.colors.filter((_: any, i: number) => i !== idx)
                              setFormData({ ...formData, colors: nextColors })
                            }}
                            className="absolute top-3 right-3 rtl:right-auto rtl:left-3 p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                            title={isRTL ? 'حذف هذا اللون' : 'Delete Color'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Color Swatch & Name */}
                          <div className="flex items-center gap-3 pr-8 rtl:pr-0 rtl:pl-8">
                            <label className="relative cursor-pointer shrink-0">
                              <span 
                                className="w-10 h-10 rounded-full border-2 border-white shadow-md block"
                                style={{ backgroundColor: col.hex || '#000000' }}
                              />
                              <input
                                type="color"
                                value={col.hex || '#000000'}
                                onChange={e => {
                                  const next = [...formData.colors]
                                  next[idx] = { ...next[idx], hex: e.target.value }
                                  setFormData({ ...formData, colors: next })
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                            </label>
                            <div className="flex-1">
                              <input
                                value={col.name || ''}
                                onChange={e => {
                                  const next = [...formData.colors]
                                  next[idx] = { ...next[idx], name: e.target.value }
                                  setFormData({ ...formData, colors: next })
                                }}
                                placeholder={isRTL ? 'مثال: أسود ليلي، عاجي' : 'e.g. Midnight Black, Ivory'}
                                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-900 outline-none focus:bg-white focus:border-primary"
                              />
                              <span className="text-[9px] font-mono text-stone-400 uppercase mt-0.5 block">{col.hex}</span>
                            </div>
                          </div>

                          {/* Linked Picture Selector */}
                          <div className="space-y-1.5 pt-2.5 border-t border-stone-100">
                            <label className="text-[9px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                              <ImageIcon className="w-3 h-3 text-primary" />
                              <span>{isRTL ? 'الصورة المرتبطة بهذا اللون:' : 'Linked Picture for this Color:'}</span>
                            </label>

                            <div className="flex items-center gap-2.5">
                              <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {col.image ? (
                                  <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-stone-300" />
                                )}
                              </div>

                              <div className="flex-1">
                                {allAvailableImages.length > 0 ? (
                                  <select
                                    value={col.image || ''}
                                    onChange={e => {
                                      const next = [...formData.colors]
                                      next[idx] = { ...next[idx], image: e.target.value }
                                      setFormData({ ...formData, colors: next })
                                    }}
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-semibold text-stone-800 outline-none focus:bg-white focus:border-primary cursor-pointer"
                                  >
                                    <option value="">{isRTL ? '-- اختر من صور المنتج --' : '-- Choose from Photos --'}</option>
                                    {allAvailableImages.map((img, imgIdx) => (
                                      <option key={imgIdx} value={img}>
                                        {isRTL ? `صورة ${imgIdx + 1}` : `Photo ${imgIdx + 1}`}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    value={col.image || ''}
                                    onChange={e => {
                                      const next = [...formData.colors]
                                      next[idx] = { ...next[idx], image: e.target.value }
                                      setFormData({ ...formData, colors: next })
                                    }}
                                    placeholder={isRTL ? 'رابط الصورة https://...' : 'Paste Image URL https://...'}
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-medium text-stone-800 outline-none focus:bg-white"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 sm:pt-6 md:pt-8 border-t border-stone-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 bg-stone-100 text-stone-600 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-stone-200 transition-all text-center active:scale-95"
                >
                  {isRTL ? 'إلغاء' : t('admin.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 bg-primary text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                  <span>
                    {editingProduct 
                      ? (isRTL ? 'حفظ تعديلات المنتج' : 'Update Product') 
                      : (isRTL ? 'نشر المنتج في الكتالوج' : 'Publish Product')}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
