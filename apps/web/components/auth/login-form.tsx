'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'
import { Mail, Lock, AlertCircle, Loader, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  
  const { login } = useAuth()
  const { t, isRTL } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const user = await login(email, password)
      if (user) {
        if (onSuccess) {
          onSuccess()
          return
        }
        if (redirect) {
          router.push(redirect)
          return
        }
        if ((user.role as string) === 'super_admin') {
          router.push('/super-admin')
        } else if ((user.role as string) === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unauthorized', 'Invalid credentials. Please check your details.'))
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoAdmin = () => {
    setEmail('admin@example.com')
    setPassword('admin123')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {t('Email Identity')}
        </label>
        <div className="relative">
          <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3.5 bg-background border border-border/80 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 transition-all font-medium`}
            placeholder="client@domain.com"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {t('Key / Password')}
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPassword ? t('Hide') : t('Show')}
          </button>
        </div>
        <div className="relative">
          <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} py-3.5 bg-background border border-border/80 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 transition-all font-medium`}
            placeholder="••••••••••••"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-foreground hover:bg-foreground/90 text-background font-black text-xs uppercase tracking-[0.25em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>{t('Authenticating...')}</span>
          </>
        ) : (
          <>
            <span>{t('Authenticate')}</span>
            {isRTL ? (
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </>
        )}
      </button>

      {/* Demo Fast Fill */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={fillDemoAdmin}
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 hover:text-foreground transition-colors underline decoration-dotted"
        >
          {t('Auto-fill Admin Demo Credentials')}
        </button>
      </div>
    </form>
  )
}
