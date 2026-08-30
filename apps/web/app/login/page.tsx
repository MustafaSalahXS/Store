'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LoginForm from '@/components/auth/login-form'
import RegisterForm from '@/components/auth/register-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowLeft, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { useLanguage } from '@/lib/language-context'
import { LanguageSwitcher } from '@/components/language-switcher'

function AuthContent() {
  const searchParams = useSearchParams()
  const { currentStore } = useStore()
  const { t, isRTL } = useLanguage()
  const initialTab = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const isRegistered = searchParams.get('registered') === 'true'
  const redirect = searchParams.get('redirect')

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab)

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Column: High-Fashion Editorial Showcase (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 text-white flex-col justify-between p-12 xl:p-16 overflow-hidden select-none">
        {/* Editorial Background Image with Subtle Parallax & Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('${currentStore?.curatedImageUrl || currentStore?.bannerUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop'}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white font-serif font-black text-lg group-hover:border-white transition-colors">
              {currentStore?.name?.[0]?.toUpperCase() || 'M'}
            </div>
            <span className="font-serif text-lg font-black tracking-widest uppercase">
              {currentStore?.name || 'Maison'}
            </span>
          </Link>

          <span className="text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-white/20 text-white/80 bg-black/40 backdrop-blur-md">
            {t('Private Access')}
          </span>
        </div>

        {/* Editorial Statement Quote */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[11px] tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('The Modern Standard')}</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-serif font-black tracking-tight leading-[1.1] uppercase">
            {t('Curated Elegance.')}<br />
            <span className="italic font-normal text-white/80">{t('Quiet Luxury.')}</span>
          </h2>
          <p className="text-sm text-white/70 font-light leading-relaxed tracking-wide">
            {t('Designed for those who appreciate architectural tailoring, pure fabrics, and timeless design aesthetics.')}
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/50 font-mono">
          <span>© {new Date().getFullYear()} {currentStore?.name || 'Store'}</span>
          <span className="flex items-center gap-1.5 text-white/70">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {t('End-to-End Cryptographic Security')}
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Hub */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 xl:p-16 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Top Bar: Return to store navigation & Language Switcher */}
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors group"
            >
              {isRTL ? (
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              ) : (
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              )}
              <span>{t('Return to Store')}</span>
            </Link>

            <div className="flex items-center gap-3">
              {redirect && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1 rounded-full bg-secondary">
                  {t('Checkout Required')}
                </span>
              )}
              <LanguageSwitcher />
            </div>
          </div>

          {/* Registration success alert */}
          {isRegistered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400"
            >
              <Check className="w-4 h-4 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider">
                {t('Account verified! You can now sign in.')}
              </p>
            </motion.div>
          )}

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight uppercase text-foreground">
              {activeTab === 'login' ? t('Client Access') : t('Create Account')}
            </h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              {activeTab === 'login' 
                ? t('Authenticate to unlock your customized shopping experience') 
                : t('Join our private clientele for bespoke reservations')}
            </p>
          </div>

          {/* Seamless Mode Switcher Tabs */}
          <div className="flex p-1 bg-secondary rounded-2xl border border-border/80">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('Sign In')}
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'register'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('Register')}
            </button>
          </div>

          {/* Animated Tab Content */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login-view"
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -10 : 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginForm 
                    onSwitchToRegister={() => setActiveTab('register')} 
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register-view"
                  initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RegisterForm 
                    onSuccess={() => setActiveTab('login')} 
                    onSwitchToLogin={() => setActiveTab('login')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Guest Checkout Bypass (if redirected from checkout) */}
          {redirect?.includes('checkout') && (
            <div className="pt-4 border-t border-border/60 text-center">
              <Link
                href="/checkout?guest=true"
                className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
              >
                {t('Proceed as Guest without Account')} {isRTL ? '←' : '→'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center p-4 text-xs uppercase font-bold tracking-widest">Loading Gateway...</div>}>
      <AuthContent />
    </Suspense>
  )
}
