'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import { useLanguage } from '@/lib/language-context'
import { api, PaymentMethod } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  ShoppingBag,
  CreditCard, 
  MessageCircle, 
  Wallet, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Loader, 
  X, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  Zap, 
  Lock, 
  Download,
  Sparkles,
  MapPin,
  Truck,
  Banknote,
  Tag,
  Building,
  Phone,
  ExternalLink
} from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import OrderTracker from '@/components/checkout/order-tracker'
import LocationPicker from '@/components/checkout/location-picker'

export default function CheckoutPage() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { currentStore, isLoading: isStoreLoading } = useStore()
  const { items, total, clearCart } = useCart()

  useEffect(() => {
    const isGuest = typeof window !== 'undefined' && window.location.search.includes('guest=true')
    if (!isAuthLoading && !user && !isGuest) {
      router.push('/login?redirect=/checkout')
    }
  }, [user, isAuthLoading, router])

  const [step, setStep] = useState<'cart' | 'details' | 'payment'>('cart')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card')
  const [isLoading, setIsLoading] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState('')
  const [orderSummarySnapshot, setOrderSummarySnapshot] = useState<{
    items: any[]
    total: number
    tax: number
    shipping: number
    grandTotal: number
    discountAmount: number
    appliedCoupon: any
    currency: string
    customerName: string
    customerEmail: string
    customerPhone: string
    paymentMethod: string
    orderId: string
    createdAt: string
  } | null>(null)
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null)
  const [couponError, setCouponError] = useState('')

  // Customer & Shipping Address State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [apartment, setApartment] = useState('')
  const [city, setCity] = useState('Cairo')
  const [deliveryNotes, setDeliveryNotes] = useState('')

  // Location & Delivery Zones State
  const [deliveryZones, setDeliveryZones] = useState<any[]>([])
  const [selectedZone, setSelectedZone] = useState<any | null>(null)
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null })

  // Fetch Delivery Zones
  useEffect(() => {
    api.deliveryZones.list()
      .then(zones => {
        if (zones && zones.length > 0) {
          const active = zones.filter((z: any) => z.isActive)
          const valid = active.length > 0 ? active : zones
          setDeliveryZones(valid)
          setSelectedZone(valid[0])
        }
      })
      .catch(err => console.warn('Could not load delivery zones:', err))
  }, [])

  // Auto-fill from logged-in user and local storage
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name)
      if (user.email && !email) setEmail(user.email)
      if (user.phone && !phone) setPhone(user.phone)
    }

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('checkout_saved_address')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (!address && parsed.address) setAddress(parsed.address)
          if (!apartment && parsed.apartment) setApartment(parsed.apartment)
          if (parsed.city) setCity(parsed.city)
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }, [user])

  // Paymob states
  const [paymobIframeUrl, setPaymobIframeUrl] = useState<string | null>(null)
  const [showPaymobModal, setShowPaymobModal] = useState(false)

  const currency = currentStore?.currency || 'USD'
  const shipping = selectedZone ? Number(selectedZone.deliveryFee) : Number(currentStore?.shippingFee || 0)
  const taxRate = selectedZone && selectedZone.taxRate !== undefined ? Number(selectedZone.taxRate) : Number(currentStore?.taxRate || 0)
  const tax = total * (taxRate / 100)
  
  let discountAmount = 0
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = total * (appliedCoupon.discountValue / 100)
    } else {
      discountAmount = appliedCoupon.discountValue
    }
  }
  
  const grandTotal = Math.max(0, total - discountAmount) + tax + shipping

  const paymentOptions = [
    {
      id: 'card',
      name: t('checkout.card', 'Credit / Debit Card'),
      icon: CreditCard,
      description: t('visa, mastercard via paymob', 'Visa, Mastercard via secure Paymob portal'),
      badge: 'Instant Verification',
    },
    {
      id: 'instapay',
      name: t('checkout.instapay', 'InstaPay Transfer'),
      icon: Zap,
      description: t('bank transfer via instapay app', 'Instant bank transfer via InstaPay App'),
      badge: 'Zero Fees',
    },
    {
      id: 'vodafone_cash',
      name: t('checkout.vodafone', 'Mobile Wallets'),
      icon: Wallet,
      description: t('vodafone, etisalat, or orange cash', 'Vodafone Cash, Etisalat, or Orange Cash'),
      badge: 'Mobile Transfer',
    },
    {
      id: 'cod',
      name: t('cash on delivery', 'Cash on Delivery'),
      icon: Banknote,
      description: t('pay via cash upon courier arrival', 'Pay upon receiving your order from the courier'),
      badge: 'Concierge COD',
    },
    {
      id: 'whatsapp',
      name: t('checkout.whatsapp', 'WhatsApp Concierge'),
      icon: MessageCircle,
      description: t('confirm payment via whatsapp', 'Coordinate payment and custom tailoring via WhatsApp'),
      badge: 'Personal Stylist',
    },
  ]

  if (isStoreLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-stone-200 border-t-gold-500 rounded-full animate-spin mx-auto" />
          <p className="text-stone-400 font-jost font-bold tracking-widest uppercase text-xs">
            {t('common.loading')}
          </p>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !orderCreated) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900">
        <Header />
        <div className="section-container py-24 sm:py-36 text-center space-y-8">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 max-w-md mx-auto">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-300">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h1 className="font-bodoni text-3xl sm:text-4xl font-bold uppercase tracking-tight">
              {t('your bag is empty', 'Your bag is empty')}
            </h1>
            <p className="font-jost text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
              {t('Explore our curated luxury collections, archival capsules, and tailoring.', 'استكشف تشكيلاتنا الفاخرة وقطع الأرشيف والخياطة الراقية.')}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-4 bg-stone-900 text-white rounded-full font-jost font-bold text-xs uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl"
            >
              {t('discover collections', 'Discover Collections')}
            </button>
          </motion.div>
        </div>
        <Footer />
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
      setCouponError(error.message || t('Invalid coupon code', 'رمز القسيمة غير صالح'))
      setAppliedCoupon(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!name || !email || !phone) {
      setError(t('Please fill in all contact details.', 'يرجى استكمال بيانات التواصل كاملة.'))
      return
    }
    if (!address) {
      setError(t('Please specify your delivery address.', 'يرجى إدخال عنوان الشحن والتوصيل.'))
      return
    }

    setIsLoading(true)
    setError('')

    // Save address locally for future convenience
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('checkout_saved_address', JSON.stringify({ address, apartment, city }))
      } catch (e) {
        // ignore
      }
    }

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
          customizations: {
            ...item.customizations,
            shippingDestination: { address, apartment, city, deliveryNotes }
          },
        }
      })

      const fullShippingNotes = [
        `Destination: ${address}`,
        apartment ? `Apt/Unit: ${apartment}` : '',
        `City: ${city}`,
        deliveryNotes ? `Notes: ${deliveryNotes}` : '',
      ].filter(Boolean).join(' | ')

      const result = await api.orders.create({
        userId: user?.id || null,
        customerEmail: email,
        customerName: name,
        customerPhone: phone,
        items: orderItems,
        paymentMethod: selectedMethod,
        total: grandTotal,
        orderStatus: selectedMethod === 'card' ? 'approved' : 'pending',
        shippingAddress: fullShippingNotes,
        zoneId: selectedZone?.id || null,
        deliveryFee: shipping,
        taxRate: taxRate,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        addressDetails: `${address}${apartment ? `, Apt: ${apartment}` : ''} (${selectedZone?.nameEn || city})`,
        notes: deliveryNotes || null,
      })

      // Save to user addresses for fast re-use
      if (user?.id) {
        api.addresses.create({
          userId: user.id,
          title: 'Recent Delivery',
          address,
          apartment: apartment || null,
          city: selectedZone?.city || city,
          zoneName: selectedZone?.nameEn || selectedZone?.nameAr || null,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          isDefault: true,
        }).catch(() => {})
      }

      if (!result) throw new Error(t('Order creation failed.', 'فشل إنشاء الطلب. يرجى المحاولة مرة أخرى.'))

      setOrderId(result.id)
      setOrderCreated(true)

      // Save order snapshot for receipt generation BEFORE clearing cart
      setOrderSummarySnapshot({
        items: items.map(it => ({ ...it })),
        total,
        tax,
        shipping,
        grandTotal,
        discountAmount,
        appliedCoupon,
        currency,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        paymentMethod: selectedMethod,
        orderId: result.id,
        createdAt: new Date().toISOString(),
      })
      
      if (selectedMethod === 'whatsapp') {
        const adminNumber = currentStore?.whatsappNumber || ''
        const itemsList = items.map(item => `- ${item.quantity}x ${item.product.name}${item.size ? ` (Size: ${item.size})` : ''}`).join('\n')
        const message = `Hello! I would like to place an order.\n\n*Order ID:* #${result.id.slice(-8).toUpperCase()}\n*Items:*\n${itemsList}\n*Name:* ${name}\n*Phone:* ${phone}\n*Address:* ${address}, ${city}\n*Total:* ${formatPrice(grandTotal, currency)}\n\nPlease let me know how to proceed with payment.`
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
          setError(t('Order created but failed to initiate payment. Please contact support.', 'تم تسجيل الطلب ولكن تعذر فتح بوابة الدفع. يرجى التواصل مع الإدارة.'))
        }
      }

      clearCart()
      setStep('payment')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('An error occurred.', 'حدث خطأ غير متوقع.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReceipt = async (orderDataOverride?: any) => {
    let orderData = orderDataOverride
    if (!orderData && orderId) {
      try {
        orderData = await api.orders.get(orderId)
      } catch (e) {
        console.warn('Could not fetch order for receipt:', e)
      }
    }

    // Resolve items: prefer database order items, then snapshot items
    let receiptItems: Array<{ name: string; size: string; quantity: number; price: number }> = []
    if (orderData?.items && orderData.items.length > 0) {
      receiptItems = orderData.items.map((it: any) => ({
        name: it.productName || it.product_name || 'Garment Piece',
        size: it.selectedSize || it.size || '',
        quantity: Number(it.quantity) || 1,
        price: Number(it.totalPrice || (it.unitPrice * (it.quantity || 1)) || 0)
      }))
    } else if (orderSummarySnapshot?.items && orderSummarySnapshot.items.length > 0) {
      receiptItems = orderSummarySnapshot.items.map((it: any) => {
        let finalPrice = Number(it.product?.price || 0)
        if (it.product?.discountActive && it.product?.discountPercentage) {
          finalPrice = finalPrice * (1 - it.product.discountPercentage / 100)
        } else if (it.product?.discountPrice) {
          finalPrice = Number(it.product.discountPrice)
        }
        return {
          name: it.product?.name || 'Garment Piece',
          size: it.size || '',
          quantity: Number(it.quantity) || 1,
          price: finalPrice * (Number(it.quantity) || 1)
        }
      })
    }

    const receiptRef = (orderData?.id || orderSummarySnapshot?.orderId || orderId || 'ATELIER').slice(-8).toUpperCase()
    const receiptClient = orderData?.customerName || orderSummarySnapshot?.customerName || name || 'Valued Client'
    const receiptMethod = (orderData?.paymentMethod || orderSummarySnapshot?.paymentMethod || selectedMethod || 'CARD').toUpperCase()
    const receiptDate = orderData?.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : new Date().toLocaleDateString()

    const finalValuation = Number(orderData?.total || orderSummarySnapshot?.grandTotal || grandTotal || 0)
    const subtotalValuation = Number(orderSummarySnapshot?.total || (finalValuation > 0 ? finalValuation : 0))
    const taxValuation = Number(orderSummarySnapshot?.tax || (currentStore?.taxRate ? (subtotalValuation * Number(currentStore.taxRate) / 100) : 0))
    const shippingValuation = Number(orderSummarySnapshot?.shipping || (currentStore?.shippingFee ? Number(currentStore.shippingFee) : 0))
    const discountValuation = Number(orderSummarySnapshot?.discountAmount || 0)
    const receiptCurrency = orderSummarySnapshot?.currency || currency

    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '-9999px'
    container.style.left = '-9999px'
    container.style.width = '800px'
    container.style.padding = '50px 60px'
    container.style.backgroundColor = '#ffffff'
    container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    container.style.color = '#1C1917'
    container.setAttribute('dir', 'ltr')
    
    container.innerHTML = `
      <div style="direction: ltr !important; text-align: left !important;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 35px; border-bottom: 2px solid #E7E5E4; padding-bottom: 25px;">
          <div style="font-size: 26px; font-weight: 800; margin-bottom: 6px; color: #1C1917; text-transform: uppercase; letter-spacing: 2px;">${currentStore?.name || 'DIGITAL STORE'}</div>
          <div style="font-size: 12px; color: #78716C; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">Official Acquisition Invoice</div>
        </div>
        
        <!-- Meta Info Grid -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 35px; background-color: #FAFAF9; border-radius: 16px; border: 1px solid #E7E5E4; padding: 18px 24px;">
          <tr>
            <td style="width: 25%; text-align: left; vertical-align: top;">
              <div style="font-size: 10px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Order Reference</div>
              <div style="font-weight: 800; font-size: 15px; font-family: monospace; color: #1C1917;">#${receiptRef}</div>
            </td>
            <td style="width: 25%; text-align: left; vertical-align: top;">
              <div style="font-size: 10px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Date</div>
              <div style="font-weight: 700; font-size: 15px; color: #1C1917;">${receiptDate}</div>
            </td>
            <td style="width: 25%; text-align: left; vertical-align: top;">
              <div style="font-size: 10px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Client</div>
              <div style="font-weight: 700; font-size: 15px; color: #1C1917;">${receiptClient}</div>
            </td>
            <td style="width: 25%; text-align: left; vertical-align: top;">
              <div style="font-size: 10px; font-weight: 700; color: #78716C; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">Payment Method</div>
              <div style="font-weight: 700; font-size: 15px; color: #1C1917;">${receiptMethod}</div>
            </td>
          </tr>
        </table>
        
        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 35px;">
          <thead>
            <tr style="border-bottom: 2px solid #E7E5E4;">
              <th style="text-align: left; padding: 12px 0; font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 1px;">Garment Item</th>
              <th style="text-align: center; padding: 12px 0; font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 1px; width: 80px;">Qty</th>
              <th style="text-align: right; padding: 12px 0; font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Valuation</th>
            </tr>
          </thead>
          <tbody>
            ${receiptItems.map(item => `
              <tr style="border-bottom: 1px solid #F5F5F4;">
                <td style="padding: 16px 0; text-align: left;">
                  <div style="font-weight: 700; font-size: 15px; color: #1C1917;">${item.name}</div>
                  ${item.size ? `<div style="font-size: 11px; color: #78716C; margin-top: 3px; font-weight: 600;">Size: ${item.size}</div>` : ''}
                </td>
                <td style="padding: 16px 0; text-align: center; font-weight: 600; font-size: 14px; color: #1C1917;">${item.quantity}</td>
                <td style="padding: 16px 0; text-align: right; font-weight: 700; font-size: 15px; color: #1C1917;">${formatPrice(item.price, receiptCurrency)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Summary Card -->
        <div style="margin-left: auto; width: 340px; background-color: #FAFAF9; padding: 22px; border-radius: 16px; border: 1px solid #E7E5E4;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
            <span style="color: #78716C; font-weight: 600;">Subtotal</span>
            <span style="font-weight: 700; color: #1C1917;">${formatPrice(subtotalValuation, receiptCurrency)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
            <span style="color: #78716C; font-weight: 600;">Tax (${currentStore?.taxRate || 0}%)</span>
            <span style="font-weight: 700; color: #1C1917;">${formatPrice(taxValuation, receiptCurrency)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
            <span style="color: #78716C; font-weight: 600;">Express Logistics</span>
            <span style="font-weight: 700; color: ${shippingValuation > 0 ? '#1C1917' : '#047857'};">${shippingValuation > 0 ? formatPrice(shippingValuation, receiptCurrency) : 'COMPLIMENTARY'}</span>
          </div>
          ${discountValuation > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
            <span style="color: #047857; font-weight: 600;">Promotional Privilege</span>
            <span style="font-weight: 700; color: #047857;">-${formatPrice(discountValuation, receiptCurrency)}</span>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; margin-top: 16px; padding-top: 16px; border-top: 2px solid #E7E5E4; font-size: 20px; font-weight: 800;">
            <span style="color: #1C1917;">Total Valuation</span>
            <span style="color: #CA8A04;">${formatPrice(finalValuation, receiptCurrency)}</span>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 50px; color: #78716C; font-size: 12px; line-height: 1.6;">
          Thank you for acquiring from <span style="color: #1C1917; font-weight: 700;">${currentStore?.name || 'DIGITAL STORE'}</span>.<br/>
          For private concierge assistance, reach us at <span style="color: #1C1917; font-weight: 600;">${currentStore?.whatsappNumber || 'our atelier concierge'}</span>.
        </div>
      </div>
    `
    
    document.body.appendChild(container)
    
    try {
      const canvas = await html2canvas(container, {
        scale: 2,
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
      pdf.save(`Atelier_Invoice_${receiptRef}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      document.body.removeChild(container)
    }
  }

  const steps = [
    { id: 'cart', label: t('bag review', 'Bag Review'), icon: ShoppingCart },
    { id: 'details', label: t('client & destination', 'Client & Destination'), icon: MapPin },
    { id: 'payment', label: t('payment & finalization', 'Payment & Finalization'), icon: ShieldCheck }
  ]

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-gold-500 selection:text-white">
      <Header />
      
      <main className="section-container py-8 sm:py-12 md:py-16">
        {/* Editorial Top Title */}
        <div className="mb-8 sm:mb-12 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span className="font-jost text-[10px] sm:text-xs font-bold text-gold-600 uppercase tracking-[0.4em]">
              {t('Atelier Acquisition', 'إتمام الطلب الراقي')}
            </span>
          </div>
          <h1 className="font-bodoni text-3xl sm:text-4xl md:text-6xl font-bold uppercase tracking-tight">
            {t('Private Checkout', 'بوابة الشراء الخاصة')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          
          {/* Main Checkout Flow */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step Indicator */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 sm:pb-6 overflow-x-auto scrollbar-none gap-4">
              {steps.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-2 sm:gap-3 shrink-0 ${step === s.id ? 'text-stone-900' : 'text-stone-400'}`}>
                   <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                     step === s.id 
                       ? 'bg-stone-900 text-white shadow-md' 
                       : 'bg-white border border-stone-200 text-stone-400'
                   }`}>
                      <s.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-jost text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-stone-400">
                        {t('Step', 'المرحلة')} 0{i + 1}
                      </span>
                      <span className={`font-jost text-[10px] sm:text-xs font-bold uppercase tracking-wider ${step === s.id ? 'text-stone-900' : 'text-stone-400'}`}>
                        {s.label}
                      </span>
                   </div>
                </div>
              ))}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold font-jost">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* STEP 1: REVIEW BAG */}
              {step === 'cart' && (
                <motion.div key="cart" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6 sm:space-y-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="font-bodoni text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                        {t('Sartorial Selection', 'القطع المختارة')}
                      </h2>
                      <p className="font-jost text-xs text-stone-500 font-medium mt-1">
                        {t('Verify your garment sizes and quantities prior to destination dispatch.', 'تأكد من مقاسات وألوان القطع قبل تحديد عنوان الشحن.')}
                      </p>
                    </div>
                    <span className="font-jost text-[11px] font-bold text-stone-500 uppercase tracking-widest shrink-0">
                      {items.length} {t('Items Selected', 'قطع مختارة')}
                    </span>
                  </div>
                  
                  {/* Items List */}
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 sm:gap-6 p-3.5 sm:p-5 bg-white border border-stone-200 rounded-2xl sm:rounded-3xl shadow-sm">
                        <div className="w-14 h-18 sm:w-20 sm:h-24 bg-stone-50 rounded-xl overflow-hidden border border-stone-100 shrink-0">
                          <img 
                            src={item.product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&q=80'} 
                            alt={item.product.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="font-jost text-[9px] font-bold text-gold-600 uppercase tracking-widest block">
                            {t(item.product.category || 'Atelier Garment')}
                          </span>
                          <h3 className="font-bodoni text-base sm:text-lg font-bold text-stone-900 truncate uppercase">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap text-xs font-jost">
                            <span className="text-stone-500 font-medium">
                              {t('Qty', 'الكمية')}: {item.quantity}
                            </span>
                            {item.size && (
                              <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                {t('Size')}: {item.size}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bodoni text-base sm:text-lg font-bold text-stone-900">
                            {formatPrice(Number(item.product.discountPrice || item.product.price) * item.quantity, currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Promo Code Section */}
                  <div className="bg-white border border-stone-200 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm space-y-3">
                    <label className="font-jost text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gold-600" />
                      <span>{t('promo code', 'Privilege / Promotional Voucher')}</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                        placeholder={t('Enter Code (e.g. MAISON20)', 'أدخل الرمز (مثال: LUXURY20)')} 
                        disabled={!!appliedCoupon}
                        className="flex-1 px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl font-jost font-bold text-xs uppercase outline-none focus:border-stone-900 transition-all placeholder:text-stone-400" 
                      />
                      <button 
                        onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode('') } : handleApplyCoupon} 
                        disabled={isLoading || (!couponCode && !appliedCoupon)}
                        className={`px-6 py-3.5 rounded-xl font-jost font-bold text-xs uppercase tracking-widest transition-all ${
                          appliedCoupon 
                            ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100' 
                            : 'bg-stone-900 text-white hover:bg-stone-800 shadow-md'
                        }`}
                      >
                        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : appliedCoupon ? t('remove', 'Remove') : t('apply', 'Apply')}
                      </button>
                    </div>
                    {couponError && <p className="text-rose-600 text-xs font-jost font-bold">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-emerald-700 text-xs font-jost font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> 
                        {t('coupon applied', 'Voucher Applied')}: {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `${formatPrice(appliedCoupon.discountValue, currency)} OFF`}
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => setStep('details')} 
                    className="w-full py-4 bg-stone-900 text-white rounded-full font-jost font-bold text-xs uppercase tracking-[0.25em] shadow-xl hover:bg-gold-600 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t('proceed to destination', 'Proceed to Client & Destination')}</span>
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </motion.div>
              )}

              {/* STEP 2: CLIENT & DESTINATION DETAILS */}
              {step === 'details' && (
                <motion.div key="details" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6 sm:space-y-8">
                  <div className="space-y-1">
                    <h2 className="font-bodoni text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                      {t('client & destination', 'Client Identity & Shipping Destination')}
                    </h2>
                    <p className="font-jost text-xs text-stone-500 font-medium">
                      {t('Enter your contact and residency information for secure express delivery.', 'أدخل بياناتك وعنوان التسليم ليصلك مندوبنا الخاص.')}
                    </p>
                  </div>

                  <div className="bg-white border border-stone-200 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-500">
                          {t('full legal name', 'Full Legal Name')} *
                        </label>
                        <input 
                          type="text" 
                          required
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-jost font-medium text-xs text-stone-900 outline-none focus:border-stone-900 transition-all" 
                          placeholder="e.g. Lord Alexander Wright" 
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-500">
                          {t('contact email', 'Contact Email')} *
                        </label>
                        <input 
                          type="email" 
                          required
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-jost font-medium text-xs text-stone-900 outline-none focus:border-stone-900 transition-all" 
                          placeholder="alexander@domain.com" 
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-500">
                          {t('phone number', 'Phone Number')} *
                        </label>
                        <input 
                          type="tel" 
                          required
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-jost font-medium text-xs text-stone-900 outline-none focus:border-stone-900 transition-all" 
                          placeholder="+20 10 1234 5678" 
                        />
                      </div>
                    </div>

                    <div className="h-px bg-stone-100 my-4" />

                    <div className="space-y-4">
                      <LocationPicker
                        user={user}
                        currency={currency}
                        deliveryZones={deliveryZones}
                        selectedZone={selectedZone}
                        onSelectZone={(zone: any) => {
                          setSelectedZone(zone)
                          if (zone?.city) setCity(zone.city)
                        }}
                        address={address}
                        setAddress={setAddress}
                        apartment={apartment}
                        setApartment={setApartment}
                        coordinates={coordinates}
                        setCoordinates={setCoordinates}
                        t={t}
                      />

                      {/* Delivery Notes */}
                      <div className="space-y-1.5 pt-2">
                        <label className="font-jost text-[10px] font-bold uppercase tracking-widest text-stone-500">
                          {t('delivery notes (optional)', 'Courier Delivery Instructions (Optional)')}
                        </label>
                        <textarea 
                          rows={2}
                          value={deliveryNotes} 
                          onChange={e => setDeliveryNotes(e.target.value)} 
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-jost font-medium text-xs text-stone-900 outline-none focus:border-stone-900 transition-all resize-none" 
                          placeholder={t('e.g. Ring private bell, leave with concierge reception', 'مثال: التواصل هاتفياً قبل الوصول بربع ساعة')} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => setStep('cart')} 
                      className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-full font-jost font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                      <span>{t('review bag', 'Review Bag')}</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (!name || !email || !phone) {
                          setError(t('Please fill in all contact details.', 'يرجى استكمال بيانات التواصل كاملة.'))
                          return
                        }
                        if (!address) {
                          setError(t('Please specify your delivery address.', 'يرجى إدخال عنوان الشحن والتوصيل.'))
                          return
                        }
                        setError('')
                        setStep('payment')
                      }} 
                      className="flex-[2] py-4 bg-stone-900 text-white rounded-full font-jost font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-gold-600 transition-all flex items-center justify-center gap-2"
                    >
                      <span>{t('proceed to payment', 'Proceed to Secure Payment')}</span>
                      {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT & FINALIZATION */}
              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8">
                  <div className="space-y-1">
                    <h2 className="font-bodoni text-2xl sm:text-4xl font-bold uppercase tracking-tight">
                      {orderCreated ? t('Order Confirmation', 'تأكيد الطلب') : t('payment & finalization', 'Payment Selection & Authorization')}
                    </h2>
                    <p className="font-jost text-xs text-stone-500 font-medium">
                      {orderCreated 
                        ? t('Your bespoke order has been registered in our atelier vault.', 'تم تسجيل طلبك بنجاح في سجل المشغل.') 
                        : t('Select your preferred private payment gateway below.', 'اختر طريقة الدفع المناسبة لإتمام الحجز.')}
                    </p>
                  </div>

                  {!orderCreated ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentOptions.map(method => (
                          <div key={method.id} className="space-y-3">
                            <button 
                              onClick={() => setSelectedMethod(method.id as PaymentMethod)} 
                              className={`w-full p-5 sm:p-6 rounded-2xl sm:rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px] ${
                                selectedMethod === method.id 
                                  ? 'border-stone-900 bg-white shadow-xl ring-2 ring-gold-500/30' 
                                  : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start justify-between w-full">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  selectedMethod === method.id ? 'bg-stone-900 text-white shadow' : 'bg-stone-100 text-stone-600'
                                }`}>
                                  <method.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-[9px] font-jost font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                  selectedMethod === method.id 
                                    ? 'bg-gold-50 text-gold-700 border border-gold-300' 
                                    : 'bg-stone-100 text-stone-500'
                                }`}>
                                  {method.badge}
                                </span>
                              </div>

                              <div className="mt-4 space-y-1">
                                <h3 className="font-bodoni text-lg font-bold text-stone-900 uppercase">
                                  {method.name}
                                </h3>
                                <p className="font-jost text-[11px] text-stone-500 leading-relaxed font-medium">
                                  {method.description}
                                </p>
                              </div>
                            </button>
                            
                            {/* Special instructions for InstaPay or Mobile Wallets */}
                            <AnimatePresence>
                              {selectedMethod === method.id && (method.id === 'vodafone_cash' || method.id === 'instapay') && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }} 
                                  animate={{ opacity: 1, height: 'auto' }} 
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 sm:p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="font-jost text-[9px] font-bold uppercase tracking-widest text-gold-600">
                                        {t('transfer details', 'Official Wallet Number')}
                                      </span>
                                      <span className="text-[8px] font-jost font-bold text-stone-500 uppercase bg-white px-2 py-0.5 rounded border border-stone-200">
                                        {t('official business wallet', 'Verified')}
                                      </span>
                                    </div>
                                    <div 
                                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 cursor-pointer hover:border-gold-500 transition-colors" 
                                      onClick={() => {
                                        navigator.clipboard.writeText(currentStore?.whatsappNumber || '+201010574543')
                                        alert(t('number copied to clipboard!', 'Number copied to clipboard!'))
                                      }}
                                    >
                                      <span className="font-mono font-bold text-base text-stone-900">
                                        {currentStore?.whatsappNumber || '+20 10 1057 4543'}
                                      </span>
                                      <span className="font-jost text-[10px] font-bold uppercase text-gold-600 border-b border-gold-300">
                                        {t('copy number', 'Copy')}
                                      </span>
                                    </div>
                                    <p className="font-jost text-[10px] text-stone-500 leading-relaxed font-medium">
                                      {method.id === 'vodafone_cash' 
                                        ? t('Transfer total valuation to our official wallet and send the confirmation via WhatsApp.', 'قم بتحويل المبلغ الإجمالي إلى المحفظة وأرسل لقطة التأكيد عبر واتساب.') 
                                        : t('Transfer via InstaPay App to our phone number or IPA and submit.', 'قم بالتحويل عبر تطبيق إنستاباي إلى رقم الهاتف أو المعرف ثم أكد الطلب.')}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button 
                          onClick={() => setStep('details')} 
                          className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-full font-jost font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                          <span>{t('personal details', 'Client Details')}</span>
                        </button>
                        <button 
                          onClick={handleCreateOrder} 
                          disabled={isLoading} 
                          className="flex-[2] py-4 bg-stone-900 text-white rounded-full font-jost font-bold text-xs uppercase tracking-[0.25em] shadow-xl hover:bg-gold-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>{selectedMethod === 'card' ? t('authorize payment', 'Authorize Payment') : t('finalize order', 'Finalize Order & Place Acquisition')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Order Placed: Live Order Tracker */
                    <div className="space-y-8">
                      <OrderTracker
                        orderId={orderId}
                        onDownloadReceipt={currentStore?.enableReceipts !== false ? handleDownloadReceipt : undefined}
                        storeWhatsapp={currentStore?.whatsappNumber}
                        currency={currency}
                      />

                      {selectedMethod === 'card' && paymobIframeUrl && (
                        <div className="text-center pt-2">
                          <button
                            onClick={() => setShowPaymobModal(true)}
                            className="px-8 py-4 bg-gold-500 text-stone-950 font-jost font-bold text-xs uppercase tracking-[0.25em] rounded-full shadow-xl hover:bg-gold-400 transition-all"
                          >
                            {t('Open Paymob Payment Portal', 'فتح بوابة بايموب المصرحة')}
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Link
                          href={`/orders/${orderId}`}
                          className="py-4 px-6 bg-white border border-stone-200 text-stone-900 rounded-full font-jost font-bold text-xs uppercase tracking-wider hover:bg-stone-50 shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4 text-gold-600" />
                          <span>{t('Open Dedicated Tracking Page', 'فتح صفحة التتبع المستقلة')}</span>
                        </Link>

                        <button 
                          onClick={() => router.push('/')} 
                          className="py-4 px-6 bg-stone-900 text-white rounded-full font-jost font-bold text-xs uppercase tracking-wider hover:bg-stone-800 shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>{t('return to store', 'Return to Storefront')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm sticky top-24 space-y-6">
              <div className="space-y-1 pb-4 border-b border-stone-100">
                <h3 className="font-bodoni text-xl sm:text-2xl font-bold uppercase tracking-tight text-stone-900">
                  {t('order summary', 'Order Summary')}
                </h3>
                <div className="flex items-center gap-1.5 text-stone-500 font-jost">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gold-600">
                    {t('guaranteed secure', 'Atelier Guarantee')}
                  </span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 font-jost text-xs">
                <div className="flex justify-between items-center text-stone-600">
                  <span>{t('item subtotal', 'Garments Subtotal')}</span>
                  <span className="font-bold text-stone-900">{formatPrice(total, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-stone-600">
                  <span>{t('tax', 'Applicable Tax')} ({taxRate}%)</span>
                  <span className="font-bold text-stone-900">{formatPrice(tax, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-stone-600">
                  <span>{t('express courier', 'Express Courier')}</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {shipping === 0 ? t('free', 'COMPLIMENTARY') : formatPrice(shipping, currency)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" /> {appliedCoupon.code}
                    </span>
                    <span className="font-bold font-mono">-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-stone-100 flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      {t('total amount due', 'Total Valuation')}
                    </span>
                  </div>
                  <span className="font-bodoni text-2xl sm:text-3xl font-bold text-stone-900">
                    {formatPrice(grandTotal, currency)}
                  </span>
                </div>
              </div>

              {/* Luxury Guarantee Badges */}
              <div className="pt-2 border-t border-stone-100 space-y-2.5">
                <div className="flex items-start gap-2.5 text-stone-600 text-[10px] font-jost">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                  <span>{t('hand-inspected atelier quality', 'Hand-Inspected & Certified in Atelier')}</span>
                </div>
                <div className="flex items-start gap-2.5 text-stone-600 text-[10px] font-jost">
                  <Truck className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                  <span>{t('complimentary express courier', 'Complimentary Climate-Controlled Courier')}</span>
                </div>
                <div className="flex items-start gap-2.5 text-stone-600 text-[10px] font-jost">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                  <span>{t('official certificate of authenticity', 'Permanent Archival Registry Code')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />

      {/* Paymob Portal Modal */}
      <AnimatePresence>
        {showPaymobModal && paymobIframeUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 sm:p-8">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-[2.5rem] overflow-hidden relative shadow-2xl">
              <div className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} z-10`}>
                <button onClick={() => setShowPaymobModal(false)} className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
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
