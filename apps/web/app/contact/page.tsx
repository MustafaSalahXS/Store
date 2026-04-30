'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { useStore } from '@/lib/store-context'
import { motion } from 'framer-motion'
import { MessageCircle, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const { currentStore } = useStore()

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="section-container max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            <div className="text-center space-y-4">
              <h1 className="font-bodoni text-5xl md:text-7xl font-bold uppercase tracking-tighter">Contact Us</h1>
              <div className="h-1 w-24 bg-stone-900 mx-auto" />
              <p className="font-jost text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">We're Here to Help</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="font-bodoni text-3xl font-bold uppercase">Get In Touch</h2>
                    <p className="font-jost text-stone-500 leading-relaxed">Whether you have a question about our products, an order, or just want to say hello, we'd love to hear from you.</p>
                  </div>

                  <div className="space-y-6">
                    <Link href={`https://wa.me/${currentStore?.whatsappNumber}`} target="_blank" className="flex items-center gap-6 p-6 bg-white border border-stone-100 rounded-[2rem] hover:shadow-xl transition-all group">
                       <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                         <MessageCircle className="w-7 h-7" />
                       </div>
                       <div>
                         <div className="font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">WhatsApp</div>
                         <div className="font-bodoni font-bold text-xl">{currentStore?.whatsappNumber || 'Direct Chat'}</div>
                       </div>
                    </Link>

                    <div className="flex items-center gap-6 p-6 bg-white border border-stone-100 rounded-[2rem] group transition-all">
                       <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                         <Mail className="w-7 h-7" />
                       </div>
                       <div>
                         <div className="font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">Email Support</div>
                         <div className="font-bodoni font-bold text-xl">{currentStore?.email || 'support@modernstore.com'}</div>
                       </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-white border border-stone-100 rounded-[2rem] group transition-all">
                       <div className="w-14 h-14 bg-stone-900/10 rounded-2xl flex items-center justify-center text-stone-900">
                         <MapPin className="w-7 h-7" />
                       </div>
                       <div>
                         <div className="font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">Our Atelier</div>
                         <div className="font-bodoni font-bold text-xl">{currentStore?.address || 'Cairo, Egypt'}</div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-stone-900 text-white rounded-[3rem] p-10 md:p-16 space-y-10 shadow-2xl flex flex-col justify-center">
                  <div className="space-y-4">
                    <h3 className="font-bodoni text-3xl font-bold uppercase tracking-tight text-gold-500">Working Hours</h3>
                    <div className="space-y-2">
                       <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="font-jost text-sm text-stone-400 uppercase tracking-widest">Sunday - Thursday</span>
                          <span className="font-jost font-bold text-sm">10:00 AM - 10:00 PM</span>
                       </div>
                       <div className="flex justify-between border-b border-white/10 pb-2 pt-2">
                          <span className="font-jost text-sm text-stone-400 uppercase tracking-widest">Friday - Saturday</span>
                          <span className="font-jost font-bold text-sm">02:00 PM - 11:00 PM</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-bodoni text-3xl font-bold uppercase tracking-tight text-gold-500">Store Policies</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <Link href="/privacy" className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-center font-jost text-[10px] font-bold uppercase tracking-[0.2em]">Privacy Policy</Link>
                       <Link href="/sustainability" className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-center font-jost text-[10px] font-bold uppercase tracking-[0.2em]">Sustainability</Link>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
