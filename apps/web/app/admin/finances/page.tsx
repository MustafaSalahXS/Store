'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import { getFinancialMetrics, getAnalyticsMetrics, FinancialMetrics, AnalyticsMetrics } from '@/lib/admin'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, DollarSign, TrendingUp, TrendingDown, AlertCircle, Download } from 'lucide-react'
import Link from 'next/link'

export default function FinancesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentStore } = useStore()

  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('30days')

  useEffect(() => {
    if (!user || !['super_admin', 'store_admin', 'accountant'].includes(user.role)) {
      router.push('/dashboard')
      return
    }

    if (currentStore) loadData()
  }, [user, currentStore, router, dateRange])

  const loadData = async () => {
    try {
      setLoading(true)
      if (!currentStore) return

      const metricsData = await getFinancialMetrics(currentStore.id)
      setMetrics(metricsData)

      const analyticsData = await getAnalyticsMetrics(currentStore.id)
      setAnalytics(analyticsData)
    } catch (err) {
      setError('Failed to load financial data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Financial Reports</h1>
            <p className="text-xs sm:text-sm text-slate-600">Monitor your store's financial performance</p>
          </div>
          <Link href="/admin" className="self-start sm:self-auto">
            <Button size="sm">Back to Admin</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Alerts */}
        {error && (
          <Card className="mb-4 p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Date Range & Export */}
        <Card className="p-3 sm:p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-1">
            {['7days', '30days', '90days', 'all'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition shrink-0 ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {range === '7days' ? 'Last 7 Days' :
                 range === '30days' ? 'Last 30 Days' :
                 range === '90days' ? 'Last 90 Days' :
                 'All Time'}
              </button>
            ))}
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition text-xs sm:text-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </Card>

        {/* Revenue Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-600 text-sm">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">
              EGP {metrics?.totalRevenue.toLocaleString() || 0}
            </p>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% vs last period</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-600 text-sm">Net Revenue</p>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">
              EGP {metrics?.netRevenue.toLocaleString() || 0}
            </p>
            <p className="text-xs text-slate-600">After refunds</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-600 text-sm">Gross Profit</p>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">
              EGP {metrics?.grossProfit.toLocaleString() || 0}
            </p>
            <p className="text-xs text-slate-600">{(metrics?.grossProfitMargin || 0).toFixed(1)}% margin</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-600 text-sm">Total Refunds</p>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">
              EGP {metrics?.totalRefunds.toLocaleString() || 0}
            </p>
            <p className="text-xs text-slate-600">0.2% of revenue</p>
          </Card>
        </div>

        {/* Orders & AOV */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Order Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900">{metrics?.totalOrders || 0}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-600">Average Order Value</p>
                <p className="text-2xl font-bold text-slate-900">EGP {Math.round(metrics?.averageOrderValue || 0)}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-600">Cost of Goods Sold</p>
                <p className="text-2xl font-bold text-slate-900">EGP {(metrics?.costOfGoods || 0).toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Customer Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-600">Unique Customers</p>
                <p className="text-2xl font-bold text-slate-900">{analytics?.uniqueCustomers || 0}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-600">Returning Customers</p>
                <p className="text-2xl font-bold text-slate-900">{analytics?.repeatingCustomers || 0}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-900">{(analytics?.conversionRate || 0).toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Profit Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Profit Breakdown</h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-600">Revenue</p>
                <p className="font-semibold text-slate-900">EGP {metrics?.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-600">Cost of Goods</p>
                <p className="font-semibold text-slate-900">EGP {(metrics?.costOfGoods || 0).toLocaleString()}</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${metrics?.totalRevenue && metrics.costOfGoods ? (metrics.costOfGoods / metrics.totalRevenue * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-green-900">Gross Profit</p>
                <p className="text-2xl font-bold text-green-900">EGP {metrics?.grossProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
