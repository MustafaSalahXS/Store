'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'
import { User, Mail, Lock, AlertCircle, Loader, Eye, EyeOff, Check, ArrowRight, ArrowLeft } from 'lucide-react'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter()
  const { register } = useAuth()
  const { t, isRTL } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Password strength calculation
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasUppercase = /[A-Z]/.test(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch', 'Passwords do not match'))
      return
    }

    if (!hasMinLength) {
      setError(t('auth.passwordTooShort', 'Password must be at least 8 characters'))
      return
    }

    setIsLoading(true)

    try {
      await register(email, password, name)
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/login?registered=true')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Registration failed. Please try again.', 'فشل التسجيل. يرجى المحاولة مرة أخرى.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Name */}
      <div className="space-y-1">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {t('Full Name')}
        </label>
        <div className="relative">
          <User className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-background border border-border/80 rounded-2xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 transition-all font-medium`}
            placeholder="Alexandra Vance"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {t('Email Address')}
        </label>
        <div className="relative">
          <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-background border border-border/80 rounded-2xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 transition-all font-medium`}
            placeholder="client@domain.com"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {t('Password (Min 8 Characters)')}
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
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
            className={`w-full ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} py-3 bg-background border border-border/80 rounded-2xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 transition-all font-medium`}
            placeholder="••••••••••••"
          />
        </div>

        {/* Live Password Checklist */}
        {password.length > 0 && (
          <div className="flex items-center gap-3 pt-1 text-[9px] font-bold uppercase tracking-wider">
            <span className={hasMinLength ? 'text-emerald-500' : 'text-muted-foreground'}>
              ✓ {t('8+ Chars', '8+ أحرف')}
            </span>
            <span className={hasNumber ? 'text-emerald-500' : 'text-muted-foreground'}>
              ✓ {t('Number', 'رقم')}
            </span>
            <span className={hasUppercase ? 'text-emerald-500' : 'text-muted-foreground'}>
              ✓ {t('Uppercase', 'حرف كبير')}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {t('Confirm Password')}
        </label>
        <div className="relative">
          <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-background border border-border/80 rounded-2xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 transition-all font-medium`}
            placeholder="••••••••••••"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-foreground hover:bg-foreground/90 text-background font-black text-xs uppercase tracking-[0.25em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>{t('Creating Profile...')}</span>
          </>
        ) : (
          <>
            <span>{t('Establish Account')}</span>
            {isRTL ? (
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </>
        )}
      </button>
    </form>
  )
}
