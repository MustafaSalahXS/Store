'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import { api, PaymentMethod } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, CreditCard, MessageCircle, Wallet, AlertCircle, Check, ChevronRight, Loader, X, ArrowLeft, ShieldCheck, Zap, Lock, Download } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { useLanguage } from '@/lib/language-context'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const getPaymentMethods = (t: any) => [
  {
    id: 'card',
    name: t('checkout.card'),
    icon: CreditCard,
    description: 'Visa, Mastercard via Paymob',
  },
  {
    id: 'vodafone_cash',
    name: t('checkout.vodafone'),
    icon: Wallet,
    description: 'Vodafone, Etisalat, or Orange Cash',
  },
  {
    id: 'instapay',
    name: t('checkout.instapay'),
    icon: Zap,
    description: 'Bank transfer via InstaPay App',
  },
  {
    id: 'whatsapp',
    name: t('checkout.whatsapp'),
    icon: MessageCircle,
    description: 'Confirm payment via WhatsApp',
  },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { currentStore, isLoading: isStoreLoading } = useStore()
  const { items, total, clearCart } = useCart()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?redirect=/checkout')
    }
  }, [user, isAuthLoading, router])

  const [step, setStep] = useState<'cart' | 'details' | 'payment'>('cart')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card')
  const [isLoading, setIsLoading] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState('')
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null)
  const [couponError, setCouponError] = useState('')

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // Auto-fill from logged-in user
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name)
      if (user.email && !email) setEmail(user.email)
      if (user.phone && !phone) setPhone(user.phone)
    }
  }, [user])

  // Paymob states
  const [paymobIframeUrl, setPaymobIframeUrl] = useState<string | null>(null)
  const [showPaymobModal, setShowPaymobModal] = useState(false)

  const currency = currentStore?.currency || 'USD'

  const taxRate = Number(currentStore?.taxRate || 0)
  const tax = total * (taxRate / 100)
  const shipping = Number(currentStore?.shippingFee || 0)
  
  let discountAmount = 0
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = total * (appliedCoupon.discountValue / 100)
    } else {
      discountAmount = appliedCoupon.discountValue
    }
  }
  
  const grandTotal = Math.max(0, total - discountAmount) + tax + shipping

  const PAYMENT_METHODS = getPaymentMethods(t)

  if (isStoreLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-black tracking-widest uppercase text-xs">Securing Checkout...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !orderCreated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-24 text-center space-y-8">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground opacity-30">
               <ShoppingCart className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter">Your bag is <span className="text-primary italic">Empty</span></h1>
            <button onClick={() => router.push('/')} className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:brightness-110 uppercase tracking-widest transition-all">Discover Collections</button>
          </motion.div>
        </div>
      </div>
    )
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    setIsLoading(true)
    setCouponError('')
    try {
      const coupon = await api.coupons.validate(couponCode)
      setAppliedCoupon(coupon)
    } catch (error: any) {
      setCouponError(error.message || 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!name || !email || !phone) {
      setError('Please fill in all contact details.')
      return
    }
    setIsLoading(true)
    setError('')

    try {
      const orderItems = items.map((item) => {
        let finalPrice = Number(item.product.price)
        if (item.product.discountActive && item.product.discountPercentage) {
          finalPrice = finalPrice * (1 - item.product.discountPercentage / 100)
        } else if (item.product.discountPrice) {
          finalPrice = Number(item.product.discountPrice)
        }

        return {
          id: Math.random().toString(),
          product_id: item.productId,
          product_name: item.product.name,
          quantity: item.quantity,
          price: finalPrice,
          selectedSize: item.size,
          customizations: item.customizations,
        }
      })


      const result = await api.orders.create({
        userId: user?.id || null,
        customerEmail: email,
        customerName: name,
        customerPhone: phone,
        items: orderItems,
        paymentMethod: selectedMethod,
        total: grandTotal,
        orderStatus: selectedMethod === 'card' ? 'approved' : 'pending'
      })

      if (!result) throw new Error('Order creation failed.')

      setOrderId(result.id)
      setOrderCreated(true)
      
      if (selectedMethod === 'whatsapp') {
        const adminNumber = currentStore?.whatsappNumber || ''
        const itemsList = items.map(item => `- ${item.quantity}x ${item.product.name}${item.size ? ` (Size: ${item.size})` : ''}`).join('\n')
        const message = `Hello! I would like to place an order.\n\n*Order ID:* #${result.id.slice(-6).toUpperCase()}\n*Items:*\n${itemsList}\n*Name:* ${name}\n*Total:* ${formatPrice(grandTotal, currency)}\n\nPlease let me know how to proceed with payment.`
        window.open(`https://wa.me/${adminNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
      } else if (selectedMethod === 'card') {
        try {
          const paymobData = await api.payments.paymob.create({
            orderId: result.id,
            amount: grandTotal,
            customer: { email, name, phone }
          })
          setPaymobIframeUrl(paymobData.iframeUrl)
          setShowPaymobModal(true)
        } catch (paymobErr) {
          console.error('Paymob error:', paymobErr)
          setError('Order created but failed to initiate payment. Please contact support.')
        }
      }

      clearCart()
      setStep('payment')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReceipt = async () => {
    // Create a temporary hidden container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '-9999px'
    container.style.left = '-9999px'
    container.style.width = '800px' // Fixed width for consistent PDF generation
    container.style.padding = '60px'
    container.style.backgroundColor = '#ffffff'
    container.style.fontFamily = 'sans-serif'
    container.style.color = '#1C1917'
    
    // Fill it with the receipt HTML
    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 50px; border-bottom: 2px solid #E7E5E4; padding-bottom: 30px;">
        <div style="font-size: 32px; font-weight: 800; margin-bottom: 8px; color: #1C1917; text-transform: uppercase; letter-spacing: 2px;">${currentStore?.name || 'Store'}</div>
        <div style="font-size: 14px; color: #78716C; text-transform: uppercase; letter-spacing: 4px; font-weight: 600;">Official Receipt</div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 50px; padding: 20px; background-color: #FAFAF9; border-radius: 12px; border: 1px solid #E7E5E4;">
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px;">Order Reference</div>
          <div style="font-weight: 800; font-size: 16px;">#${orderId.slice(-8).toUpperCase()}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px;">Date</div>
          <div style="font-weight: 700; font-size: 16px;">${new Date().toLocaleDateString()}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px;">Customer</div>
          <div style="font-weight: 700; font-size: 16px;">${name}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px;">Payment Method</div>
          <div style="font-weight: 700; font-size: 16px;">${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name || selectedMethod}</div>
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 50px;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 2px solid #E7E5E4; padding: 15px 0; font-size: 12px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 1px;">Item</th>
            <th style="text-align: center; border-bottom: 2px solid #E7E5E4; padding: 15px 0; font-size: 12px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
            <th style="text-align: right; border-bottom: 2px solid #E7E5E4; padding: 15px 0; font-size: 12px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 1px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td style="padding: 20px 0; border-bottom: 1px solid #F5F5F4;">
                <div style="font-weight: 700; font-size: 16px;">${item.product.name}</div>
                ${item.size ? `<div style="font-size: 13px; color: #78716C; margin-top: 4px;">Size: ${item.size}</div>` : ''}
              </td>
              <td style="padding: 20px 0; border-bottom: 1px solid #F5F5F4; text-align: center; font-weight: 600; font-size: 15px;">${item.quantity}</td>
              <td style="padding: 20px 0; border-bottom: 1px solid #F5F5F4; text-align: right; font-weight: 700; font-size: 16px;">${formatPrice(Number(item.product.discountPrice || item.product.price) * item.quantity, currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-left: auto; width: 350px; background-color: #FAFAF9; padding: 24px; border-radius: 12px; border: 1px solid #E7E5E4;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: #78716C; font-weight: 600;">Subtotal</span>
          <span style="font-weight: 700;">${formatPrice(total, currency)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: #78716C; font-weight: 600;">Tax (${currentStore?.taxRate || 0}%)</span>
          <span style="font-weight: 700;">${formatPrice(tax, currency)}</span>
        </div>
        ${shipping > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: #78716C; font-weight: 600;">Shipping</span>
          <span style="font-weight: 700;">${formatPrice(shipping, currency)}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px solid #E7E5E4; font-size: 24px; font-weight: 800;">
          <span>Total Paid</span>
          <span style="color: #CA8A04;">${formatPrice(grandTotal, currency)}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 80px; color: #78716C; font-size: 13px; line-height: 1.6; font-weight: 500;">
        Thank you for your purchase from <span style="color: #1C1917; font-weight: 700;">${currentStore?.name}</span>!<br/>
        For any questions, please contact us at <span style="color: #1C1917; font-weight: 700;">${currentStore?.email || currentStore?.whatsappNumber || 'support'}</span>.
      </div>
    `
    
    document.body.appendChild(container)
    
    try {
      const canvas = await html2canvas(container, {
        scale: 2, // Higher quality for crisp text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Receipt_${currentStore?.name?.replace(/\s+/g, '_')}_${orderId.slice(-8)}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate receipt PDF.')
    } finally {
      document.body.removeChild(container)
    }
  }

  const steps = [
    { id: 'cart', label: t('checkout.bag'), icon: ShoppingCart },
    { id: 'details', label: t('checkout.identity'), icon: Lock },
    { id: 'payment', label: t('checkout.securePay'), icon: ShieldCheck }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />
      
      <main className="section-container py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">
          
          {/* Main Checkout Flow */}
          <div className="lg:col-span-8 space-y-8 lg:space-y-12">
            
            {/* Premium Step Indicator */}
            <div className="flex items-center gap-4 md:gap-8 border-b border-border/50 pb-4 md:pb-6 overflow-x-auto no-scrollbar">
              {steps.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-2 md:gap-3 shrink-0 relative ${step === s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                   <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${step === s.id ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-105' : 'bg-secondary'}`}>
                      <s.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Step 0{i + 1}</span>
                      <span className={`text-[9px] md:text-xs font-black uppercase tracking-widest ${step === s.id ? 'opacity-100' : 'opacity-40'}`}>{s.label}</span>
                   </div>
                </div>
              ))}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 bg-destructive/10 border border-destructive/20 rounded-[2rem] flex items-center gap-4 text-destructive font-bold shadow-sm">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <span className="text-sm tracking-tight">{error}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === 'cart' && (
                <motion.div key="cart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 md:space-y-8">
                  <div className="flex items-end justify-between gap-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">{t('checkout.review')} <span className="text-primary italic">{t('checkout.selection')}</span></h2>
                    <span className="text-[9px] md:text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 shrink-0">{items.length} {t('cart.items')}</span>
                  </div>
                  
                  <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.productId} className="group flex flex-col sm:flex-row gap-4 md:gap-6 p-4 md:p-6 bg-secondary/30 border border-border rounded-2xl md:rounded-[2rem] hover:bg-secondary/50 transition-all hover:border-primary/20">
                          <div className="w-full sm:w-20 md:w-24 h-20 md:h-24 bg-card rounded-xl md:rounded-2xl overflow-hidden border border-border shrink-0">
                            <img src={item.product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&q=80'} className="w-full h-full object-contain transition-transform group-hover:scale-110" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center gap-1">
                             <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-[0.2em]">{item.product.category || 'Digital Asset'}</span>
                              <h3 className="text-lg md:text-xl font-black tracking-tight">{item.product.name}</h3>
                              <div className="flex items-center gap-2">
                                 <p className="text-muted-foreground font-bold text-[10px] md:text-xs">Qty: {item.quantity}</p>
                                 {item.size && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">Size: {item.size}</span>}
                              </div>
                           </div>
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                             <span className="text-lg md:text-xl font-black text-primary tracking-tighter">{formatPrice(Number(item.product.discountPrice || item.product.price) * item.quantity, currency)}</span>
                             <span className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest">Premium Access</span>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {/* Promo Code Section */}
                  <div className="bg-secondary/20 border border-border p-4 md:p-6 rounded-2xl md:rounded-[2rem] space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Promo Code</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                        placeholder="e.g., SUMMER20" 
                        disabled={!!appliedCoupon}
                        className="flex-1 p-4 md:p-5 bg-card border border-border rounded-xl font-bold text-sm md:text-base outline-none focus:border-primary transition-all uppercase" 
                      />
                      <button 
                        onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode('') } : handleApplyCoupon} 
                        disabled={isLoading || (!couponCode && !appliedCoupon)}
                        className={`px-8 py-4 md:py-5 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                          appliedCoupon 
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                            : 'bg-primary text-white shadow-xl shadow-primary/30 hover:brightness-110'
                        }`}
                      >
                        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : appliedCoupon ? 'Remove' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs font-bold ml-2 mt-2">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-green-500 text-xs font-bold ml-2 mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" /> 
                        Coupon applied: {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `${formatPrice(appliedCoupon.discountValue, currency)} OFF`}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setStep('details')} className="w-full py-4 md:py-5 bg-primary text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base shadow-xl shadow-primary/30 hover:brightness-110 uppercase tracking-widest transition-all flex items-center justify-center gap-3 group">
                    Continue <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                  <div className="space-y-1">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">{t('checkout.customer')} <span className="text-primary italic">{t('checkout.identityHeading')}</span></h2>
                    <p className="text-muted-foreground font-medium text-sm">{t('checkout.identityDesc')}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 bg-secondary/30 p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-border">
                    <div className="space-y-1.5 md:col-span-2">
                       <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Full Legal Name</label>
                       <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 md:p-4 bg-card border border-border rounded-xl font-bold text-sm md:text-base outline-none focus:border-primary transition-all" placeholder="Johnathan Doe" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Contact Email</label>
                       <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 md:p-4 bg-card border border-border rounded-xl font-bold text-sm md:text-base outline-none focus:border-primary transition-all" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Phone Number</label>
                       <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 md:p-4 bg-card border border-border rounded-xl font-bold text-sm md:text-base outline-none focus:border-primary transition-all" placeholder="+1 (000) 000-0000" />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setStep('cart')} className="flex-1 py-4 bg-secondary text-foreground rounded-xl font-black text-sm uppercase tracking-widest hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
                       <ArrowLeft className="w-4 h-4" /> Review Bag
                    </button>
                    <button onClick={() => setStep('payment')} className="flex-[2] py-4 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 hover:brightness-110 transition-all flex items-center justify-center gap-2">
                       Proceed to Secure Pay <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                   <div className="space-y-4">
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                      {orderCreated ? 'Success' : (
                        <>Secure <span className="text-primary italic">Pay</span></>
                      )}
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm md:text-base">
                      {orderCreated ? 'Your digital assets are being prepared for delivery.' : 'Choose your preferred secure payment method below.'}
                    </p>
                  </div>

                  {!orderCreated ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {PAYMENT_METHODS.map(method => (
                        <div key={method.id} className="space-y-4">
                          <button 
                            onClick={() => setSelectedMethod(method.id)} 
                            className={`w-full group p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden ${selectedMethod === method.id ? 'border-primary bg-primary/5 shadow-2xl scale-[1.02]' : 'border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50'}`}
                          >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${selectedMethod === method.id ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-secondary text-muted-foreground'}`}>
                               <method.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mb-2">{method.name}</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{method.description}</p>
                            {selectedMethod === method.id && (
                               <div className="absolute top-8 right-8 w-3 h-3 bg-primary rounded-full animate-pulse" />
                            )}
                          </button>
                          
                          <AnimatePresence>
                            {selectedMethod === method.id && (method.id === 'vodafone_cash' || method.id === 'instapay') && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl space-y-3">
                                   <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Transfer Details</span>
                                      <span className="text-[8px] font-bold text-muted-foreground uppercase bg-white/50 px-2 py-0.5 rounded-full">Official Business Wallet</span>
                                   </div>
                                   <div className="flex items-center justify-between p-4 bg-white/80 rounded-2xl border border-primary/10 group cursor-pointer" onClick={() => {
                                      navigator.clipboard.writeText(currentStore?.whatsappNumber || '+201010574543')
                                      alert('Number copied to clipboard!')
                                   }}>
                                      <span className="text-xl font-black tracking-tighter text-stone-900">{currentStore?.whatsappNumber || '+201010574543'}</span>
                                      <span className="text-[9px] font-black uppercase text-primary border-b border-primary/30">Copy Number</span>
                                   </div>
                                   <p className="text-[9px] font-bold text-muted-foreground leading-relaxed">
                                      {method.id === 'vodafone_cash' 
                                        ? 'Transfer the total amount to our mobile wallet and send the screenshot to us via WhatsApp.' 
                                        : 'Transfer via the InstaPay App to our mobile number/IPA and share the confirmation.'}
                                   </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 bg-green-500/5 border border-green-500/20 rounded-[4rem] text-center space-y-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-bl-full -mr-32 -mt-32" />
                      <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto relative">
                         <Check className="w-12 h-12" />
                      </div>
                      <div className="space-y-4 relative">
                        <h3 className="text-5xl font-black tracking-tighter uppercase">Order Authenticated</h3>
                        <p className="text-muted-foreground font-black text-sm uppercase tracking-[0.2em]">Transaction Reference: #{orderId.slice(-8).toUpperCase()}</p>
                      </div>
                      
                      {selectedMethod === 'card' && paymobIframeUrl && (
                         <button onClick={() => setShowPaymobModal(true)} className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 uppercase tracking-[0.2em] hover:scale-105 transition-all relative">Open Payment Portal</button>
                      )}

                      {currentStore?.enableReceipts !== false && (
                        <button 
                          onClick={handleDownloadReceipt} 
                          className="flex items-center gap-3 px-10 py-4 bg-secondary text-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-secondary/80 transition-all mx-auto"
                        >
                          <Download className="w-5 h-5" /> Download Receipt
                        </button>
                      )}
                    </div>
                  )}

                  {!orderCreated ? (
                    <div className="flex flex-col sm:flex-row gap-6">
                      <button onClick={() => setStep('details')} className="flex-1 py-6 bg-secondary text-foreground rounded-[2rem] font-black text-lg uppercase tracking-widest hover:bg-secondary/80 transition-all flex items-center justify-center gap-3">
                         <ArrowLeft className="w-5 h-5" /> Personal Details
                      </button>
                      <button onClick={handleCreateOrder} disabled={isLoading} className="flex-1 py-6 bg-primary text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/30 hover:brightness-110 transition-all flex items-center justify-center gap-4 group">
                        {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : <><ShieldCheck className="w-6 h-6" /> {selectedMethod === 'card' ? 'Authorize Payment' : 'Finalize Order'}</>}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => router.push('/')} className="w-full py-6 bg-foreground text-background rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl hover:opacity-90 transition-all">Back to Storefront</button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-card p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-border shadow-xl sticky top-24 space-y-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-br-full -ml-12 -mt-12" />
               
               <div className="space-y-1 relative">
                  <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase">Order <span className="text-primary italic">Summary</span></h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                     <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                     <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Guaranteed Secure</span>
                  </div>
               </div>

               <div className="space-y-3 relative">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Asset Value</span>
                    <span className="text-sm md:text-base font-black tracking-tighter">{formatPrice(total, currency)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tax ({taxRate}%)</span>
                    <span className="text-sm md:text-base font-black tracking-tighter">{formatPrice(tax, currency)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Processing</span>
                    <span className="text-sm md:text-base font-black tracking-tighter text-green-500">{shipping === 0 ? 'FREE' : formatPrice(shipping, currency)}</span>
                 </div>
                 {appliedCoupon && (
                   <div className="flex justify-between items-center">
                     <span className="text-[9px] md:text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                       <Check className="w-3 h-3" /> Coupon ({appliedCoupon.code})
                     </span>
                     <span className="text-sm md:text-base font-black tracking-tighter text-green-500">-{formatPrice(discountAmount, currency)}</span>
                   </div>
                 )}
                 
                 <div className="pt-5 border-t-2 border-dashed border-border/50 flex flex-col items-end gap-1">
                    <span className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Total Amount Due</span>
                    <span className="text-3xl md:text-4xl font-black text-primary tracking-tighter">{formatPrice(grandTotal, currency)}</span>
                 </div>
               </div>

               <div className="pt-4 relative">
                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
                     <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                     <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-relaxed">Included: Commercial License + Lifetime Access + Version Updates</p>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </main>

      {/* Paymob Portal Modal */}
      <AnimatePresence>
        {showPaymobModal && paymobIframeUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-10">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-6xl h-full max-h-[95vh] rounded-[3rem] overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div className="absolute top-8 right-8 z-10">
                 <button onClick={() => setShowPaymobModal(false)} className="p-4 bg-black/5 hover:bg-black/10 rounded-full transition-all group">
                    <X className="w-6 h-6 text-black group-hover:rotate-90 transition-transform" />
                 </button>
              </div>
              <iframe src={paymobIframeUrl} className="w-full h-full border-none" title="Secure Payment Portal" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
