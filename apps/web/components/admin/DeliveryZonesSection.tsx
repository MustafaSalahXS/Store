'use client'

import React, { useState, useMemo } from 'react'
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Percent,
  Coins,
  ShieldCheck,
  User,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Layers,
  Sparkles,
  RefreshCw,
  Power
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'
import { DeliveryZone } from './types'
import { EGYPT_ZONE_PRESETS, ZonePreset } from './zone-presets'

interface DeliveryZonesSectionProps {
  zones: DeliveryZone[]
  staffUsers?: any[]
  currentStore: any
  onOpenCreate: (preset?: ZonePreset) => void
  onOpenEdit: (zone: DeliveryZone) => void
  onDelete: (id: string) => void
  onSeedAllZones?: () => void
  onToggleStatus?: (zone: DeliveryZone) => void
  t: (key: string, fallback?: string) => string
}

export default function DeliveryZonesSection({
  zones,
  staffUsers = [],
  currentStore,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onSeedAllZones,
  onToggleStatus,
  t
}: DeliveryZonesSectionProps) {
  const { isRTL } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all')
  const [selectedZoneName, setSelectedZoneName] = useState<string>('all')
  const [presetToAdd, setPresetToAdd] = useState<string>('qena')
  const [isSyncing, setIsSyncing] = useState(false)

  const activeCount = zones.filter(z => z.isActive).length
  const disabledCount = zones.length - activeCount

  // Filtered zones combining search, status filter, and selected zone name dropdown
  const filteredZones = useMemo(() => {
    return zones.filter(z => {
      // Zone Names Drop Down Menu Filter
      if (selectedZoneName !== 'all') {
        const target = selectedZoneName.toLowerCase()
        const matchAr = (z.nameAr || '').toLowerCase().includes(target)
        const matchEn = (z.nameEn || '').toLowerCase().includes(target)
        const matchCity = (z.city || '').toLowerCase().includes(target)
        if (!matchAr && !matchEn && !matchCity) return false
      }

      // Free Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchAr = (z.nameAr || '').toLowerCase().includes(q)
        const matchEn = (z.nameEn || '').toLowerCase().includes(q)
        const matchEta = (z.estimatedDays || '').toLowerCase().includes(q)
        if (!matchAr && !matchEn && !matchEta) return false
      }

      // Status Filter
      if (statusFilter === 'active' && !z.isActive) return false
      if (statusFilter === 'disabled' && z.isActive) return false
      return true
    })
  }, [zones, selectedZoneName, searchQuery, statusFilter])

  const averageFee = zones.length > 0
    ? zones.reduce((s, z) => s + Number(z.deliveryFee || 0), 0) / zones.length
    : 0

  const handleAddPresetDirectly = () => {
    const found = EGYPT_ZONE_PRESETS.find(p => p.id === presetToAdd)
    onOpenCreate(found)
  }

  const handleTriggerSync = async () => {
    if (!onSeedAllZones) return
    setIsSyncing(true)
    try {
      await onSeedAllZones()
    } finally {
      setIsSyncing(false)
    }
  }

  // Quick preset pills for mobile rapid switching
  const QUICK_CITY_PILLS = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
    { id: 'qena', labelAr: 'قنا', labelEn: 'Qena', isStar: true },
    { id: 'sohag', labelAr: 'سوهاج', labelEn: 'Sohag', isStar: true },
    { id: 'luxor', labelAr: 'الأقصر', labelEn: 'Luxor', isStar: true },
    { id: 'hurghada', labelAr: 'الغردقة', labelEn: 'Hurghada', isStar: true },
    { id: 'cairo', labelAr: 'القاهرة', labelEn: 'Cairo' },
    { id: 'giza', labelAr: 'الجيزة', labelEn: 'Giza' },
    { id: 'alexandria', labelAr: 'الإسكندرية', labelEn: 'Alex' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-28 sm:pb-8 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-stone-900 flex items-center gap-2">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
            <span>{t('admin.deliveryZones', 'Delivery Zones, Shipping Fees & Taxes')}</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium">
            {isRTL
              ? 'تحديد أسعار التوصيل ومدة الوصول ونسب الضرائب المطبقة لكل محافظة ومدينة.'
              : 'Set custom delivery fees, delivery times, and localized tax rates for each governorate or city.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onSeedAllZones && (
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              title="Sync / Add all 27 Egyptian Governorates to the store"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{isRTL ? 'مزامنة المحافظات' : 'Sync All Governorates'}</span>
              <span className="xs:hidden">{isRTL ? 'مزامنة' : 'Sync All'}</span>
            </button>
          )}

          <button
            onClick={() => onOpenCreate()}
            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isRTL ? 'إضافة منطقة' : 'Add Zone'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Mobile-optimized grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'إجمالي المناطق' : 'Total Zones'}
            </span>
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-stone-900">
            {zones.length} <span className="text-xs sm:text-sm font-bold text-stone-500">{isRTL ? 'منطقة' : 'areas'}</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-green-600 font-medium block mt-0.5">
            {activeCount} {isRTL ? 'مفعلة بصفحة الدفع' : 'active in checkout'}
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'مناديب التوصيل' : 'Delivery Drivers'}
            </span>
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-blue-600">
            {staffUsers.filter(u => u.role === 'delivery' || u.role === 'driver' || u.role === 'staff').length || staffUsers.length}{' '}
            <span className="text-xs sm:text-sm font-bold text-blue-700">{isRTL ? 'مندوب' : 'couriers'}</span>
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5 truncate">
            {isRTL ? 'جاهزون لتعيين الطلبات' : 'Ready for order assignments'}
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'متوسط رسوم الشحن' : 'Avg Shipping Fee'}
            </span>
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-green-600 truncate">
            {formatPrice(averageFee, currentStore?.currency || 'USD')}
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5">
            {isRTL ? 'على كافة المناطق' : 'Across all active zones'}
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {isRTL ? 'نسبة الضريبة القياسية' : 'Standard Tax Rate'}
            </span>
            <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-3xl font-black mt-1.5 text-amber-600">
            {zones.length > 0 ? `${zones[0].taxRate || 14}%` : '14%'}
          </p>
          <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium block mt-0.5">
            {isRTL ? 'تطبق في صفحة الدفع' : 'Applied at checkout'}
          </span>
        </div>
      </div>

      {/* QUICK PRESET ADDER TOOLBAR (Responsive for Mobile & Desktop) */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 sm:p-4.5 space-y-2.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2 flex-wrap">
              <span>{isRTL ? 'إضافة سريعة لمحافظات ومناطق مصر' : 'Quick Add Egyptian Governorate / City'}</span>
              <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                Qena • Sohag • Luxor • Hurghada
              </span>
            </h4>
            <p className="text-[10px] text-amber-800 font-medium mt-0.5" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL
                ? 'اختر أي محافظة لتعبئة أسعار الشحن ومدة التوصيل والاسم تلقائياً.'
                : 'Select any Egyptian city to auto-fill rates, delivery duration, and bilingual names.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 pt-1">
          <select
            value={presetToAdd}
            onChange={e => setPresetToAdd(e.target.value)}
            className="w-full xs:flex-1 sm:w-64 p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs cursor-pointer"
          >
            <optgroup label="⭐ Top Requested (المناطق المطلوبة)">
              <option value="qena">Qena (قنا)</option>
              <option value="sohag">Sohag (سوهاج)</option>
              <option value="luxor">Luxor (الأقصر)</option>
              <option value="hurghada">Hurghada (الغردقة / البحر الأحمر)</option>
            </optgroup>
            <optgroup label="🏙️ Metropolitan Hubs (القاهرة والجيزة والإسكندرية)">
              <option value="cairo">Greater Cairo (القاهرة الكبرى)</option>
              <option value="giza">Giza & 6th October (الجيزة و 6 أكتوبر)</option>
              <option value="alexandria">Alexandria (الإسكندرية)</option>
            </optgroup>
            <optgroup label="🌾 Upper Egypt (محافظات الصعيد)">
              <option value="aswan">Aswan (أسوان)</option>
              <option value="asyut">Asyut (أسيوط)</option>
              <option value="minya">Minya (المنيا)</option>
              <option value="beni_suef">Beni Suef (بني سويف)</option>
              <option value="fayoum">Fayoum (الفيوم)</option>
              <option value="new_valley">New Valley (الوادي الجديد)</option>
            </optgroup>
            <optgroup label="🌊 Delta & Lower Egypt (الدلتا ووجه بحري)">
              <option value="mansoura">Mansoura (المنصورة)</option>
              <option value="tanta">Tanta (طنطا)</option>
              <option value="zagazig">Zagazig (الزقازيق)</option>
              <option value="qalyubia">Qalyubia (القليوبية)</option>
              <option value="monufia">Monufia (المنوفية)</option>
              <option value="beheira">Beheira (البحيرة)</option>
              <option value="kafr_el_sheikh">Kafr El Sheikh (كفر الشيخ)</option>
              <option value="damietta">Damietta (دمياط)</option>
            </optgroup>
            <optgroup label="🚢 Canal & Coast (القناة والساحل)">
              <option value="port_said">Port Said (بورسعيد)</option>
              <option value="ismailia">Ismailia (الإسماعيلية)</option>
              <option value="suez">Suez (السويس)</option>
              <option value="red_sea">Red Sea (البحر الأحمر)</option>
              <option value="sharm">Sharm El Sheikh (شرم الشيخ)</option>
              <option value="matrouh">Marsa Matrouh (مرسى مطروح)</option>
              <option value="arish">North Sinai (شمال سيناء)</option>
            </optgroup>
          </select>

          <button
            onClick={handleAddPresetDirectly}
            className="w-full xs:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRTL ? 'تخصيص وإضافة' : 'Configure & Add'}</span>
          </button>
        </div>
      </div>

      {/* ACTIVE DELIVERY ZONES & RATE CARDS CONTAINER */}
      <div className="bg-card rounded-2xl sm:rounded-[2rem] border border-border p-3.5 sm:p-6 md:p-8 shadow-sm sm:shadow-xl space-y-4 sm:space-y-5">
        {/* Header with Title & Zone Names Drop Down Menu */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-stone-900 flex items-center gap-2">
              <span>{isRTL ? 'مناطق التوصيل وكروت الأسعار النشطة' : 'Active Delivery Zones & Rate Cards'}</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground font-mono">
                ({filteredZones.length} / {zones.length})
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL
                ? 'إدارة أسعار الشحن المباشرة ومدد التوصيل والضرائب لكافة المناطق المدعومة.'
                : 'Manage live shipping rates, delivery durations, and localized taxes for all supported areas.'}
            </p>
          </div>

          {/* ZONE NAMES DROP DOWN MENU */}
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-secondary/80 border border-border rounded-xl px-3 py-2 text-xs font-bold w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <label className="text-[11px] font-black text-stone-700 whitespace-nowrap">
                {isRTL ? 'المنطقة:' : 'Zone:'}
              </label>
              <select
                value={selectedZoneName}
                onChange={e => setSelectedZoneName(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-stone-900 text-xs font-black flex-1 sm:w-60 truncate"
              >
                <option value="all">
                  {isRTL ? `جميع مناطق التوصيل (${zones.length})` : `All Delivery Zones (${zones.length})`}
                </option>
                <optgroup label="⭐ Top Requested (قنا، سوهاج، الأقصر، الغردقة)">
                  <option value="qena">Qena (قنا)</option>
                  <option value="sohag">Sohag (سوهاج)</option>
                  <option value="luxor">Luxor (الأقصر)</option>
                  <option value="hurghada">Hurghada (الغردقة)</option>
                </optgroup>
                <optgroup label={isRTL ? '📍 كافة المناطق بالمحل' : '📍 All Configured Zones In Store'}>
                  {zones.map(z => (
                    <option key={z.id} value={z.nameEn}>
                      {z.nameAr} - {z.nameEn}
                    </option>
                  ))}
                </optgroup>
              </select>
              {selectedZoneName !== 'all' && (
                <button
                  onClick={() => setSelectedZoneName('all')}
                  className="p-1 text-stone-400 hover:text-stone-700 shrink-0"
                  title="Clear Zone Selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QUICK HORIZONTAL CITY PILLS STRIP (Super convenient on mobile!) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_CITY_PILLS.map(p => {
            const isActive = selectedZoneName === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelectedZoneName(p.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 active:scale-95 ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : p.isStar
                    ? 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
                    : 'bg-secondary/60 text-stone-700 hover:bg-secondary'
                }`}
              >
                {p.isStar && <span className="text-[10px]">⭐</span>}
                <span>{p.labelAr}</span>
                <span className="opacity-70 text-[9px]">({p.labelEn})</span>
              </button>
            )
          })}
        </div>

        {/* Search & Status Filter Strip */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                isRTL
                  ? 'ابحث باسم المدينة أو المحافظة أو مدة التوصيل...'
                  : 'Search zones by city, governorate, or delivery ETA...'
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-secondary/50 border border-border rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-secondary/50 text-stone-600 hover:bg-secondary'
              }`}
            >
              {isRTL ? 'كافة الحالات' : 'All Statuses'}
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{isRTL ? 'المفعلة' : 'Active'} ({activeCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('disabled')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
                statusFilter === 'disabled'
                  ? 'bg-stone-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{isRTL ? 'المعطلة' : 'Disabled'} ({disabledCount})</span>
            </button>
          </div>
        </div>

        {/* MOBILE ZONE CARDS (Designed specifically for smartphones) */}
        <div className="md:hidden space-y-3.5">
          {filteredZones.map(zone => (
            <div
              key={zone.id}
              className="bg-white rounded-2xl p-4 border border-stone-200/80 space-y-3.5 shadow-xs hover:border-stone-400 transition-all"
            >
              {/* Top Row: Zone Names & Status Toggle Button */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-base leading-tight">
                      {zone.nameAr}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {zone.nameEn} {zone.city && zone.city !== zone.nameEn ? `• ${zone.city}` : ''}
                    </p>
                  </div>
                </div>

                {/* 1-Tap Toggle Badge for Mobile */}
                <button
                  type="button"
                  onClick={() => onToggleStatus && onToggleStatus(zone)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all active:scale-90 flex items-center gap-1 ${
                    zone.isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-stone-100 text-stone-600 border border-stone-300'
                  }`}
                  title={isRTL ? 'انقر للتبديل بين مفعل / معطل' : 'Tap to toggle Active/Disabled'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${zone.isActive ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                  <span>{zone.isActive ? (isRTL ? 'مفعل' : 'Active') : (isRTL ? 'معطل' : 'Disabled')}</span>
                </button>
              </div>

              {/* 3-Cell Rate Card Grid */}
              <div className="grid grid-cols-3 gap-2 bg-stone-50/90 p-2.5 rounded-xl border border-stone-100 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">
                    {isRTL ? 'سعر الشحن' : 'Shipping Fee'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-primary font-mono block mt-0.5">
                    {formatPrice(zone.deliveryFee, currentStore?.currency || 'USD')}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">
                    {isRTL ? 'ضريبة المنطقة' : 'Location Tax'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-stone-900 font-mono block mt-0.5">
                    {zone.taxRate || 0}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">
                    {isRTL ? 'مدة التوصيل' : 'Estimated ETA'}
                  </span>
                  <span className="text-xs font-bold text-stone-700 block mt-0.5 truncate">
                    {zone.estimatedDays || '1-3 Days'}
                  </span>
                </div>
              </div>

              {/* Full-Width Touch Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                <button
                  onClick={() => onOpenEdit(zone)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Edit className="w-3.5 h-3.5 text-stone-500" />
                  <span>{isRTL ? 'تعديل الأسعار' : 'Edit Rates'}</span>
                </button>
                <button
                  onClick={() => onDelete(zone.id)}
                  className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">{isRTL ? 'حذف' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))}

          {filteredZones.length === 0 && (
            <div className="py-16 text-center text-muted-foreground font-bold italic text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-stone-300" />
              <p>{isRTL ? 'لا توجد مناطق مطابقة للفلتر المحدد.' : 'No delivery zones match your selected filter.'}</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedZoneName('all'); setStatusFilter('all'); }}
                className="text-primary font-black underline text-xs"
              >
                {isRTL ? 'إعادة تعيين الفلتر' : 'Reset Filter'}
              </button>
            </div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="py-4 px-3 font-black">Zone (Arabic & English)</th>
                <th className="py-4 px-3 font-black">Delivery Fee</th>
                <th className="py-4 px-3 font-black">Location Tax</th>
                <th className="py-4 px-3 font-black">Estimated ETA</th>
                <th className="py-4 px-3 font-black">Status</th>
                <th className="py-4 px-3 text-right font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredZones.map(zone => (
                <tr key={zone.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-sm">{zone.nameAr}</div>
                        <div className="text-xs text-stone-400 font-medium">{zone.nameEn}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-3 font-mono font-black text-sm text-primary">
                    {formatPrice(zone.deliveryFee, currentStore?.currency || 'USD')}
                  </td>

                  <td className="py-4 px-3 font-mono font-bold text-sm text-stone-700">
                    {zone.taxRate}%
                  </td>

                  <td className="py-4 px-3 text-xs font-bold text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{zone.estimatedDays}</span>
                    </div>
                  </td>

                  <td className="py-4 px-3">
                    <button
                      type="button"
                      onClick={() => onToggleStatus && onToggleStatus(zone)}
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 ${
                        zone.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                      title="Click to toggle status"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${zone.isActive ? 'bg-green-500' : 'bg-stone-400'}`} />
                      <span>{zone.isActive ? 'Active' : 'Disabled'}</span>
                    </button>
                  </td>

                  <td className="py-4 px-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onOpenEdit(zone)}
                        className="p-2 text-stone-400 hover:text-stone-900 bg-secondary rounded-lg hover:bg-stone-200"
                        title="Edit Zone"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(zone.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 bg-secondary rounded-lg hover:bg-rose-50"
                        title="Delete Zone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredZones.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground font-bold italic text-sm">
                    No delivery zones found.
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
