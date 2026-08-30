'use client'

import React, { useState } from 'react'
import {
  Wallet,
  Plus,
  Users,
  Building,
  Megaphone,
  Truck,
  Zap,
  Edit,
  Trash2,
  Calendar,
  Search,
  Receipt
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'
import { Expense } from './types'

interface StaffExpensesSectionProps {
  expenses: Expense[]
  currentStore: any
  onOpenCreate: () => void
  onOpenEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  t: (key: string, fallback?: string) => string
}

export default function StaffExpensesSection({
  expenses,
  currentStore,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  t
}: StaffExpensesSectionProps) {
  const { isRTL } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const CATEGORY_META: Record<string, { label: string; color: string; icon: any }> = {
    payroll: { label: isRTL ? 'رواتب الموظفين' : 'Staff Payroll', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Users },
    rent: { label: isRTL ? 'إيجار المقرات' : 'Rent / Lease', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Building },
    marketing: { label: isRTL ? 'التسويق والإعلانات' : 'Marketing & Ads', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: Megaphone },
    inventory_cogs: { label: isRTL ? 'مواد خام وإنتاج' : 'Production & COGS', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Zap },
    logistics: { label: isRTL ? 'شحن ولوجستيات' : 'Shipping & Logistics', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck },
    utilities: { label: isRTL ? 'مرافق واشتراكات' : 'Utilities & Tech', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Zap },
    other: { label: isRTL ? 'مصروفات أخرى' : 'Other Outflow', color: 'bg-stone-100 text-stone-700 border-stone-200', icon: Wallet }
  }

  // Filtered
  const filteredExpenses = expenses.filter(e => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = (e.title || '').toLowerCase().includes(q)
      const matchRec = (e.recipientName || '').toLowerCase().includes(q)
      const matchNotes = (e.notes || '').toLowerCase().includes(q)
      if (!matchTitle && !matchRec && !matchNotes) return false
    }
    return true
  })

  // Summary KPIs
  const totalOutflow = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const payrollTotal = expenses.filter(e => e.category === 'payroll').reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const marketingTotal = expenses.filter(e => e.category === 'marketing').reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const rentTotal = expenses.filter(e => e.category === 'rent' || e.category === 'utilities').reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-8 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary shrink-0" />
            <span>{isRTL ? 'المصروفات والرواتب ورأس المال الخارج' : t('admin.staffExpenses', 'Staff Payroll & Outgoing Capital')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5" dir={isRTL ? 'rtl' : 'ltr'}>
            {isRTL 
              ? 'تسجيل رواتب الموظفين، إيجارات المشاغل، ميزانيات الإعلانات، ومصاريف التشغيل.' 
              : 'Log staff salaries, facility leases, ad spend, and all operating cash outflow.'}
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-5 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:brightness-110 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? 'تسجيل مصروف / راتب جديد' : 'Record Payout / Expense'}</span>
        </button>
      </div>

      {/* 4 Expense KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {isRTL ? 'إجمالي المصروفات' : 'Total Outflow'}
            </span>
            <Wallet className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-2 text-rose-600 font-mono">
            {formatPrice(totalOutflow, currentStore?.currency || 'USD')}
          </p>
          <span className="text-[10px] text-stone-400 font-medium">
            {isRTL ? 'كافة المبالغ المصروفة' : 'All logged expenses'}
          </span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {isRTL ? 'رواتب الموظفين' : 'Staff Payroll'}
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-2 text-blue-600 font-mono">
            {formatPrice(payrollTotal, currentStore?.currency || 'USD')}
          </p>
          <span className="text-[10px] text-stone-400 font-medium">
            {isRTL ? 'أجور ورواتب العمل' : 'Salaries & bonuses'}
          </span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {isRTL ? 'التسويق والإعلانات' : 'Marketing & Ads'}
            </span>
            <Megaphone className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-2 text-pink-600 font-mono">
            {formatPrice(marketingTotal, currentStore?.currency || 'USD')}
          </p>
          <span className="text-[10px] text-stone-400 font-medium">
            {isRTL ? 'الحملات الممولة' : 'Ad campaigns spend'}
          </span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {isRTL ? 'الإيجار والمرافق' : 'Rent & Facilities'}
            </span>
            <Building className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-2 text-purple-600 font-mono">
            {formatPrice(rentTotal, currentStore?.currency || 'USD')}
          </p>
          <span className="text-[10px] text-stone-400 font-medium">
            {isRTL ? 'المقرات والتراخيص' : 'Leases & software'}
          </span>
        </div>
      </div>

      {/* Toolbar Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث بالبيان، الموظف، أو الملاحظات...' : 'Search expenses by description, employee...'}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2.5 bg-secondary/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-primary focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-xs font-bold outline-none cursor-pointer w-full sm:w-auto"
          >
            <option value="all">{isRTL ? 'جميع التصنيفات' : 'All Categories'}</option>
            <option value="payroll">{isRTL ? 'رواتب الموظفين' : 'Staff Payroll / Salaries'}</option>
            <option value="rent">{isRTL ? 'الإيجارات والمقرات' : 'Rent / Leases'}</option>
            <option value="marketing">{isRTL ? 'التسويق والإعلانات' : 'Marketing & Ad Spend'}</option>
            <option value="inventory_cogs">{isRTL ? 'مواد خام وتصنيع' : 'Raw Materials & Production'}</option>
            <option value="logistics">{isRTL ? 'الشحن والتوصيل' : 'Shipping & Fleet'}</option>
            <option value="utilities">{isRTL ? 'مرافق وبرمجيات' : 'Utilities & Tech'}</option>
            <option value="other">{isRTL ? 'مصروفات أخرى' : 'Other Outflow'}</option>
          </select>
        </div>
      </div>

      {/* Expenses Ledger */}
      <div className="bg-card rounded-2xl sm:rounded-[2rem] border border-border p-4 sm:p-6 md:p-8 shadow-xl">
        <h3 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 tracking-tight">
          {isRTL ? 'سجل المصروفات المباشر' : 'Outgoing Expense Ledger'}
        </h3>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {filteredExpenses.map(exp => {
            const meta = CATEGORY_META[exp.category] || CATEGORY_META.other
            return (
              <div key={exp.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{exp.title}</h4>
                    {exp.recipientName && (
                      <p className="text-xs font-medium text-stone-600 mt-0.5">
                        {isRTL ? 'المستلم:' : 'To:'} {exp.recipientName}
                      </p>
                    )}
                    <span className="text-[10px] text-stone-400 font-medium font-mono">
                      {new Date(exp.paidAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${meta.color}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                  <span className="font-mono text-base font-black text-rose-600">
                    -{formatPrice(exp.amount, currentStore?.currency || 'USD')}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenEdit(exp)}
                      className="p-2 bg-white rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 active:scale-95"
                      title={isRTL ? 'تعديل' : 'Edit'}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(isRTL ? `هل أنت متأكد من حذف المصروف "${exp.title}"؟` : `Delete expense "${exp.title}"?`)) {
                          onDelete(exp.id)
                        }
                      }}
                      className="p-2 bg-rose-50 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-100 active:scale-95"
                      title={isRTL ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {filteredExpenses.length === 0 && (
            <div className="py-12 text-center text-muted-foreground font-bold italic text-sm">
              {isRTL ? 'لا توجد مصروفات مسجلة حتى الآن.' : 'No expenses recorded yet.'}
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-start rtl:text-right">
            <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="py-4 px-3 font-black">{isRTL ? 'التاريخ' : 'Date'}</th>
                <th className="py-4 px-3 font-black">{isRTL ? 'البيان / الوصف' : 'Description'}</th>
                <th className="py-4 px-3 font-black">{isRTL ? 'المستفيد / الموظف' : 'Recipient / Staff'}</th>
                <th className="py-4 px-3 font-black">{isRTL ? 'التصنيف' : 'Category'}</th>
                <th className="py-4 px-3 font-black">{isRTL ? 'طريقة الصرف' : 'Payment Method'}</th>
                <th className="py-4 px-3 font-black">{isRTL ? 'المبلغ' : 'Amount'}</th>
                <th className="py-4 px-3 text-end font-black">{isRTL ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredExpenses.map(exp => {
                const meta = CATEGORY_META[exp.category] || CATEGORY_META.other
                return (
                  <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 px-3 text-xs font-mono text-stone-500">
                      {new Date(exp.paidAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                    </td>

                    <td className="py-4 px-3">
                      <div className="font-bold text-stone-900 text-sm">{exp.title}</div>
                      {exp.notes && <div className="text-[10px] text-stone-400 italic truncate max-w-[200px]">{exp.notes}</div>}
                    </td>

                    <td className="py-4 px-3 text-xs font-medium text-stone-700">
                      {exp.recipientName || '—'}
                    </td>

                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-xs font-bold uppercase text-stone-500">
                      {exp.paymentMethod || 'cash'}
                    </td>

                    <td className="py-4 px-3 font-mono font-black text-sm text-rose-600">
                      -{formatPrice(exp.amount, currentStore?.currency || 'USD')}
                    </td>

                    <td className="py-4 px-3 text-end">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEdit(exp)}
                          className="p-2 text-stone-400 hover:text-stone-900 bg-secondary rounded-lg hover:bg-stone-200 transition-colors"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(isRTL ? `حذف المصروف "${exp.title}"؟` : `Delete expense "${exp.title}"?`)) {
                              onDelete(exp.id)
                            }
                          }}
                          className="p-2 text-stone-400 hover:text-rose-600 bg-secondary rounded-lg hover:bg-rose-50 transition-colors"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground font-bold italic text-sm">
                    {isRTL ? 'لا توجد قيود مصروفات أو رواتب مسجلة حتى الآن.' : 'No expense or payroll entries recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
