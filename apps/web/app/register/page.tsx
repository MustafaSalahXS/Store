'use client'

import Link from 'next/link'
import RegisterForm from '@/components/auth/register-form'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Get started with our platform</p>
          </div>

          {/* Register Form */}
          <RegisterForm />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-border space-y-3">
            <h3 className="text-sm font-semibold text-foreground text-center mb-4">
              What you&apos;ll get:
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Browse our complete product catalog</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Track your orders in real-time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Save your favorite products</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Manage your payment methods securely</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Or continue browsing as a guest</p>
          <Link href="/" className="text-primary hover:underline font-semibold">
            Back to Store
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
