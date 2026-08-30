'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import ProductCard from '@/components/product-card'
import { api } from '@/lib/api'
import { Product } from '@/lib/types'
import { motion } from 'framer-motion'
import { Archive, Sparkles, Clock, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export default function PastCollectionsPage() {
  const { t, isRTL } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState<string>('all')

  const seasons = [
    { id: 'all', label: 'All Archives' },
    { id: 'fw24', label: 'Autumn / Winter 2024' },
    { id: 'ss24', label: 'Spring / Summer 2024' },
    { id: 'fw23', label: 'Heritage Capsule 2023' },
  ]

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        setLoading(true)
        const data = await api.products.list()
        // Filter past collections
        const archival = Array.isArray(data)
          ? data.filter((p: any) => p.isPastCollection || p.customizationOptions?.isPastCollection)
          : []
        setProducts(archival)
      } catch (err) {
        console.error('Failed to load archives:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArchive()
  }, [])

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-gold-500 selection:text-stone-950">
      <Header />

      {/* Hero Header */}
      <section className="relative py-16 sm:py-24 md:py-36 border-b border-stone-800 bg-stone-950 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />

        <div className="section-container relative z-10 px-4 sm:px-6 text-center space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Archive className="w-4 h-4 text-gold-400" />
            <span className="font-jost text-[10px] font-bold text-gold-400 uppercase tracking-[0.4em]">
              {t('Heritage Vault', 'خزانة التراث والأرشيف')}
            </span>
          </div>

          <h1 className="font-bodoni text-4xl sm:text-6xl md:text-8xl font-bold uppercase leading-none tracking-tight">
            {t('The Archive.', 'الأرشيف.')}<br />
            <span className="italic font-normal text-stone-400">{t('Past Collections.', 'المجموعات السابقة.')}</span>
          </h1>

          <p className="font-jost text-xs sm:text-sm text-stone-400 font-light leading-relaxed tracking-wider max-w-xl mx-auto">
            {t('Rare, vaulted sartorial silhouettes, limited editions, and heritage pieces from our atelier historic drops. Available until remaining stock is exhausted.', 'قطع نادرة ومجموعات تاريخية وإصدارات محدودة من مشغلنا. متاحة حتى نفاد الكمية المخزنة.')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="section-container px-4 sm:px-6 py-12 sm:py-20 space-y-10 sm:space-y-16">
        {/* Season Filter Switcher - Swipeable */}
        <div className="flex items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-stone-800 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none flex-nowrap -mx-2 px-2">
            {seasons.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSeason(s.id)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-jost font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${
                  selectedSeason === s.id
                    ? 'bg-white text-stone-950 shadow-xl'
                    : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                {t(s.label, s.label)}
              </button>
            ))}
          </div>

          <span className="text-[10px] sm:text-xs font-jost uppercase tracking-widest text-stone-500 font-bold">
            {products.length} {t('Archival Artifacts', 'قطع أرشيفية')}
          </span>
        </div>

        {/* Archival Grid - Mobile 2-cols with tight responsive gap */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="bg-stone-900 aspect-[4/5] rounded-2xl sm:rounded-[2rem] animate-pulse" />
                <div className="h-4 bg-stone-900 w-2/3 rounded animate-pulse" />
                <div className="h-4 bg-stone-900 w-1/3 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-16">
            {products.map((item, index) => (
              <div key={item.id} className="text-stone-900">
                <ProductCard product={item} index={index} />
              </div>
            ))}
          </div>
        )}

        {/* Archival Certificate Note */}
        <div className="p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2.5rem] bg-stone-900/60 border border-stone-800 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left">
          <div className="space-y-2">
            <ShieldCheck className="w-6 h-6 text-gold-400 mx-auto md:mx-0" />
            <h4 className="font-bodoni text-lg font-bold uppercase text-white">{t('Archival Provenance', 'أصالة معتمدة للأرشيف')}</h4>
            <p className="text-xs text-stone-400 leading-relaxed">{t('Each piece is inspected, authenticated, and cataloged with a permanent registry number.', 'كل قطعة مفحوصة وموثقة برقم سجل دائم.')}</p>
          </div>
          <div className="space-y-2">
            <Clock className="w-6 h-6 text-gold-400 mx-auto md:mx-0" />
            <h4 className="font-bodoni text-lg font-bold uppercase text-white">{t('Limited Allocation', 'كميات محدودة جداً')}</h4>
            <p className="text-xs text-stone-400 leading-relaxed">{t('Once past collection inventory is exhausted, designs are vaulted and never reproduced.', 'بمجرد نفاد المخزون، تغلق التصاميم نهائياً ولا يتم إعادة تصنيعها.')}</p>
          </div>
          <div className="space-y-2">
            <Sparkles className="w-6 h-6 text-gold-400 mx-auto md:mx-0" />
            <h4 className="font-bodoni text-lg font-bold uppercase text-white">{t('Curator Concierge', 'خدمة المنسق الخاص')}</h4>
            <p className="text-xs text-stone-400 leading-relaxed">{t('Direct WhatsApp assistance available for provenance verification and bespoke alterations.', 'مساعدة مباشرة عبر واتساب للتحقق والتعديلات الخاصة.')}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
