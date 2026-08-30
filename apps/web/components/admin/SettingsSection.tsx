'use client'

import React from 'react'
import {
  Settings,
  Image as ImageIcon,
  Globe,
  Loader,
  DollarSign,
  Phone,
  Percent,
  Truck,
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  Sparkles
} from 'lucide-react'
import { CURRENCIES } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'

interface SettingsSectionProps {
  storeSettings: any
  setStoreSettings: React.Dispatch<React.SetStateAction<any>>
  onUpdateStore: (e: React.FormEvent) => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: any) => void
  isSubmitting: boolean
  isUploading: boolean
  t: (key: string, fallback?: string) => string
}

export default function SettingsSection({
  storeSettings,
  setStoreSettings,
  onUpdateStore,
  onFileUpload,
  isSubmitting,
  isUploading,
  t
}: SettingsSectionProps) {
  const { isRTL } = useLanguage()

  return (
    <div className="max-w-3xl mx-auto pb-28 sm:pb-8 max-w-full overflow-hidden">
      <div className="bg-card rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-7 md:p-10 shadow-sm sm:shadow-xl border border-border space-y-5 sm:space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 sm:pb-4 border-b border-border">
          <div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-stone-900 flex items-center gap-2.5">
              <Settings className="w-5 h-5 sm:w-7 sm:h-7 text-primary shrink-0" />
              <span>{t('admin.settings', isRTL ? 'إعدادات المتجر العامة' : 'Store Settings')}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL
                ? 'تخصيص هوية المتجر، العملة الرسمية، أرقام التواصل، الشعار، ونسب الشحن والضرائب.'
                : 'Customize store profile, default currency, WhatsApp contacts, branding logos, and core rates.'}
            </p>
          </div>
        </div>

        <form onSubmit={onUpdateStore} className="space-y-4 sm:space-y-6">
          {/* Store Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 block">
              {isRTL ? 'اسم المتجر والعلامة التجارية *' : 'Store Name *'}
            </label>
            <input
              required
              value={storeSettings.name || ''}
              onChange={e => setStoreSettings({ ...storeSettings, name: e.target.value })}
              placeholder={isRTL ? 'اسم متجرك الإلكتروني...' : 'Store Name...'}
              className="w-full p-3 sm:p-3.5 bg-secondary/40 border border-border rounded-xl text-xs sm:text-base font-bold text-stone-900 outline-none focus:border-primary focus:bg-white transition-all shadow-xs"
            />
          </div>

          {/* Currency & WhatsApp Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Currency Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                <span>{isRTL ? 'العملة الافتراضية' : 'Default Currency'}</span>
              </label>
              <div className="relative">
                <select
                  value={storeSettings.currency || 'EGP'}
                  onChange={e => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                  className="w-full p-3 sm:p-3.5 bg-secondary/40 border border-border rounded-xl text-xs sm:text-sm font-bold text-stone-900 outline-none focus:border-primary focus:bg-white transition-all cursor-pointer shadow-xs pr-8"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.symbol} ({c.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* WhatsApp Contact Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isRTL ? 'رقم الواتساب للتواصل' : 'WhatsApp Contact'}</span>
              </label>
              <input
                type="tel"
                value={storeSettings.whatsappNumber || ''}
                onChange={e => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                className="w-full p-3 sm:p-3.5 bg-secondary/40 border border-border rounded-xl text-xs sm:text-sm font-bold text-stone-900 outline-none focus:border-primary focus:bg-white transition-all shadow-xs font-mono"
                placeholder="+20 10..."
                dir="ltr"
              />
            </div>
          </div>

          {/* Tax Rate & Default Shipping Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-amber-500" />
                <span>{isRTL ? 'الضريبة العامة المطبقة (%)' : 'Standard Tax Rate (%)'}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={storeSettings.taxRate ?? 14}
                  onChange={e => setStoreSettings({ ...storeSettings, taxRate: Number(e.target.value) })}
                  className="w-full p-3 sm:p-3.5 bg-secondary/40 border border-border rounded-xl text-xs sm:text-sm font-bold text-stone-900 outline-none focus:border-primary focus:bg-white transition-all shadow-xs font-mono"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-stone-400 pointer-events-none">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-primary" />
                <span>{isRTL ? 'رسوم الشحن الافتراضية' : 'Default Shipping Fee'}</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={storeSettings.shippingFee ?? 50}
                onChange={e => setStoreSettings({ ...storeSettings, shippingFee: Number(e.target.value) })}
                className="w-full p-3 sm:p-3.5 bg-secondary/40 border border-border rounded-xl text-xs sm:text-sm font-bold text-stone-900 outline-none focus:border-primary focus:bg-white transition-all shadow-xs font-mono"
              />
            </div>
          </div>

          {/* Store Description / Brand Bio */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>{isRTL ? 'نبذة ووصف المتجر' : 'Store Description'}</span>
            </label>
            <textarea
              value={storeSettings.description || ''}
              onChange={e => setStoreSettings({ ...storeSettings, description: e.target.value })}
              className="w-full p-3 sm:p-3.5 bg-secondary/40 border border-border rounded-xl min-h-[85px] sm:min-h-[110px] font-medium text-xs sm:text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-xs"
              placeholder={isRTL ? 'اكتب نبذة مختصرة عن متجرك وهوية علامتك التجارية...' : 'Describe your boutique and brand vision...'}
            />
          </div>

          {/* Logo & Favicon Section */}
          <div className="pt-4 sm:pt-6 border-t border-border space-y-3">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span>{isRTL ? 'الهوية البصرية (الشعار والأيقونة)' : 'Visual Branding & Logos'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Store Logo */}
              <div className="bg-secondary/20 p-3 sm:p-4 rounded-2xl border border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl border border-border overflow-hidden flex items-center justify-center shrink-0 p-1 shadow-2xs">
                    {storeSettings.logoUrl ? (
                      <img src={storeSettings.logoUrl} alt="Store Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">
                      {isRTL ? 'شعار المتجر' : 'Store Logo'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium block mt-0.5">
                      PNG, SVG, JPG
                    </span>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    hidden
                    accept="image/*"
                    onChange={e => onFileUpload(e, 'logoUrl')}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-3.5 py-2 bg-stone-900 hover:bg-primary text-white rounded-xl font-bold text-[11px] cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-xs shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'رفع شعار' : 'Upload'}</span>
                  </label>
                </div>
              </div>

              {/* Favicon */}
              <div className="bg-secondary/20 p-3 sm:p-4 rounded-2xl border border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl border border-border overflow-hidden flex items-center justify-center shrink-0 p-2 shadow-2xs">
                    {storeSettings.faviconUrl ? (
                      <img src={storeSettings.faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                    ) : (
                      <Globe className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">
                      {isRTL ? 'أيقونة التبويب' : 'Favicon'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium block mt-0.5">
                      32x32 ICO / PNG
                    </span>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    id="favicon-upload"
                    hidden
                    accept="image/*"
                    onChange={e => onFileUpload(e, 'faviconUrl')}
                  />
                  <label
                    htmlFor="favicon-upload"
                    className="px-3.5 py-2 bg-stone-900 hover:bg-primary text-white rounded-xl font-bold text-[11px] cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-xs shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'رفع أيقونة' : 'Upload'}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Category Visual Assets (Optimized for Mobile Touch) */}
          <div className="pt-4 sm:pt-6 border-t border-border space-y-3">
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{isRTL ? 'الصور الإعلانية الرئيسية للأقسام' : 'Category Brand Cover Images'}</span>
              </h3>
              <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                {isRTL ? 'انقر على أي صورة لتغييرها أو رفع صورة جديدة مباشرة من الهاتف.' : 'Tap any collection cover to upload or change photo from your device.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Accessories */}
              <div className="bg-card rounded-2xl border border-border p-3 space-y-2">
                <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                  {isRTL ? 'قسم الإكسسوارات (Accessories)' : 'Accessories Collection'}
                </label>
                <div className="relative aspect-video rounded-xl bg-secondary/50 border border-border overflow-hidden group shadow-2xs">
                  {storeSettings.accessoriesImageUrl ? (
                    <img src={storeSettings.accessoriesImageUrl} className="w-full h-full object-cover" alt="Accessories" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Floating Action Button (Always touchable on Mobile & hoverable on Desktop) */}
                  <label className="absolute inset-0 bg-stone-900/40 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <input type="file" hidden accept="image/*" onChange={e => onFileUpload(e, 'accessoriesImageUrl')} />
                    <span className="px-3 py-1.5 bg-black/70 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-xs shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'تغيير الصورة' : 'Change Image'}</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Footwear */}
              <div className="bg-card rounded-2xl border border-border p-3 space-y-2">
                <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                  {isRTL ? 'قسم الأحذية (Footwear)' : 'Footwear Collection'}
                </label>
                <div className="relative aspect-video rounded-xl bg-secondary/50 border border-border overflow-hidden group shadow-2xs">
                  {storeSettings.footwearImageUrl ? (
                    <img src={storeSettings.footwearImageUrl} className="w-full h-full object-cover" alt="Footwear" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-stone-900/40 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <input type="file" hidden accept="image/*" onChange={e => onFileUpload(e, 'footwearImageUrl')} />
                    <span className="px-3 py-1.5 bg-black/70 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-xs shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'تغيير الصورة' : 'Change Image'}</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Curated */}
              <div className="bg-card rounded-2xl border border-border p-3 space-y-2">
                <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                  {isRTL ? 'المجموعات المختارة (Curated)' : 'Curated Collection'}
                </label>
                <div className="relative aspect-video rounded-xl bg-secondary/50 border border-border overflow-hidden group shadow-2xs">
                  {storeSettings.curatedImageUrl ? (
                    <img src={storeSettings.curatedImageUrl} className="w-full h-full object-cover" alt="Curated" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-stone-900/40 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <input type="file" hidden accept="image/*" onChange={e => onFileUpload(e, 'curatedImageUrl')} />
                    <span className="px-3 py-1.5 bg-black/70 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-xs shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'تغيير الصورة' : 'Change Image'}</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Brand Ethos */}
              <div className="bg-card rounded-2xl border border-border p-3 space-y-2">
                <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                  {isRTL ? 'رؤية وهوية العلامة (Ethos)' : 'Brand Ethos Image'}
                </label>
                <div className="relative aspect-video rounded-xl bg-secondary/50 border border-border overflow-hidden group shadow-2xs">
                  {storeSettings.ethosImageUrl ? (
                    <img src={storeSettings.ethosImageUrl} className="w-full h-full object-cover" alt="Ethos" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-stone-900/40 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <input type="file" hidden accept="image/*" onChange={e => onFileUpload(e, 'ethosImageUrl')} />
                    <span className="px-3 py-1.5 bg-black/70 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-xs shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'تغيير الصورة' : 'Change Image'}</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Touch Submit Button */}
          <div className="pt-2 sm:pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full py-3.5 sm:py-4 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {(isSubmitting || isUploading) ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? 'جاري الحفظ والتحديث...' : 'Saving Changes...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRTL ? 'حفظ إعدادات المتجر' : 'Save Store Settings'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
