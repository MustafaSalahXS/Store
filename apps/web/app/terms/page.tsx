'use client'

import Header from '@/components/header'
import { motion } from 'framer-motion'
import { Shield, Scale, FileText, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using this marketplace, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.",
      icon: CheckCircle
    },
    {
      title: "2. Digital Products & Licensing",
      content: "All digital products purchased through our platform are subject to our Standard Digital License unless otherwise specified. You are granted a non-exclusive, non-transferable right to use the assets in your personal or commercial projects.",
      icon: Shield
    },
    {
      title: "3. User Conduct",
      content: "Users are prohibited from using the platform for any illegal activities, including but not limited to the distribution of malicious software, unauthorized resale of digital assets, or infringement on intellectual property rights.",
      icon: Scale
    },
    {
      title: "4. Payments & Refunds",
      content: "Due to the digital nature of our products, all sales are final once the download link has been accessed. Refund requests may be considered on a case-by-case basis if there is a technical defect in the file that we cannot resolve.",
      icon: FileText
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="section-container py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-20"
          >
            <h1 className="text-7xl font-black tracking-tighter uppercase">Terms of <span className="text-primary italic">Service</span></h1>
            <p className="text-xl text-muted-foreground font-medium">Last updated: April 29, 2026</p>
          </motion.div>

          <div className="space-y-12">
            {sections.map((section, idx) => (
              <motion.div 
                key={section.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-[3rem] border border-border p-10 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                <div className="flex items-start gap-8 relative">
                   <div className="p-5 bg-primary/10 rounded-[1.5rem] text-primary shrink-0">
                      <section.icon className="w-8 h-8" />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-2xl font-black tracking-tight uppercase">{section.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed font-medium">{section.content}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }}
            className="mt-20 p-10 bg-secondary/30 rounded-[3rem] border border-border text-center space-y-6"
          >
            <h4 className="text-xl font-black uppercase">Questions about our terms?</h4>
            <p className="text-muted-foreground font-medium">If you have any questions regarding these Terms of Service, please contact our legal team.</p>
            <a href="/contact" className="inline-block px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl hover:brightness-110 transition-all uppercase tracking-widest">Contact Support</a>
          </motion.div>
        </div>
      </main>

      <footer className="py-20 border-t border-border mt-20">
        <div className="section-container text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black">M</div>
            <span className="text-xl font-black tracking-tight uppercase">Modern Store</span>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Compliance & Legal Excellence</p>
        </div>
      </footer>
    </div>
  )
}
