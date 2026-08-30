'use client'

import React from 'react'
import { Plus, Edit, Trash2, Ticket } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'

interface CouponsSectionProps {
  coupons: any[]
  currentStore: any
  onOpenCreate: () => void
  onOpenEdit: (coupon: any) => void
  onDelete: (id: string) => void
  t: (key: string, fallback?: string) => string
}

export default function CouponsSection({
  coupons,
  currentStore,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  t
}: CouponsSectionProps) {
  const { isRTL } = useLanguage()

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-8 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary shrink-0" />
            <span>{isRTL ? 'كوبونات وقسائم الخصم' : t('admin.discountCoupons', 'Discount Coupons')}</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs sm:text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
            {isRTL ? 'إدارة أكواد الخصم الترويجية، نسب التخفيض، وتحديد حدود الاستخدام وتواريخ الصلاحية.' : t('admin.manageCoupons', 'Manage promotional codes, discounts, limits, and expiry dates.')}
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-primary text-white font-black rounded-xl sm:rounded-2xl hover:bg-primary/90 transition-all shadow-md text-xs sm:text-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{isRTL ? 'إنشاء كود خصم جديد' : t('admin.newCoupon', 'New Coupon')}</span>
        </button>
      </div>

      <div className="bg-card rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-border p-4 sm:p-6 md:p-8 shadow-xl">
        {/* Mobile Coupons List */}
        <div className="md:hidden space-y-4">
          {coupons.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground font-bold italic text-sm">
              {isRTL ? 'لا توجد كوبونات خصم مضافة بعد.' : t('admin.noCoupons', 'No coupons found.')}
            </div>
          ) : (
            coupons.map((coupon: any) => (
              <div key={coupon.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-stone-900 tracking-widest text-base uppercase bg-white px-3 py-1 rounded-md border border-stone-200">
                    {coupon.code}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      coupon.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {coupon.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                  </span>
                </div>

                <div className="flex justify-between items-end border-t border-stone-200/50 pt-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">
                      {isRTL ? 'قيمة الخصم' : t('admin.benefit', 'Discount')}
                    </span>
                    <div className="font-bold text-stone-900 text-sm">
                      {coupon.discountType === 'percentage'
                        ? (isRTL ? `خصم ${coupon.discountValue}%` : `${coupon.discountValue}% OFF`)
                        : (isRTL ? `خصم ${formatPrice(coupon.discountValue, currentStore?.currency || 'USD')}` : `${formatPrice(coupon.discountValue, currentStore?.currency || 'USD')} OFF`)}
                    </div>
                  </div>
                  <div className="text-right rtl:text-left space-y-1">
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">
                      {isRTL ? 'مرات الاستخدام' : t('admin.usage', 'Usage')}
                    </span>
                    <div className="text-xs font-mono font-black">
                      {coupon.usageCount} / {coupon.usageLimit || (isRTL ? 'بلا حدود' : '∞')}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onOpenEdit(coupon)}
                    className="flex-1 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-xs text-primary flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'تعديل' : t('admin.edit', 'Edit')}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(isRTL ? `هل أنت متأكد من حذف الكوبون "${coupon.code}"؟` : `Delete coupon "${coupon.code}"?`)) {
                        onDelete(coupon.id)
                      }
                    }}
                    className="flex-1 py-2.5 bg-red-50 border border-red-100 rounded-xl font-bold text-xs text-red-500 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'حذف' : t('admin.delete', 'Delete')}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Coupons Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-start rtl:text-right">
            <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="py-5 px-4 font-black">{isRTL ? 'كود الكوبون' : t('admin.code', 'Code')}</th>
                <th className="py-5 px-4 font-black">{isRTL ? 'قيمة الخصم' : t('admin.benefit', 'Discount')}</th>
                <th className="py-5 px-4 font-black">{isRTL ? 'مرات الاستخدام' : t('admin.usage', 'Usage')}</th>
                <th className="py-5 px-4 font-black">{isRTL ? 'الحالة' : t('delivery.status', 'Status')}</th>
                <th className="py-5 px-4 font-black">{isRTL ? 'تاريخ الانتهاء' : t('admin.expires', 'Expires')}</th>
                <th className="py-5 px-4 text-end font-black">{isRTL ? 'الإجراءات' : t('admin.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-muted-foreground font-bold italic">
                    {isRTL ? 'لا توجد كوبونات خصم مضافة بعد.' : t('admin.noCoupons', 'No coupons found.')}
                  </td>
                </tr>
              ) : (
                coupons.map((coupon: any) => (
                  <tr key={coupon.id} className="border-b border-stone-100 group hover:bg-stone-50 transition-colors">
                    <td className="py-5 px-4">
                      <span className="font-mono font-black text-stone-900 tracking-widest text-base uppercase bg-stone-100 px-3 py-1 rounded-md border border-stone-200">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="font-bold text-stone-900 text-sm">
                        {coupon.discountType === 'percentage'
                          ? (isRTL ? `خصم ${coupon.discountValue}%` : `${coupon.discountValue}% OFF`)
                          : (isRTL ? `خصم ${formatPrice(coupon.discountValue, currentStore?.currency || 'USD')}` : `${formatPrice(coupon.discountValue, currentStore?.currency || 'USD')} OFF`)}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="text-xs font-medium text-stone-500 font-mono">
                        <span className="font-bold text-stone-900">{coupon.usageCount}</span>
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ` / ${isRTL ? 'دائم' : '∞'}`}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          coupon.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {coupon.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="text-xs font-medium text-stone-500 font-mono">
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : (isRTL ? 'غير محدد (مستمر)' : 'Never')}
                      </div>
                    </td>
                    <td className="py-5 px-4 text-end">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onOpenEdit(coupon)}
                          className="p-2 text-stone-400 hover:text-primary transition-colors bg-secondary rounded-lg hover:bg-stone-200"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(isRTL ? `حذف الكوبون "${coupon.code}"؟` : `Delete coupon "${coupon.code}"?`)) {
                              onDelete(coupon.id)
                            }
                          }}
                          className="p-2 text-stone-400 hover:text-red-500 transition-colors bg-secondary rounded-lg hover:bg-rose-50"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
