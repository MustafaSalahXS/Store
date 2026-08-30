'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader, Truck, MapPin, Check, Sparkles } from 'lucide-react'
import { EGYPT_ZONE_PRESETS } from './zone-presets'

interface DeliveryZoneModalProps {
  isOpen: boolean
  onClose: () => void
  editingZone: any
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  currentStore: any
  t: (key: string, fallback?: string) => string
}

export default function DeliveryZoneModal({
  isOpen,
  onClose,
  editingZone,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  currentStore,
  t
}: DeliveryZoneModalProps) {
  const handleSelectPreset = (presetId: string) => {
    if (!presetId) return
    const found = EGYPT_ZONE_PRESETS.find(p => p.id === presetId)
    if (found) {
      setFormData({
        ...formData,
        nameAr: found.nameAr,
        nameEn: found.nameEn,
        city: found.city,
        deliveryFee: found.deliveryFee,
        taxRate: found.taxRate,
        estimatedDays: found.estimatedDays
      })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-stone-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 25 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 25 }}
            className="bg-white w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-10 border border-stone-100 shadow-2xl relative"
          >
            {/* Mobile swipe handle */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-1 mb-3 sm:hidden" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-stone-100 rounded-full text-stone-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 sm:mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  Logistics & Area Taxes
                </span>
              </div>
              <h3 className="font-bodoni text-xl sm:text-3xl font-bold uppercase text-stone-900">
                {editingZone ? 'Update' : 'New'} Delivery Zone
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Configure delivery rates, estimated arrival time, and location taxes.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* ZONE NAMES PRESET DROPDOWN MENU */}
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-1.5">
                <label className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Zone Names Drop Down Menu (اختر منطقة أو محافظة جاهزة)
                  </span>
                  <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                    Auto-Fill
                  </span>
                </label>
                <select
                  defaultValue=""
                  onChange={e => handleSelectPreset(e.target.value)}
                  className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-stone-900 outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs cursor-pointer"
                >
                  <option value="">-- Choose Zone (Qena, Sohag, Luxor, Hurghada...) --</option>
                  
                  <optgroup label="⭐ Top Priority Requested Zones (المناطق ذات الأولوية)">
                    <option value="qena">Qena - قنا</option>
                    <option value="sohag">Sohag - سوهاج</option>
                    <option value="luxor">Luxor - الأقصر</option>
                    <option value="hurghada">Hurghada - الغردقة / البحر الأحمر</option>
                  </optgroup>

                  <optgroup label="🏙️ Metropolitan Hubs (القاهرة والجيزة والإسكندرية)">
                    <option value="cairo">Greater Cairo - القاهرة الكبرى</option>
                    <option value="giza">Giza & 6th October - الجيزة و 6 أكتوبر</option>
                    <option value="alexandria">Alexandria - الإسكندرية</option>
                  </optgroup>

                  <optgroup label="🌾 Upper Egypt (محافظات الصعيد)">
                    <option value="aswan">Aswan - أسوان</option>
                    <option value="asyut">Asyut - أسيوط</option>
                    <option value="minya">Minya - المنيا</option>
                    <option value="beni_suef">Beni Suef - بني سويف</option>
                    <option value="fayoum">Fayoum - الفيوم</option>
                    <option value="new_valley">New Valley - الوادي الجديد</option>
                  </optgroup>

                  <optgroup label="🌊 Delta & Lower Egypt (الدلتا ووجه بحري)">
                    <option value="mansoura">Mansoura & Dakahlia - المنصورة والدقهلية</option>
                    <option value="tanta">Tanta & Gharbia - طنطا والغربية</option>
                    <option value="zagazig">Zagazig & Sharqia - الزقازيق والشرقية</option>
                    <option value="qalyubia">Qalyubia & Banha - القليوبية وبنها</option>
                    <option value="monufia">Monufia - المنوفية</option>
                    <option value="beheira">Beheira - البحيرة</option>
                    <option value="kafr_el_sheikh">Kafr El Sheikh - كفر الشيخ</option>
                    <option value="damietta">Damietta - دمياط</option>
                  </optgroup>

                  <optgroup label="🚢 Canal & Coastal Cities (القناة والمدن الساحلية)">
                    <option value="port_said">Port Said - بورسعيد</option>
                    <option value="ismailia">Ismailia - الإسماعيلية</option>
                    <option value="suez">Suez - السويس</option>
                    <option value="red_sea">Red Sea (Safaga, El Gouna) - البحر الأحمر</option>
                    <option value="sharm">Sharm El Sheikh - شرم الشيخ وجنوب سيناء</option>
                    <option value="matrouh">Marsa Matrouh - مرسى مطروح والساحل الشمالي</option>
                    <option value="arish">North Sinai - شمال سيناء والعريش</option>
                  </optgroup>
                </select>
                <p className="text-[10px] text-amber-800/80 font-medium">
                  Selecting a preset will automatically populate Arabic and English names, suggested shipping fee, and delivery duration.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Zone Name (Arabic) *
                </label>
                <input
                  required
                  dir="rtl"
                  value={formData.nameAr}
                  onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: قنا، سوهاج، الأقصر، الغردقة، القاهرة"
                  className="w-full p-3 sm:p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 outline-none focus:bg-white focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Zone Name (English) *
                </label>
                <input
                  required
                  value={formData.nameEn}
                  onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g. Qena, Sohag, Luxor, Hurghada, Cairo"
                  className="w-full p-3 sm:p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 outline-none focus:bg-white focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Delivery Fee ({currentStore?.currency || 'USD'}) *
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.deliveryFee}
                    onChange={e => setFormData({ ...formData, deliveryFee: e.target.value })}
                    placeholder="85"
                    className="w-full p-3 sm:p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-black text-stone-900 outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Location Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.taxRate}
                    onChange={e => setFormData({ ...formData, taxRate: e.target.value })}
                    placeholder="14"
                    className="w-full p-3 sm:p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-black text-stone-900 outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Estimated Delivery Window
                </label>
                <input
                  value={formData.estimatedDays}
                  onChange={e => setFormData({ ...formData, estimatedDays: e.target.value })}
                  placeholder="e.g. 2-3 Days, 24 Hours, 2-4 Days"
                  className="w-full p-3 sm:p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none"
                />
              </div>

              <div
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer select-none transition-all active:scale-98 ${
                  formData.isActive ? 'bg-green-50 border-green-200 text-green-800' : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}
              >
                <div>
                  <div className="font-black text-xs uppercase tracking-wider">
                    {formData.isActive ? 'Zone Active' : 'Zone Disabled'}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {formData.isActive ? 'Shoppers can select this zone during checkout' : 'Zone hidden from checkout options'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary pointer-events-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-8 py-3 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  {isSubmitting && <Loader className="w-3.5 h-3.5 animate-spin" />}
                  {editingZone ? 'Save Changes' : 'Create Delivery Zone'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
