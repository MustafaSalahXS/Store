'use client'

import React from 'react'
import { FileText, Share2, Loader, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface ContentSectionProps {
  storeSettings: any
  setStoreSettings: React.Dispatch<React.SetStateAction<any>>
  onUpdateStore: () => void
  isSubmitting: boolean
  t: (key: string, fallback?: string) => string
}

export default function ContentSection({
  storeSettings,
  setStoreSettings,
  onUpdateStore,
  isSubmitting,
  t
}: ContentSectionProps) {
  const { isRTL } = useLanguage()

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-8 max-w-full overflow-hidden">
      <div className="bg-card rounded-2xl sm:rounded-[2.5rem] border border-border p-4 sm:p-8 md:p-10 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-border mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-primary shrink-0" />
              <span>{isRTL ? 'إدارة المحتوى والصفحات القانونية' : t('admin.pagesSocialLinks', 'Pages & Social Links')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL 
                ? 'تخصيص روابط شبكات التواصل الاجتماعي، نبذة عن المتجر، وسياسات الخصوصية والاستخدام.' 
                : 'Customize social channels, brand story, sustainability ethos, and legal policies.'}
            </p>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {/* Social Links Section */}
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-px bg-border flex-1" />
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider whitespace-nowrap">
                {isRTL ? 'روابط شبكات التواصل الاجتماعي' : t('admin.socialNetworkLinks', 'Social Network Links')}
              </h3>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isRTL ? 'رابط فيسبوك (Facebook)' : t('admin.facebookUrl', 'Facebook URL')}</span>
                </label>
                <input
                  value={storeSettings.facebookUrl || ''}
                  onChange={e => setStoreSettings({ ...storeSettings, facebookUrl: e.target.value })}
                  className="w-full p-3.5 sm:p-4 bg-secondary/50 border border-border rounded-xl font-mono text-xs sm:text-sm outline-none focus:border-primary transition-all"
                  placeholder="https://facebook.com/yourstore"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-pink-500" />
                  <span>{isRTL ? 'رابط إنستجرام (Instagram)' : t('admin.instagramUrl', 'Instagram URL')}</span>
                </label>
                <input
                  value={storeSettings.instagramUrl || ''}
                  onChange={e => setStoreSettings({ ...storeSettings, instagramUrl: e.target.value })}
                  className="w-full p-3.5 sm:p-4 bg-secondary/50 border border-border rounded-xl font-mono text-xs sm:text-sm outline-none focus:border-primary transition-all"
                  placeholder="https://instagram.com/yourstore"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-stone-900" />
                  <span>{isRTL ? 'رابط تيك توك (TikTok)' : t('admin.tiktokUrl', 'TikTok URL')}</span>
                </label>
                <input
                  value={storeSettings.tiktokUrl || ''}
                  onChange={e => setStoreSettings({ ...storeSettings, tiktokUrl: e.target.value })}
                  className="w-full p-3.5 sm:p-4 bg-secondary/50 border border-border rounded-xl font-mono text-xs sm:text-sm outline-none focus:border-primary transition-all"
                  placeholder="https://tiktok.com/@yourstore"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>{isRTL ? 'رابط لينكد إن (LinkedIn)' : t('admin.linkedinUrl', 'LinkedIn URL')}</span>
                </label>
                <input
                  value={storeSettings.linkedinUrl || ''}
                  onChange={e => setStoreSettings({ ...storeSettings, linkedinUrl: e.target.value })}
                  className="w-full p-3.5 sm:p-4 bg-secondary/50 border border-border rounded-xl font-mono text-xs sm:text-sm outline-none focus:border-primary transition-all"
                  placeholder="https://linkedin.com/company/yourstore"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Page Content Section */}
          <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 border-t border-border">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                {isRTL ? 'محتوى صفحة من نحن (About Us)' : t('admin.aboutUsContent', 'About Us Content')}
              </label>
              <textarea
                value={storeSettings.aboutUs || ''}
                onChange={e => setStoreSettings({ ...storeSettings, aboutUs: e.target.value })}
                className="w-full p-4 bg-secondary/50 border border-border rounded-xl sm:rounded-2xl font-medium min-h-[120px] sm:min-h-[160px] outline-none focus:border-primary transition-all text-xs sm:text-sm"
                placeholder={isRTL ? 'اكتب قصة ورؤية علامتك التجارية...' : "Tell your brand's story..."}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                {isRTL ? 'سياسة الاستدامة والجودة (Sustainability)' : t('admin.sustainabilityPolicy', 'Sustainability Policy')}
              </label>
              <textarea
                value={storeSettings.sustainability || ''}
                onChange={e => setStoreSettings({ ...storeSettings, sustainability: e.target.value })}
                className="w-full p-4 bg-secondary/50 border border-border rounded-xl sm:rounded-2xl font-medium min-h-[120px] sm:min-h-[160px] outline-none focus:border-primary transition-all text-xs sm:text-sm"
                placeholder={isRTL ? 'التزام المتجر بالمعايير البيئية والأقمشة الطبيعية...' : 'Describe your commitment to the planet...'}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                {isRTL ? 'سياسة الخصوصية وحماية البيانات (Privacy Policy)' : t('admin.privacyPolicy', 'Privacy Policy')}
              </label>
              <textarea
                value={storeSettings.privacy || ''}
                onChange={e => setStoreSettings({ ...storeSettings, privacy: e.target.value })}
                className="w-full p-4 bg-secondary/50 border border-border rounded-xl sm:rounded-2xl font-medium min-h-[120px] sm:min-h-[160px] outline-none focus:border-primary transition-all text-xs sm:text-sm"
                placeholder={isRTL ? 'شروط حماية بيانات العملاء ومعاملات الدفع...' : 'Outline your data protection practices...'}
              />
            </div>
          </div>

          <div className="pt-4 sm:pt-6 flex justify-end">
            <button
              type="button"
              onClick={onUpdateStore}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-wider shadow-lg hover:brightness-110 disabled:opacity-50 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? 'جاري الحفظ...' : t('admin.saving', 'Saving...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRTL ? 'حفظ المحتوى والروابط' : t('admin.saveContentLinks', 'Save Content & Links')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
