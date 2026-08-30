'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Ruler, Sparkles, Check } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/lib/language-context'

interface SizeGuideModalProps {
  isOpen: boolean
  onClose: () => void
  category?: string
}

export default function SizeGuideModal({ isOpen, onClose, category = 'apparel' }: SizeGuideModalProps) {
  const { t, isRTL } = useLanguage()
  const [unit, setUnit] = useState<'cm' | 'in'>('cm')
  const [tab, setTab] = useState<'tops' | 'bottoms' | 'footwear'>('tops')

  if (!isOpen) return null

  const topsSizes = [
    { size: 'XS', us: '34', uk: '34', eu: '44', chestCm: '86-91', chestIn: '34-36', waistCm: '71-76', waistIn: '28-30' },
    { size: 'S', us: '36', uk: '36', eu: '46', chestCm: '91-96', chestIn: '36-38', waistCm: '76-81', waistIn: '30-32' },
    { size: 'M', us: '38-40', uk: '38-40', eu: '48-50', chestCm: '96-102', chestIn: '38-40', waistCm: '81-86', waistIn: '32-34' },
    { size: 'L', us: '42-44', uk: '42-44', eu: '52-54', chestCm: '102-107', chestIn: '40-42', waistCm: '86-91', waistIn: '34-36' },
    { size: 'XL', us: '46', uk: '46', eu: '56', chestCm: '107-112', chestIn: '42-44', waistCm: '91-96', waistIn: '36-38' },
    { size: 'XXL', us: '48', uk: '48', eu: '58', chestCm: '112-117', chestIn: '44-46', waistCm: '96-101', waistIn: '38-40' },
  ]

  const footwearSizes = [
    { eu: '39', usMen: '6.5', usWomen: '8', uk: '6', cm: '24.5' },
    { eu: '40', usMen: '7.5', usWomen: '9', uk: '6.5', cm: '25.0' },
    { eu: '41', usMen: '8', usWomen: '9.5', uk: '7', cm: '26.0' },
    { eu: '42', usMen: '8.5', usWomen: '10', uk: '7.5', cm: '26.5' },
    { eu: '43', usMen: '9.5', usWomen: '11', uk: '8.5', cm: '27.5' },
    { eu: '44', usMen: '10', usWomen: '11.5', uk: '9', cm: '28.0' },
    { eu: '45', usMen: '11', usWomen: '12.5', uk: '10', cm: '29.0' },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-stone-950/70 backdrop-blur-md p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white text-stone-900 border border-stone-200 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl p-6 sm:p-8 relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center border border-gold-200">
              <Ruler className="w-4 h-4 text-gold-600" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-gold-600">
              {t('Atelier Sizing Guide')}
            </span>
          </div>

          <h3 className="font-bodoni text-2xl sm:text-3xl font-bold uppercase tracking-tight text-stone-900">
            {t('Precision Measurements')}
          </h3>
          <p className="text-xs text-stone-500 font-medium mt-1 leading-relaxed">
            {t('Tailored to international luxury standards. All garments are calibrated for architectural drape.')}
          </p>

          {/* Controls: Unit & Tab Switchers */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pb-4 border-b border-stone-100">
            {/* Tabs */}
            <div className="flex p-1 bg-stone-100 rounded-xl text-xs font-black uppercase tracking-wider w-full sm:w-auto">
              <button
                onClick={() => setTab('tops')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  tab === 'tops' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {t('Tailoring & Tops')}
              </button>
              <button
                onClick={() => setTab('footwear')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  tab === 'footwear' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {t('Footwear')}
              </button>
            </div>

            {/* Unit Switcher */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-bold">
              <span className="text-[10px] uppercase text-stone-400 font-jost">{t('Units:')}</span>
              <div className="flex p-0.5 bg-stone-100 rounded-lg">
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 rounded-md text-[11px] font-black transition-all ${
                    unit === 'cm' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  CM
                </button>
                <button
                  onClick={() => setUnit('in')}
                  className={`px-3 py-1 rounded-md text-[11px] font-black transition-all ${
                    unit === 'in' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  IN
                </button>
              </div>
            </div>
          </div>

          {/* Sizing Table */}
          <div className="mt-6 overflow-x-auto">
            {tab === 'tops' ? (
              <table className={`w-full text-xs ${isRTL ? 'text-right' : 'text-left'}`}>
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] uppercase font-black tracking-wider text-stone-400">
                    <th className="pb-3 px-2">{t('Size')}</th>
                    <th className="pb-3 px-2">US / UK</th>
                    <th className="pb-3 px-2">EU</th>
                    <th className="pb-3 px-2">{unit === 'cm' ? t('Chest (cm)') : t('Chest (in)')}</th>
                    <th className="pb-3 px-2">{unit === 'cm' ? t('Waist (cm)') : t('Waist (in)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {topsSizes.map((row) => (
                    <tr key={row.size} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-2 font-black text-stone-900">{row.size}</td>
                      <td className="py-3 px-2 text-stone-500">{row.us}</td>
                      <td className="py-3 px-2 text-stone-500">{row.eu}</td>
                      <td className="py-3 px-2 font-mono font-bold text-stone-900">
                        {unit === 'cm' ? row.chestCm : row.chestIn}
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-stone-900">
                        {unit === 'cm' ? row.waistCm : row.waistIn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className={`w-full text-xs ${isRTL ? 'text-right' : 'text-left'}`}>
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] uppercase font-black tracking-wider text-stone-400">
                    <th className="pb-3 px-2">{t('EU Size')}</th>
                    <th className="pb-3 px-2">{t('US Men')}</th>
                    <th className="pb-3 px-2">{t('US Women')}</th>
                    <th className="pb-3 px-2">UK</th>
                    <th className="pb-3 px-2">{t('Foot Length (CM)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {footwearSizes.map((row) => (
                    <tr key={row.eu} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-2 font-black text-stone-900">{row.eu}</td>
                      <td className="py-3 px-2 text-stone-500">{row.usMen}</td>
                      <td className="py-3 px-2 text-stone-500">{row.usWomen}</td>
                      <td className="py-3 px-2 text-stone-500">{row.uk}</td>
                      <td className="py-3 px-2 font-mono font-bold text-stone-900">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Advice Footer */}
          <div className="mt-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-stone-600 leading-relaxed">
              <strong className="text-stone-900">{t('Stylist Recommendation:')} </strong>
              {t('If you are between sizes, we recommend ordering one size up for a more relaxed architectural drape, or selecting your exact size for precise tailoring.')}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
