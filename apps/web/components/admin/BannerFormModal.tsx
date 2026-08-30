'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader, Upload, Image as ImageIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface BannerFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingBanner: any
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  isUploading: boolean
  bannerImageRef: React.RefObject<HTMLInputElement | null>
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'banner') => void
  t: (key: string, fallback?: string) => string
}

export default function BannerFormModal({
  isOpen,
  onClose,
  editingBanner,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  isUploading,
  bannerImageRef,
  handleFileUpload,
  t
}: BannerFormModalProps) {
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
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            className="bg-white w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 md:p-12 border border-stone-100 shadow-2xl relative"
          >
            {/* Mobile swipe indicator */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4 sm:hidden" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 rtl:right-auto rtl:left-4 rtl:sm:left-6 p-2 hover:bg-stone-50 rounded-full z-20 transition-colors text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="mb-6 sm:mb-8 pr-8 sm:pr-0 rtl:pr-0 rtl:pl-8 rtl:sm:pl-0">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase">
                {editingBanner 
                  ? (isRTL ? 'تعديل البانر الإعلاني' : 'Update Banner') 
                  : (isRTL ? 'إضافة بانر إعلاني جديد' : 'New Banner')}
                <br />
                <span className="text-primary">{isRTL ? 'واجهة المتجر الرئيسية' : 'Homepage Showcase'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 font-bold uppercase tracking-widest mt-1 sm:mt-2" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL ? 'تخصيص الحملات التسويقية المرئية والأزرار التفاعلية' : 'Curate Homepage Visual Campaigns'}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                    {isRTL ? 'عنوان البانر الرئيسي *' : t('admin.bannerTitle', 'Banner Title *')}
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder={isRTL ? 'مثال: تشكيلة الشتاء الفاخرة' : 'e.g., WINTER COUTURE COLLECTION'}
                    className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl font-bold text-sm sm:text-base text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                    {isRTL ? 'العنوان الفرعي / وسم الحملة' : 'Subtitle / Campaign Tag'}
                  </label>
                  <input
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder={isRTL ? 'مثال: أزياء راقية ومختارة' : 'e.g., THE MODERN SILHOUETTE'}
                    className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl font-bold text-sm sm:text-base text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                  {isRTL ? 'نص ووصف البانر' : 'Narrative Description'}
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder={isRTL ? 'تفاصيل الحملة الترويجية التي تظهر على واجهة المتجر...' : 'Detail the essence of this campaign...'}
                  className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl font-medium text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                />
              </div>

              {/* Banner Visual Asset */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                  {isRTL ? 'صورة البانر الإعلاني *' : t('admin.bannerImage', 'Banner Image *')}
                </label>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                  <div className="w-full sm:w-60 h-32 sm:h-36 bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center relative">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-stone-300" />
                    )}
                  </div>
                  <div className="space-y-2 w-full sm:w-auto">
                    <input
                      type="file"
                      ref={bannerImageRef}
                      hidden
                      accept="image/*"
                      onChange={e => handleFileUpload(e, 'banner')}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => bannerImageRef.current?.click()}
                      className="w-full sm:w-auto px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>{isRTL ? 'رفع صورة البانر' : 'Select Visual Asset'}</span>
                    </button>
                    <p className="text-[10px] text-stone-400">
                      {isRTL ? 'يُفضل صورة أفقية عريضة بجودة فائقة (16:9 أو 21:9)' : 'High-resolution horizontal ratio recommended (16:9 or 21:9)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                    {isRTL ? 'نص زر التوجيه (CTA)' : 'Call To Action Text'}
                  </label>
                  <input
                    value={formData.ctaText}
                    onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder={isRTL ? 'مثال: اكتشف التشكيلة الآن' : 'e.g., DISCOVER THE RUNWAY'}
                    className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl font-bold text-sm text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                    {isRTL ? 'رابط الصفحة المستهدفة' : 'Destination URL'}
                  </label>
                  <input
                    value={formData.ctaLink}
                    onChange={e => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="e.g., /women, /products, /checkout"
                    dir="ltr"
                    className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                    {isRTL ? 'ترتيب الظهور في السلايدر' : 'Sequence Priority'}
                  </label>
                  <input
                    type="number"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-sm text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                  />
                </div>

                <div className="pt-2 sm:pt-6">
                  <label className="flex items-center gap-3 p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-bold text-stone-800">
                      {isRTL ? 'تفعيل وعرض البانر على واجهة المتجر' : 'Display On Storefront'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 sm:pt-6 border-t border-stone-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-4">
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
                    {editingBanner 
                      ? (isRTL ? 'حفظ تعديلات البانر' : 'Save Banner Changes') 
                      : (isRTL ? 'نشر البانر الإعلاني' : 'Deploy Banner')}
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
