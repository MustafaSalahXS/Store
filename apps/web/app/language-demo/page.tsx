'use client'

import { useTranslations } from '@/lib/language-context'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Card } from '@/components/ui/card'

export default function LanguageDemo() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('common.home')}</h1>
          <LanguageSwitcher />
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('common.products')}</h2>
            <p className="text-slate-600">{t('products.browse')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('cart.title')}</h2>
            <p className="text-slate-600">{t('cart.empty')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('auth.loginTitle')}</h2>
            <p className="text-slate-600">{t('auth.noAccount')} <span className="text-blue-600 cursor-pointer">{t('auth.signUp')}</span></p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('checkout.title')}</h2>
            <p className="text-slate-600">{t('checkout.paymentMethod')}</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>• {t('checkout.card')}</li>
              <li>• {t('checkout.vodafone')}</li>
              <li>• {t('checkout.instapay')}</li>
              <li>• {t('checkout.whatsapp')}</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6 mt-6 bg-blue-50">
          <h2 className="text-lg font-bold text-blue-900 mb-4">🌍 Multi-Language Support Active</h2>
          <p className="text-blue-800 mb-4">
            This store now supports English, Arabic (العربية), and French (Français).
          </p>
          <p className="text-sm text-blue-700">
            Language preference is saved locally and persists across sessions.
            RTL layout automatically applied for Arabic.
          </p>
        </Card>
      </div>
    </div>
  )
}
