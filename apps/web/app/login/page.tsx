'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LoginForm from '@/components/auth/login-form'
import { motion } from 'framer-motion'
import { Check, Shield } from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const { currentStore } = useStore()
  const isRegistered = searchParams.get('registered') === 'true'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="bg-card/50 backdrop-blur-xl rounded-[2.5rem] border border-border/50 p-10 md:p-12 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

          {/* Header */}
          <div className="text-center mb-10 relative">
            <Link href="/" className="inline-block group-hover:scale-105 transition-transform">
              {currentStore?.logoUrl ? (
                <img src={currentStore.logoUrl} alt={currentStore.name} className="h-16 md:h-20 w-auto object-contain mx-auto mb-6 drop-shadow-2xl" />
              ) : (
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-xl shadow-primary/20">
                  {currentStore?.name?.[0]?.toUpperCase() || 'M'}
                </div>
              )}
            </Link>
            <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight uppercase italic">Access<br /><span className="text-primary not-italic">Portal</span></h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Identify yourself to continue</p>
          </div>

          {/* Success Message */}
          {isRegistered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-center gap-4 p-4 bg-green-500/10 border border-border/50 rounded-2xl shadow-sm"
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20"><Check className="w-4 h-4" /></div>
              <p className="text-xs text-green-500 font-black uppercase tracking-widest">Account Active</p>
            </motion.div>
          )}

          {/* Login Form */}
          <LoginForm />

          <div className="mt-10 text-center relative pt-8 border-t border-border/50">
            <p className="text-sm font-bold text-muted-foreground">
              New to the platform?{' '}
              <Link href="/register" className="text-primary hover:underline font-black uppercase tracking-widest">
                Initialize Account
              </Link>
            </p>
          </div>

          {/* Demo Access */}
          <div className="mt-8 p-6 bg-secondary/50 rounded-3xl border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Shield className="w-12 h-12" />
            </div>
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Restricted Demo Access</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground uppercase">Identity</span>
                <span className="font-black text-foreground tracking-tight">admin@modern.com</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground uppercase">Key</span>
                <span className="font-black text-foreground tracking-tight">admin123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-3 text-xs font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-[0.2em] group">
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">←</div>
            Return to Discovery
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center p-4">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}

