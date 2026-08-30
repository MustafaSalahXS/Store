'use client'

import React, { useState } from 'react'
import {
  TrendingUp,
  Zap,
  Check,
  Calendar,
  DollarSign,
  Download,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Wallet,
  BarChart3,
  PieChart,
  ShoppingBag,
  Layers,
  Sparkles
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'
import { MonthlyFinancial } from './types'

interface RevenueSectionProps {
  orders: any[]
  currentStore: any
  monthlyFinancials?: MonthlyFinancial[]
  t: (key: string, fallback?: string) => string
}

export default function RevenueSection({
  orders,
  currentStore,
  monthlyFinancials = [],
  t
}: RevenueSectionProps) {
  const { isRTL } = useLanguage()
  const approvedOrders = orders.filter(o => o.orderStatus === 'approved')
  const totalSettled = approvedOrders.reduce((sum, o) => {
    const val = Number(o.total)
    return sum + (!isNaN(val) ? val : 0)
  }, 0)

  // Default to first month or overall
  const [selectedMonth, setSelectedMonth] = useState<string>(
    monthlyFinancials.length > 0 ? monthlyFinancials[0].month : ''
  )

  const activeMonthData = monthlyFinancials.find(m => m.month === selectedMonth) || {
    month: isRTL ? 'الفترة الحالية' : 'Current Period',
    grossRevenue: totalSettled,
    cogsTotal: approvedOrders.reduce((s, o) => s + (Number(o.cogsTotal) || 0), 0),
    expensesTotal: 0,
    netProfit: totalSettled,
    profitMargin: 100,
    orderCount: approvedOrders.length
  }

  const exportMonthlyCsv = () => {
    const headers = 'Month,Gross Revenue,COGS (Capital Outflow),Staff & Expenses,Net Profit,Profit Margin %,Order Count\n'
    const rows = monthlyFinancials.map(m =>
      `${m.month},${m.grossRevenue},${m.cogsTotal},${m.expensesTotal},${m.netProfit},${m.profitMargin}%,${m.orderCount}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate percentages for visual distribution bar
  const gross = Number(activeMonthData.grossRevenue) || 1
  const cogsPercent = Math.min(100, Math.max(0, Math.round(((activeMonthData.cogsTotal || 0) / gross) * 100)))
  const expensesPercent = Math.min(100 - cogsPercent, Math.max(0, Math.round(((activeMonthData.expensesTotal || 0) / gross) * 100)))
  const profitPercent = Math.max(0, 100 - cogsPercent - expensesPercent)

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-28 sm:pb-8 max-w-full overflow-hidden">
      {/* Month Selector & Export Header (Mobile Responsive) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
            <span>{isRTL ? 'محاسبة المبيعات والأرباح وراس المال' : 'Monthly Sales & Capital Outflow Accounting'}</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
            {isRTL
              ? 'تسوية دورية شاملة لإجمالي المبيعات، تكلفة البضاعة المباعة (راس المال)، الرواتب والمصروفات، وصافي الأرباح.'
              : 'Month-by-month reconciliation of gross sales, merchandise capital, staff payroll, and net profit.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {monthlyFinancials.length > 0 && (
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full sm:w-56 px-3 py-2.5 bg-card border border-border rounded-xl text-xs font-bold outline-none cursor-pointer shadow-xs text-stone-900"
              >
                {monthlyFinancials.map(m => (
                  <option key={m.month} value={m.month}>
                    {m.month} {isRTL ? '• كشف حساب' : '• Statement'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={exportMonthlyCsv}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-secondary hover:bg-secondary/80 text-stone-800 border border-border rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            title="Download CSV Statement"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>{isRTL ? 'تصدير CSV' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Highlight KPI Cards (2-column on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {/* 1. Gross Sales */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'إجمالي المبيعات' : 'Gross Sales'}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-emerald-600 truncate font-mono">
            {formatPrice(activeMonthData.grossRevenue, currentStore?.currency || 'USD')}
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5">
            {activeMonthData.orderCount} {isRTL ? 'طلب مكتمل' : 'orders'}
          </span>
        </div>

        {/* 2. Capital Outflow / COGS */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'راس المال الخارج' : 'Capital (COGS)'}
            </span>
            <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-amber-600 truncate font-mono">
            {formatPrice(activeMonthData.cogsTotal, currentStore?.currency || 'USD')}
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5 truncate">
            {isRTL ? 'تكلفة المنتجات' : 'Cost of goods'}
          </span>
        </div>

        {/* 3. Staff & Operational Expenses */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'المصروفات والرواتب' : 'Staff & Expenses'}
            </span>
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-rose-600 truncate font-mono">
            {formatPrice(activeMonthData.expensesTotal, currentStore?.currency || 'USD')}
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5 truncate">
            {isRTL ? 'التشغيل والأجور' : 'Payroll & overhead'}
          </span>
        </div>

        {/* 4. Net Profit */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'صافي الربح' : 'Net Realized Profit'}
            </span>
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-primary truncate font-mono">
            {formatPrice(activeMonthData.netProfit, currentStore?.currency || 'USD')}
          </p>
          <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 block mt-0.5">
            {activeMonthData.profitMargin}% {isRTL ? 'هامش الربح' : 'Margin'}
          </span>
        </div>
      </div>

      {/* Visual Revenue Distribution Bar for Mobile & Desktop */}
      <div className="bg-card rounded-2xl p-3.5 sm:p-5 border border-border shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-800">
          <span className="flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-primary" />
            <span>{isRTL ? 'توزيع دخل الفترة الحالية:' : 'Current Period Inflow Breakdown:'}</span>
            <span className="text-stone-400 font-normal">({activeMonthData.month})</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-600">
            {isRTL ? `صافي ربح ${profitPercent}%` : `${profitPercent}% Net Profit`}
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-3.5 sm:h-4 w-full bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${profitPercent}%` }}
            className="bg-emerald-500 hover:bg-emerald-600 transition-all"
            title={`Net Profit: ${profitPercent}%`}
          />
          <div
            style={{ width: `${cogsPercent}%` }}
            className="bg-amber-500 hover:bg-amber-600 transition-all"
            title={`COGS (Capital Outflow): ${cogsPercent}%`}
          />
          <div
            style={{ width: `${expensesPercent}%` }}
            className="bg-rose-500 hover:bg-rose-600 transition-all"
            title={`Expenses & Staff: ${expensesPercent}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between gap-2 pt-1 text-[10px] sm:text-xs font-bold text-stone-600 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{isRTL ? 'صافي الربح' : 'Net Profit'} ({profitPercent}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>{isRTL ? 'راس المال الخارج' : 'Capital COGS'} ({cogsPercent}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span>{isRTL ? 'المصروفات' : 'Expenses'} ({expensesPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Monthly Statements Section */}
      <div className="bg-card rounded-2xl sm:rounded-[2rem] border border-border p-3.5 sm:p-6 md:p-8 shadow-sm sm:shadow-xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-border">
          <div>
            <h3 className="text-lg sm:text-2xl font-black tracking-tight text-stone-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <span>{isRTL ? 'كشوفات الحسابات الشهرية السابقة' : 'Historical Monthly Financial Statements'}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL
                ? 'اضغط على أي شهر لعرض تفاصيل الإيرادات والمصروفات الخاصة به.'
                : 'Click any monthly statement to inspect detailed revenue and cost breakdowns.'}
            </p>
          </div>
        </div>

        {/* Mobile Monthly Statement Cards (Touch-friendly on phones) */}
        <div className="md:hidden space-y-3.5">
          {monthlyFinancials.map(m => {
            const isSelected = selectedMonth === m.month
            return (
              <div
                key={m.month}
                onClick={() => setSelectedMonth(m.month)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 shadow-xs active:scale-[0.99] ${
                  isSelected
                    ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-md'
                    : 'bg-white border-stone-200/80 hover:border-stone-400'
                }`}
              >
                {/* Card Header: Month, Selected Tag, and Margin Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isSelected ? 'bg-primary text-white' : 'bg-secondary text-stone-700'
                    }`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-stone-900 text-sm font-mono block">
                        {m.month}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium block">
                        {m.orderCount} {isRTL ? 'طلب مكتمل' : 'Orders Completed'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black font-mono border ${
                    m.profitMargin >= 30
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : m.profitMargin >= 10
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {m.profitMargin}% {isRTL ? 'هامش' : 'Margin'}
                  </span>
                </div>

                {/* 4-Cell Rate Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50/90 p-2.5 rounded-xl border border-stone-100 font-mono">
                  <div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block font-sans">
                      {isRTL ? 'المبيعات:' : 'Sales Inflow:'}
                    </span>
                    <span className="font-bold text-emerald-600 text-xs sm:text-sm">
                      +{formatPrice(m.grossRevenue, currentStore?.currency || 'USD')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block font-sans">
                      {isRTL ? 'راس المال (COGS):' : 'Capital Outflow:'}
                    </span>
                    <span className="font-bold text-amber-600 text-xs sm:text-sm">
                      -{formatPrice(m.cogsTotal, currentStore?.currency || 'USD')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block font-sans">
                      {isRTL ? 'المصروفات والرواتب:' : 'Expenses:'}
                    </span>
                    <span className="font-bold text-rose-600 text-xs sm:text-sm">
                      -{formatPrice(m.expensesTotal, currentStore?.currency || 'USD')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block font-sans">
                      {isRTL ? 'صافي الربح:' : 'Net Profit:'}
                    </span>
                    <span className="font-black text-primary text-xs sm:text-sm">
                      {formatPrice(m.netProfit, currentStore?.currency || 'USD')}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Active Selector feedback */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px]">
                  <span className="text-stone-400 font-medium">
                    {isSelected
                      ? (isRTL ? '✓ تم تحديده للعرض بالأعلى' : '✓ Active statement selected')
                      : (isRTL ? 'انقر لتحديده وعرض تفاصيله' : 'Tap to select statement')}
                  </span>
                  <span className={`font-bold uppercase tracking-wider ${
                    isSelected ? 'text-primary' : 'text-stone-400'
                  }`}>
                    {isSelected ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'عرض' : 'Select')}
                  </span>
                </div>
              </div>
            )
          })}

          {monthlyFinancials.length === 0 && (
            <div className="py-12 text-center text-muted-foreground font-bold italic text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-stone-300" />
              <p>{isRTL ? 'لا توجد كشوفات شهرية سابقة متاحة حتى الآن.' : 'No historical monthly records available yet.'}</p>
            </div>
          )}
        </div>

        {/* Desktop Table View (`hidden md:block`) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="py-4 px-3 font-black">Month</th>
                <th className="py-4 px-3 font-black">Gross Sales</th>
                <th className="py-4 px-3 font-black">Capital Outflow (COGS)</th>
                <th className="py-4 px-3 font-black">Staff & Operating Costs</th>
                <th className="py-4 px-3 font-black">Net Realized Profit</th>
                <th className="py-4 px-3 font-black">Margin</th>
                <th className="py-4 px-3 text-right font-black">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {monthlyFinancials.map(m => (
                <tr
                  key={m.month}
                  onClick={() => setSelectedMonth(m.month)}
                  className={`hover:bg-stone-50/70 transition-colors cursor-pointer ${
                    selectedMonth === m.month ? 'bg-primary/5 font-bold' : ''
                  }`}
                >
                  <td className="py-4 px-3 font-bold text-stone-900 text-sm font-mono flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {m.month}
                  </td>
                  <td className="py-4 px-3 font-mono font-bold text-sm text-emerald-600">
                    +{formatPrice(m.grossRevenue, currentStore?.currency || 'USD')}
                  </td>
                  <td className="py-4 px-3 font-mono font-bold text-sm text-amber-600">
                    -{formatPrice(m.cogsTotal, currentStore?.currency || 'USD')}
                  </td>
                  <td className="py-4 px-3 font-mono font-bold text-sm text-rose-600">
                    -{formatPrice(m.expensesTotal, currentStore?.currency || 'USD')}
                  </td>
                  <td className="py-4 px-3 font-mono font-black text-sm text-primary">
                    {formatPrice(m.netProfit, currentStore?.currency || 'USD')}
                  </td>
                  <td className="py-4 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono border ${
                      m.profitMargin >= 30
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : m.profitMargin >= 10
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {m.profitMargin}%
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right font-mono font-bold text-stone-700">
                    {m.orderCount}
                  </td>
                </tr>
              ))}
              {monthlyFinancials.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground font-bold italic text-sm">
                    No historical monthly records available yet.
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
