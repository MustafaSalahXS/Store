'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { useStore } from '@/lib/store-context'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye } from 'lucide-react'

export default function PrivacyPage() {
  const { currentStore } = useStore()

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="section-container max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            <div className="text-center space-y-4">
              <h1 className="font-bodoni text-5xl md:text-7xl font-bold uppercase tracking-tighter">Privacy Policy</h1>
              <div className="h-1 w-24 bg-stone-900 mx-auto" />
              <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">Your Data, Protected</p>
            </div>

            <div className="prose prose-stone max-w-none">
              <div className="font-jost text-sm md:text-base text-stone-600 leading-relaxed whitespace-pre-wrap bg-white p-8 md:p-12 border border-stone-100 rounded-[2rem] shadow-sm">
                {currentStore?.privacy || `Your privacy is important to us. It is our policy to respect your privacy regarding any information we may collect from you across our website.

We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.

We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="p-6 bg-stone-100 rounded-2xl flex items-center gap-4">
                 <Shield className="w-6 h-6 text-stone-900" />
                 <span className="font-black text-[10px] uppercase tracking-widest">Secure Data</span>
              </div>
              <div className="p-6 bg-stone-100 rounded-2xl flex items-center gap-4">
                 <Lock className="w-6 h-6 text-stone-900" />
                 <span className="font-black text-[10px] uppercase tracking-widest">Encryption</span>
              </div>
              <div className="p-6 bg-stone-100 rounded-2xl flex items-center gap-4">
                 <Eye className="w-6 h-6 text-stone-900" />
                 <span className="font-black text-[10px] uppercase tracking-widest">Transparency</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
