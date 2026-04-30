'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store-context'
import { Instagram, Facebook, Share2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export default function Footer() {
  const { currentStore } = useStore()
  const { t } = useLanguage()

  const handleCategoryShop = (category: string) => {
    // If we are on the homepage, scroll and filter
    if (window.location.pathname === '/') {
      const element = document.getElementById('product-feed')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        // We can't easily trigger the filter from here without a global state or search param
        // For now, let's just scroll. In a real app, you'd use a store or URL params.
        const url = new URL(window.location.href)
        url.searchParams.set('category', category)
        window.history.pushState({}, '', url)
      }
    } else {
      // If on another page, go to home with category param
      window.location.href = `/?category=${category}`
    }
  }

  return (
    <footer className="bg-stone-50 border-t border-stone-200 pt-24 pb-12">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              {currentStore?.logoUrl ? (
                <img src={currentStore.logoUrl} alt={currentStore.name} className="h-10 md:h-12 w-auto object-contain" />
              ) : (
                <div className="flex flex-col">
                  <span className="font-bodoni text-3xl font-bold uppercase tracking-tighter text-stone-900">
                    {currentStore?.name || 'DIGITALSTORE'}
                  </span>
                  <span className="font-jost text-[8px] font-bold tracking-[0.4em] uppercase text-gold-600 -mt-0.5">
                    Luxury Classic
                  </span>
                </div>
              )}
            </Link>
            <p className="font-jost text-sm text-stone-500 leading-relaxed max-w-xs">
              {currentStore?.description || 'Crafting timeless pieces for the modern individual. Quality, sustainability, and elegance in every detail.'}
            </p>
            <div className="flex gap-6">
              {currentStore?.instagramUrl && (
                <Link href={currentStore.instagramUrl} target="_blank" className="w-10 h-10 bg-white border border-stone-100 rounded-xl flex items-center justify-center text-stone-400 hover:text-pink-500 hover:border-pink-200 hover:shadow-lg transition-all">
                  <Instagram className="w-5 h-5" />
                </Link>
              )}
              {currentStore?.facebookUrl && (
                <Link href={currentStore.facebookUrl} target="_blank" className="w-10 h-10 bg-white border border-stone-100 rounded-xl flex items-center justify-center text-stone-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all">
                  <Facebook className="w-5 h-5" />
                </Link>
              )}
              {currentStore?.tiktokUrl && (
                <Link href={currentStore.tiktokUrl} target="_blank" className="w-10 h-10 bg-white border border-stone-100 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-300 hover:shadow-lg transition-all">
                  <span className="font-black text-xs">TT</span>
                </Link>
              )}
              {currentStore?.linkedinUrl && (
                <Link href={currentStore.linkedinUrl} target="_blank" className="w-10 h-10 bg-white border border-stone-100 rounded-xl flex items-center justify-center text-stone-400 hover:text-blue-700 hover:border-blue-300 hover:shadow-lg transition-all">
                  <Share2 className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-900">{t('footer.collections')}</h4>
            <ul className="space-y-4">
              <li><button onClick={() => handleCategoryShop('New Arrivals')} className="font-jost text-xs text-stone-500 hover:text-stone-900 transition-colors text-left">{t('footer.newArrivals')}</button></li>
              <li><button onClick={() => handleCategoryShop('Men')} className="font-jost text-xs text-stone-500 hover:text-stone-900 transition-colors text-left">{t('footer.men')}</button></li>
              <li><button onClick={() => handleCategoryShop('Women')} className="font-jost text-xs text-stone-500 hover:text-stone-900 transition-colors text-left">{t('footer.women')}</button></li>
              <li><button onClick={() => handleCategoryShop('Accessories')} className="font-jost text-xs text-stone-500 hover:text-stone-900 transition-colors text-left">{t('footer.accessories')}</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-900">{t('footer.company')}</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="font-jost text-xs text-stone-500 hover:text-stone-900 transition-colors">{t('footer.about')}</Link></li>
              <li><Link href="/sustainability" className="font-jost text-xs text-stone-500 hover:text-stone-900 transition-colors">{t('footer.sustainability')}</Link></li>
              <li><Link href="/contact" className="font-jost text-xs text-stone-500 hover:text-stone-900 transition-colors">{t('footer.contact')}</Link></li>
              <li><Link href="/privacy" className="font-jost text-xs text-stone-500 hover:text-stone-900 transition-colors">{t('footer.privacy')}</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-900">{t('footer.newsletter')}</h4>
            <p className="font-jost text-xs text-stone-500">{t('footer.newsletterDesc')}</p>
            <div className="flex gap-2">
              <input type="email" placeholder={t('footer.emailPlaceholder')} className="flex-1 bg-stone-100 border border-stone-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-stone-900 transition-all" />
              <button className="bg-stone-900 text-white px-6 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all">{t('footer.join')}</button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-widest order-2 md:order-1">
            © {new Date().getFullYear()} {currentStore?.name || 'Modern Store'}. {t('footer.rights')}
          </p>
          
          <div className="flex items-center gap-6 order-1 md:order-2">
            {(currentStore?.instagramUrl || 'https://instagram.com') && (
              <Link href={currentStore?.instagramUrl || 'https://instagram.com'} target="_blank" className="font-jost text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors">
                Instagram
              </Link>
            )}
            {(currentStore?.facebookUrl || 'https://facebook.com') && (
              <Link href={currentStore?.facebookUrl || 'https://facebook.com'} target="_blank" className="font-jost text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors">
                Facebook
              </Link>
            )}
            {(currentStore?.tiktokUrl || 'https://tiktok.com') && (
              <Link href={currentStore?.tiktokUrl || 'https://tiktok.com'} target="_blank" className="font-jost text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors">
                TikTok
              </Link>
            )}
            {(currentStore?.linkedinUrl || 'https://linkedin.com') && (
              <Link href={currentStore?.linkedinUrl || 'https://linkedin.com'} target="_blank" className="font-jost text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors">
                LinkedIn
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
