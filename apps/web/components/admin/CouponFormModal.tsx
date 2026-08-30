'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader, Ticket, AlertCircle, Tag, Check } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface CouponFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingCoupon: any
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  couponError: string
  setCouponError: (err: string) => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  currentStore: any
  t: (key: string, fallback?: string) => string
}

export default function CouponFormModal({
  isOpen,
  onClose,
  editingCoupon,
  formData,
  setFormData,
  couponError,
  setCouponError,
  onSubmit,
  isSubmitting,
  currentStore,
  t
}: CouponFormModalProps) {
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
            className="bg-white w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-stone-100 shadow-2xl relative"
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
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  {isRTL ? 'العروض والخصومات الترويجية' : 'Promotions & Discounts'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                {editingCoupon 
                  ? (isRTL ? 'تعديل كود الخصم' : 'Update Coupon') 
                  : (isRTL ? 'إنشاء كود خصم جديد' : 'New Coupon')}
              </h3>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                {editingCoupon 
                  ? (isRTL ? 'تعديل نسبة الخصم وحدود الاستخدام وتاريخ الصلاحية' : 'Modify promotional rules and usage limits')
                  : (isRTL ? 'تحديد كود الخصم، القيمة المخفضة، وشروط الاستخدام' : 'Define promotional codes and customer discounts')}
              </p>
            </div>

            {couponError && (
              <div className="mb-6 p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl sm:rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{couponError}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                  {isRTL ? 'كود وقسيمة الخصم (أحرف إنجليزية كبيرة) *' : t('admin.couponCode', 'Coupon Code *')}
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={formData.code}
                    onChange={e => {
                      setCouponError('')
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }}
                    placeholder="SUMMER2025, VIP20"
                    dir="ltr"
                    className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl font-mono font-black tracking-widest text-base sm:text-lg text-stone-900 focus:bg-white focus:border-primary uppercase transition-all outline-none"
                  />
                  <Tag className="w-4 h-4 text-stone-400 absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                    {isRTL ? 'نوع الخصم *' : t('admin.discountType', 'Discount Type *')}
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={e => {
                      setCouponError('')
                      setFormData({ ...formData, discountType: e.target.value })
                    }}
                    className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-primary transition-all outline-none cursor-pointer"
                  >
                    <option value="percentage">{isRTL ? 'نسبة مئوية (%)' : 'Percentage (%) Discount'}</option>
                    <option value="fixed">{isRTL ? `مبلغ خصم ثابت (${currentStore?.currency || 'EGP'})` : `Fixed Amount (${currentStore?.currency || 'USD'})`}</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                    {formData.discountType === 'percentage'
                      ? (isRTL ? 'نسبة الخصم المئوية (%)' : 'Percentage Off (%)')
                      : (isRTL ? `قيمة الخصم (${currentStore?.currency || 'EGP'})` : `Deduction (${currentStore?.currency || 'USD'})`)}
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={formData.discountType === 'percentage' ? 100 : undefined}
                      value={formData.discountValue}
                      onChange={e => {
                        setCouponError('')
                        setFormData({ ...formData, discountValue: e.target.value })
                      }}
                      placeholder={formData.discountType === 'percentage' ? '15' : '50'}
                      className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl font-mono font-bold text-sm text-stone-900 focus:bg-white focus:border-primary transition-all outline-none pr-10 rtl:pr-4 rtl:pl-10"
                    />
                    <span className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 text-xs font-black text-stone-400 font-mono">
                      {formData.discountType === 'percentage' ? '%' : currentStore?.currency || 'EGP'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                    {isRTL ? 'أقصى عدد مرات للاستخدام (اختياري)' : `${t('admin.usageLimit', 'Usage Limit')} (Optional)`}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={e => {
                      setCouponError('')
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }}
                    placeholder={isRTL ? 'اتركه فارغاً لاستخدام غير محدود' : 'Unlimited (leave blank)'}
                    className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-primary transition-all outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest block">
                    {isRTL ? 'تاريخ انتهاء الصلاحية (اختياري)' : `${t('admin.expiryDate', 'Expiry Date')} (Optional)`}
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={e => {
                      setCouponError('')
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }}
                    className="w-full p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none ${
                  formData.isActive
                    ? 'bg-amber-500/10 border-primary/30 text-stone-900'
                    : 'bg-stone-50 border-stone-100 text-stone-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                    formData.isActive ? 'bg-primary text-white shadow-md' : 'bg-stone-200 text-stone-400'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wider text-stone-900">
                      {formData.isActive 
                        ? (isRTL ? 'كود الخصم نشط ويعمل بالمتجر' : 'Coupon is Active') 
                        : (isRTL ? 'كود الخصم معطل حالياً' : 'Coupon is Disabled')}
                    </div>
                    <div className="text-[10px] text-stone-400 font-medium">
                      {formData.isActive 
                        ? (isRTL ? 'يمكن للعملاء إدخال الكود والاستفادة من الخصم عند الدفع' : 'Eligible customers can redeem this code during checkout') 
                        : (isRTL ? 'لا يمكن استخدام هذا الكود طالما هو معطل' : 'Code cannot be redeemed while inactive')}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-200 accent-primary pointer-events-none"
                />
              </div>

              <div className="pt-4 sm:pt-6 border-t border-stone-100 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3.5 sm:py-4 bg-stone-100 text-stone-600 font-bold uppercase tracking-wider text-xs rounded-xl sm:rounded-2xl hover:bg-stone-200 transition-all active:scale-95 text-center"
                >
                  {isRTL ? 'إلغاء' : t('admin.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-[2] py-3.5 sm:py-4 bg-primary text-white font-bold uppercase tracking-wider text-xs rounded-xl sm:rounded-2xl shadow-lg hover:brightness-110 transition-all flex justify-center items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                  <span>
                    {editingCoupon 
                      ? (isRTL ? 'حفظ تعديلات الكوبون' : t('admin.updateCoupon', 'Update Coupon')) 
                      : (isRTL ? 'إنشاء كود الخصم' : t('admin.createCoupon', 'Create Coupon'))}
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
