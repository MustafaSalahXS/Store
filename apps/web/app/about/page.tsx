'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { useStore } from '@/lib/store-context'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Share2, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
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
              <h1 className="font-bodoni text-5xl md:text-7xl font-bold uppercase tracking-tighter">About Us</h1>
              <div className="h-1 w-24 bg-gold-500 mx-auto" />
              <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">Our Story & Vision</p>
            </div>

            <div className="prose prose-stone max-w-none">
              <div className="font-jost text-lg md:text-xl text-stone-700 leading-relaxed whitespace-pre-wrap">
                {currentStore?.aboutUs || `Welcome to ${currentStore?.name || 'our store'}. 
                
We believe in creating pieces that are not just products, but stories. Our journey began with a simple vision: to bring elegance and quality to the modern individual.

Every item in our collection is carefully curated to ensure it meets our high standards of craftsmanship and design. We are dedicated to providing a premium shopping experience that reflects our passion for beauty and functionality.`}
              </div>
            </div>

            <div className="pt-16 border-t border-stone-200">
               <h2 className="font-bodoni text-3xl font-bold uppercase mb-8 text-center">Connect With Us</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {currentStore?.instagramUrl && (
                   <Link href={currentStore.instagramUrl} target="_blank" className="flex items-center gap-4 p-6 bg-white border border-stone-100 rounded-2xl hover:shadow-xl transition-all group">
                     <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                       <Instagram className="w-6 h-6" />
                     </div>
                     <div>
                       <div className="font-black text-xs uppercase tracking-widest text-stone-400">Instagram</div>
                       <div className="font-bodoni font-bold text-lg">Follow Our Journey</div>
                     </div>
                   </Link>
                 )}
                 {currentStore?.facebookUrl && (
                   <Link href={currentStore.facebookUrl} target="_blank" className="flex items-center gap-4 p-6 bg-white border border-stone-100 rounded-2xl hover:shadow-xl transition-all group">
                     <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                       <Facebook className="w-6 h-6" />
                     </div>
                     <div>
                       <div className="font-black text-xs uppercase tracking-widest text-stone-400">Facebook</div>
                       <div className="font-bodoni font-bold text-lg">Join Our Community</div>
                     </div>
                   </Link>
                 )}
                 {currentStore?.tiktokUrl && (
                   <Link href={currentStore.tiktokUrl} target="_blank" className="flex items-center gap-4 p-6 bg-white border border-stone-100 rounded-2xl hover:shadow-xl transition-all group">
                     <div className="w-12 h-12 bg-stone-900/10 rounded-xl flex items-center justify-center text-stone-900 group-hover:scale-110 transition-transform">
                       <span className="font-black text-lg">TT</span>
                     </div>
                     <div>
                       <div className="font-black text-xs uppercase tracking-widest text-stone-400">TikTok</div>
                       <div className="font-bodoni font-bold text-lg">Watch Our Process</div>
                     </div>
                   </Link>
                 )}
                 {currentStore?.whatsappNumber && (
                   <Link href={`https://wa.me/${currentStore.whatsappNumber}`} target="_blank" className="flex items-center gap-4 p-6 bg-white border border-stone-100 rounded-2xl hover:shadow-xl transition-all group">
                     <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                       <MessageCircle className="w-6 h-6" />
                     </div>
                     <div>
                       <div className="font-black text-xs uppercase tracking-widest text-stone-400">WhatsApp</div>
                       <div className="font-bodoni font-bold text-lg">Instant Support</div>
                     </div>
                   </Link>
                 )}
               </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
