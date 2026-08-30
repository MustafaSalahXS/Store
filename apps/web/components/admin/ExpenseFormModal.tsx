'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader, Wallet, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface ExpenseFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingExpense: any
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  currentStore: any
  t: (key: string, fallback?: string) => string
}

export default function ExpenseFormModal({
  isOpen,
  onClose,
  editingExpense,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  currentStore,
  t
}: ExpenseFormModalProps) {
  const { isRTL } = useLanguage()

  const CATEGORIES = [
    { value: 'payroll', label: isRTL ? 'رواتب وأجور الموظفين' : 'Staff Payroll / Salaries' },
    { value: 'rent', label: isRTL ? 'إيجار المقر والمشاغل' : 'Facility Rent / Lease' },
    { value: 'marketing', label: isRTL ? 'التسويق والإعلانات الممولة' : 'Marketing & Ads' },
    { value: 'inventory_cogs', label: isRTL ? 'شراء مواد خام وإنتاج (COGS)' : 'Raw Materials & Production' },
    { value: 'logistics', label: isRTL ? 'شحن ولوجستيات التوصيل' : 'Shipping & Delivery Fleet' },
    { value: 'utilities', label: isRTL ? 'مرافق، كهرباء، واشتراكات' : 'Utilities & Software' },
    { value: 'other', label: isRTL ? 'مصروفات تشغيلية أخرى' : 'Other Operational Outflow' }
  ]

  const PAYMENT_METHODS = [
    { value: 'cash', label: isRTL ? 'نقداً (كاش)' : 'Cash' },
    { value: 'instapay', label: isRTL ? 'إنستاباي (InstaPay)' : 'InstaPay' },
    { value: 'bank_transfer', label: isRTL ? 'تحويل بنكي' : 'Bank Transfer' },
    { value: 'wallet', label: isRTL ? 'محفظة إلكترونية (فودافون كاش...)' : 'Mobile Wallet' }
  ]

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
            className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 border border-stone-100 shadow-2xl relative"
          >
            {/* Mobile swipe indicator */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4 sm:hidden" />

            <button
              onClick={onClose}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 rtl:right-auto rtl:left-4 rtl:sm:left-6 p-2 hover:bg-stone-50 rounded-full text-stone-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  {isRTL ? 'رأس المال والمصروفات' : 'Capital Outflow & Payroll'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                {editingExpense 
                  ? (isRTL ? 'تعديل قيد المصروف' : 'Update Expense / Payout') 
                  : (isRTL ? 'تسجيل مصروف أو راتب جديد' : 'Record Expense / Payout')}
              </h3>
              <p className="text-xs text-stone-400 mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL 
                  ? 'تسجيل دقيق للمصروفات، رواتب الموظفين، والتكاليف التشغيلية للمتجر.' 
                  : 'Track staff salaries, operational costs, and capital expenditures.'}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  {isRTL ? 'بيان ووصف المصروف *' : 'Expense / Payout Description *'}
                </label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder={isRTL ? 'مثال: راتب مدير التصميم لشهر أغسطس، إيجار المشغل...' : 'e.g. August Head Designer Salary, Workshop Rent...'}
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-stone-900 outline-none focus:bg-white focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    {isRTL ? 'تصنيف المصروف *' : 'Category *'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    {isRTL ? `المبلغ (${currentStore?.currency || 'USD'}) *` : `Amount (${currentStore?.currency || 'USD'}) *`}
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="5000"
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-black text-stone-900 outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    {isRTL ? 'اسم الموظف / المستفيد' : 'Staff Member / Vendor Name'}
                  </label>
                  <input
                    value={formData.recipientName}
                    onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                    placeholder={isRTL ? 'مثال: أحمد محمود (خياط أول)' : 'e.g. Ahmed Mahmoud (Tailor)'}
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    {isRTL ? 'تاريخ الدفع والصرف' : 'Payment Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.paidAt}
                    onChange={e => setFormData({ ...formData, paidAt: e.target.value })}
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  {isRTL ? 'طريقة الصرف والتحويل' : 'Payment Method'}
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none cursor-pointer"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  {isRTL ? 'ملاحظات أو رقم الإيصال / الفاتورة' : 'Receipt / Invoice URL or Notes'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isRTL ? 'رقم المعاملة، رقم الحوالة، أو أي تفاصيل إضافية...' : 'Additional payment details, invoice reference...'}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:bg-white focus:border-primary transition-all"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 bg-stone-100 text-stone-600 font-bold text-xs rounded-xl hover:bg-stone-200 transition-all active:scale-95 text-center"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    {editingExpense 
                      ? (isRTL ? 'حفظ تعديل المصروف' : 'Update Expense') 
                      : (isRTL ? 'تسجيل القيد المالي' : 'Record Payout')}
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
