'use client'

import React from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface BannersSectionProps {
  banners: any[]
  onOpenCreate: () => void
  onOpenEdit: (banner: any) => void
  onDelete: (id: string) => void
  t: (key: string, fallback?: string) => string
}

export default function BannersSection({
  banners,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  t
}: BannersSectionProps) {
  const { isRTL } = useLanguage()

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-8 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary shrink-0" />
            <span>{isRTL ? 'البانرات والعروض الإعلانية' : t('admin.dynamicBanners', 'Dynamic Banners')}</span>
          </h2>
          <p className="text-muted-foreground font-medium text-xs sm:text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
            {isRTL ? 'إدارة البانرات المتحركة، صور الحملات الترويجية، وروابط الأقسام على الصفحة الرئيسية.' : t('admin.manageBanners', 'Manage promotional homepage visual campaigns and direct links.')}
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-primary text-white font-black rounded-xl sm:rounded-2xl hover:bg-primary/90 transition-all shadow-md text-xs sm:text-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{isRTL ? 'إضافة بانر جديد' : t('admin.newBanner', 'New Banner')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {banners.map((banner: any) => (
          <div key={banner.id} className="bg-white rounded-2xl sm:rounded-3xl border border-stone-100 overflow-hidden shadow-xl flex flex-col group">
            <div className="h-44 sm:h-48 bg-stone-100 relative overflow-hidden">
              {banner.imageUrl ? (
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-stone-900 border border-stone-100 font-mono shadow-xs">
                {isRTL ? `ترتيب: ${banner.position}` : `Pos ${banner.position}`}
              </div>
              <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                  banner.isActive ? 'bg-green-500 text-white' : 'bg-stone-500 text-white'
                }`}>
                  {banner.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[10px] font-bold tracking-wider uppercase text-primary mb-1">
                  {banner.subtitle || (isRTL ? 'حملة إعلانية' : 'Promotional Campaign')}
                </p>
                <h4 className="font-bold text-stone-900 text-base sm:text-lg line-clamp-1">{banner.title}</h4>
                <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">{banner.description}</p>
              </div>

              <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                <div className="text-[10px] font-bold text-stone-400 truncate max-w-[140px] sm:max-w-[180px]">
                  {isRTL ? 'الرابط:' : 'Link:'} <span className="text-stone-900 font-mono">{banner.ctaLink || '/'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onOpenEdit(banner)}
                    className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all active:scale-95"
                    title={isRTL ? 'تعديل' : 'Edit'}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(isRTL ? `هل أنت متأكد من حذف البانر "${banner.title}"؟` : `Delete banner "${banner.title}"?`)) {
                        onDelete(banner.id)
                      }
                    }}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                    title={isRTL ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground font-bold italic text-sm">
            {isRTL ? 'لا توجد بانرات إعلانية مضافة بعد.' : 'No dynamic banners configured yet.'}
          </div>
        )}
      </div>
    </div>
  )
}
