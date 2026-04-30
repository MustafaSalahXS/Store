'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { useStore } from '@/lib/store-context'
import { motion } from 'framer-motion'
import { Leaf, ShieldCheck, Globe } from 'lucide-react'

export default function SustainabilityPage() {
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
              <h1 className="font-bodoni text-5xl md:text-7xl font-bold uppercase tracking-tighter">Sustainability</h1>
              <div className="h-1 w-24 bg-green-600 mx-auto" />
              <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">Our Commitment to the Future</p>
            </div>

            <div className="prose prose-stone max-w-none">
              <div className="font-jost text-lg md:text-xl text-stone-700 leading-relaxed whitespace-pre-wrap">
                {currentStore?.sustainability || `We believe that luxury should not come at the cost of our planet. 
                
Sustainability is at the core of everything we do. From responsibly sourcing our materials to optimizing our delivery processes, we are constantly striving to reduce our environmental footprint.

We work closely with partners who share our values, ensuring fair labor practices and ethical manufacturing. When you shop with us, you are supporting a more conscious and sustainable future for the fashion and digital goods industry.`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 border-t border-stone-200">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                  <Leaf className="w-8 h-8" />
                </div>
                <h3 className="font-bodoni font-bold text-xl uppercase">Eco-Friendly</h3>
                <p className="font-jost text-sm text-stone-500">Materials and processes that respect nature.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="font-bodoni font-bold text-xl uppercase">Ethical Sourcing</h3>
                <p className="font-jost text-sm text-stone-500">Transparency and fairness in every step.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center text-gold-600 mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-bodoni font-bold text-xl uppercase">Quality First</h3>
                <p className="font-jost text-sm text-stone-500">Longevity is the ultimate sustainability.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
