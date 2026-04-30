'use client'

import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import { useTranslations } from '@/lib/language-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/header'
import { motion } from 'framer-motion'
import { LogOut, Store, ShoppingBag, TrendingUp, Users, Globe, X, Camera, MapPin, Phone, User as UserIcon, Lock, Loader, Upload } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { api } from '@/lib/api'
import { AnimatePresence } from 'framer-motion'
import { useRef } from 'react'

import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const { user, logout, isLoading, refreshUser } = useAuth()
  const { currentStore } = useStore()
  const t = useTranslations()
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [orders, setOrders] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
    avatarUrl: user?.avatarUrl || '',
    password: '',
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        avatarUrl: user.avatarUrl || '',
        password: '',
      })
      
      api.orders.list(user.id)
        .then(data => {
          setOrders(data)
          setIsDataLoading(false)
        })
        .catch(err => {
          console.error('Failed to load orders:', err)
          setIsDataLoading(false)
        })
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const result = await api.upload.single(file, 'Pics')
      if (result.url) {
        setProfileData({ ...profileData, avatarUrl: result.url })
      }
    } catch (error) {
      console.error('Avatar upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      // 1. Update password via Supabase if provided
      if (profileData.password) {
        const { error } = await supabase.auth.updateUser({ password: profileData.password })
        if (error) throw error
      }

      // 2. Update other profile fields via our API
      const updatePayload: any = { ...profileData }
      delete updatePayload.password
      
      await api.auth.updateProfile(updatePayload)
      
      // 3. Wait for session to stabilize then refresh user
      setTimeout(async () => {
        await refreshUser()
        setShowProfileModal(false)
        setIsUpdating(false)
      }, 500)
    } catch (error: any) {
      console.error('Profile update failed:', error)
      alert(error.message || 'Failed to update profile. Please try again.')
      setIsUpdating(false)
    }
  }

  if (isLoading || isDataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-black tracking-widest uppercase text-xs">Synchronizing Account...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0)

  const stats = [
    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'text-primary' },
    { label: 'Total Spent', value: formatPrice(totalSpent, currentStore?.currency || 'USD'), icon: TrendingUp, color: 'text-green-500' },
    { label: 'Account Rank', value: user.role === 'admin' ? 'Master' : 'Customer', icon: UserIcon, color: 'text-accent' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />

      <div className="section-container py-12">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 md:mb-16 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 w-full sm:w-auto">
             <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] sm:rounded-[2.5rem] bg-secondary overflow-hidden border-4 border-primary/20 shadow-2xl">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/20 bg-primary/5">
                      <UserIcon className="w-12 h-12 sm:w-16 sm:h-16" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 sm:p-3 bg-primary text-white rounded-xl sm:rounded-2xl shadow-xl">
                  {user.role === 'admin' ? <Lock className="w-3 h-3 sm:w-4 sm:h-4" /> : <Globe className="w-3 h-3 sm:w-4 sm:h-4" />}
                </div>
             </div>
             <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
               <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
                 Welcome Back,<br />
                 <span className="text-primary italic">{user.name.split(' ')[0]}</span>
               </h1>
               <p className="text-sm sm:text-xl text-muted-foreground font-medium">Manage your digital assets and history.</p>
             </div>
          </div>
          <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowProfileModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 sm:px-8 py-4 bg-secondary font-black rounded-2xl hover:bg-secondary/80 transition-all shadow-xl text-xs sm:text-sm uppercase tracking-widest">
              <UserIcon className="w-4 h-4" />
              Settings
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 sm:px-8 py-4 bg-primary text-white font-black rounded-2xl hover:brightness-110 transition-all shadow-xl group text-xs sm:text-sm uppercase tracking-widest">
              <LogOut className="w-4 h-4" />
              Sign Out
            </motion.button>
          </div>
        </motion.div>

        {/* Profile Settings Modal */}
        <AnimatePresence>
          {showProfileModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white text-stone-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl relative border border-stone-100">
                <button onClick={() => setShowProfileModal(false)} className="absolute top-6 sm:top-8 right-6 sm:right-8 p-3 hover:bg-stone-50 rounded-full transition-colors"><X className="w-6 h-6 text-stone-400"/></button>
                <div className="mb-10">
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">Edit Profile</h3>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mt-1">Refine your identity</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6 sm:space-y-8">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6 sm:gap-8 p-5 sm:p-6 bg-stone-50 rounded-3xl border border-stone-100">
                    <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-stone-200 flex items-center justify-center relative">
                        {profileData.avatarUrl ? <img src={profileData.avatarUrl} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-stone-300" />}
                        {isUploading && <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center"><Loader className="w-6 h-6 animate-spin text-white" /></div>}
                      </div>
                      <div className="absolute -bottom-2 -right-2 p-2 bg-stone-900 text-white rounded-xl shadow-lg"><Upload className="w-4 h-4" /></div>
                    </div>
                    <div>
                      <p className="font-black text-base sm:text-lg">{t('dashboard.profilePhoto')}</p>
                      <p className="text-[10px] sm:text-sm text-stone-400 font-medium">{t('dashboard.updateDigitalRepresentation')}</p>
                      <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={handleAvatarUpload} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">{t('dashboard.fullName')}</label>
                      <input required value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-stone-900 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">{t('dashboard.phoneNumber')}</label>
                      <input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-stone-900 transition-colors" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">{t('dashboard.streetAddress')}</label>
                    <input value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-stone-900 transition-colors" placeholder="123 Luxury Ave" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{t('dashboard.city')}</label>
                      <input value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-stone-900 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{t('dashboard.country')}</label>
                      <input value={profileData.country} onChange={e => setProfileData({...profileData, country: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-stone-900 transition-colors" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-2">{t('dashboard.newPasswordOptional')}</label>
                      <input type="password" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-stone-900 transition-colors" placeholder="Leave empty to keep current" />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-4 bg-stone-100 font-black rounded-2xl text-[10px] uppercase tracking-widest">Cancel</button>
                    <button type="submit" disabled={isUpdating || isUploading} className="flex-[2] py-4 bg-stone-900 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest">
                      {(isUpdating || isUploading) && <Loader className="w-4 h-4 animate-spin" />}
                      {isUpdating ? t('admin.saving') : t('dashboard.updateProfile')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {stats.map((stat, idx) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
               <div className="flex items-center justify-between mb-4 sm:mb-6 relative">
                 <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</span>
                 <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-secondary ${stat.color} shadow-inner`}><stat.icon className="w-5 h-5 sm:w-6 sm:h-6" /></div>
               </div>
               <p className="text-3xl sm:text-4xl font-black relative">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Main Content: Orders */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card rounded-[2.5rem] sm:rounded-[3rem] border border-border p-6 sm:p-10 shadow-2xl overflow-hidden">
              <h2 className="text-2xl sm:text-3xl font-black mb-8 sm:mb-10 tracking-tight flex items-center gap-4"><ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-primary" /> Order History</h2>
              
              {/* Mobile Orders List */}
              <div className="md:hidden space-y-4">
                {orders.length === 0 ? (
                  <div className="py-12 text-center text-stone-400 font-bold italic text-sm">No orders yet.</div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-secondary/30 rounded-2xl p-5 border border-border space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black text-stone-400 tracking-widest uppercase">#{order.id.split('-')[0]}</div>
                          <div className="text-xs font-bold text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          order.orderStatus === 'approved' ? 'bg-green-500/10 text-green-500' :
                          order.orderStatus === 'declined' ? 'bg-red-500/10 text-red-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-end pt-2 border-t border-border/50">
                        <div className="text-lg font-black text-primary">{formatPrice(order.total, currentStore?.currency || 'USD')}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Orders Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black">
                    <tr>
                      <th className="py-6 px-4">{t('admin.orderId')}</th>
                      <th className="py-6 px-4">{t('admin.date')}</th>
                      <th className="py-6 px-4">{t('delivery.status')}</th>
                      <th className="py-6 px-4 text-right">{t('admin.total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors group">
                        <td className="py-8 px-4 font-black">
                           <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-primary" />
                             #{order.id.split('-')[0]}
                           </div>
                        </td>
                        <td className="py-8 px-4 text-muted-foreground font-medium">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                        <td className="py-8 px-4">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            order.orderStatus === 'approved' ? 'bg-green-500/10 text-green-500' :
                            order.orderStatus === 'declined' ? 'bg-red-500/10 text-red-500' :
                            'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-8 px-4 text-right font-black text-xl text-primary">{formatPrice(order.total, currentStore?.currency || 'USD')}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar: Profile & Support */}
          <div className="space-y-8">
            <div className="bg-card rounded-[2.5rem] border border-border p-10 shadow-2xl space-y-8">
              <h3 className="text-2xl font-black tracking-tight">{t('dashboard.accountDetails')}</h3>
              <div className="space-y-6">
                 <div className="p-6 bg-secondary/50 rounded-2xl border border-border group hover:border-primary/30 transition-colors">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('admin.emailAddress')}</p>
                   <p className="font-bold text-lg truncate">{user.email}</p>
                 </div>
                 <div className="p-6 bg-secondary/50 rounded-2xl border border-border group hover:border-primary/30 transition-colors">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2"><MapPin className="w-3 h-3" /> {t('dashboard.location')}</p>
                   <p className="font-bold text-lg capitalize">{user.city ? `${user.city}, ${user.country}` : 'Not set'}</p>
                 </div>
                 <div className="p-6 bg-secondary/50 rounded-2xl border border-border group hover:border-primary/30 transition-colors">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2"><Phone className="w-3 h-3" /> {t('dashboard.phone')}</p>
                   <p className="font-bold text-lg">{user.phone || 'Not set'}</p>
                 </div>
              </div>
              <button onClick={() => setShowProfileModal(true)} className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg hover:brightness-110 transition-all">{t('dashboard.editProfile')}</button>
            </div>

            <div className="bg-primary/10 rounded-[2.5rem] p-10 border border-primary/20 space-y-6 relative overflow-hidden group">
               <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-primary/10 -rotate-12 transition-transform group-hover:scale-110" />
               <h3 className="text-2xl font-black tracking-tight text-primary relative">{t('dashboard.premiumSupport')}</h3>
               <p className="text-primary/70 font-medium relative">{t('dashboard.needHelpAssets')}</p>
               <button onClick={() => window.open(`https://wa.me/${currentStore?.whatsappNumber}`, '_blank')} className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg relative">{t('dashboard.contactSupport')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
