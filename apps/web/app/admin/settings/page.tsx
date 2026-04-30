'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import { getStore, updateStore, Store } from '@/lib/admin'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { Loader2, AlertCircle, CheckCircle, Upload, Image as ImageIcon, X } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentStore } = useStore()

  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    logo_url: '',
    favicon_url: '',
    enable_receipts: true
  })

  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  useEffect(() => {
    if (!user || !['super_admin', 'store_admin'].includes(user.role)) {
      router.push('/dashboard')
      return
    }

    if (currentStore) loadStore()
  }, [user, currentStore, router])

  const loadStore = async () => {
    try {
      setLoading(true)
      if (!currentStore) return
      const data = await getStore(currentStore.id)
      if (data) {
        setStore(data)
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          currency: data.currency,
          language: data.language,
          timezone: data.timezone,
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          postal_code: data.postal_code || '',
          logo_url: data.logo_url || '',
          favicon_url: data.favicon_url || '',
          enable_receipts: data.enable_receipts ?? true
        })
      }
    } catch (err) {
      setError('Failed to load store settings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentStore) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const success = await updateStore(currentStore.id, formData)
      if (success) {
        setSuccess('Settings updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
        loadStore()
      } else {
        setError('Failed to save settings')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      if (type === 'logo') setUploadingLogo(true)
      else setUploadingFavicon(true)

      const bucket = type === 'logo' ? 'Logos' : 'FavIcon'
      const { url } = await api.upload.single(file, bucket)

      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'favicon_url']: url
      }))
    } catch (err) {
      setError(`Failed to upload ${type}`)
      console.error(err)
    } finally {
      if (type === 'logo') setUploadingLogo(false)
      else setUploadingFavicon(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>
            <p className="text-slate-600">Configure your store information</p>
          </div>
          <Link href="/admin">
            <Button>Back to Admin</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Alerts */}
        {error && (
          <Card className="mb-4 p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {success && (
          <Card className="mb-4 p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <p>{success}</p>
            </div>
          </Card>
        )}

        {/* Settings Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Store Name</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Store Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Store Slug</label>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="store-slug"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Store description"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="store@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Phone</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+20 100 000 0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Address</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">City</label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Country</label>
                    <Input
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Postal Code</label>
                    <Input
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Branding</h2>

              <div className="grid grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Store Logo</label>
                  <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    {formData.logo_url ? (
                      <div className="relative group w-full aspect-square max-w-[150px]">
                        <img 
                          src={formData.logo_url} 
                          alt="Logo" 
                          className="w-full h-full object-contain rounded-lg bg-white p-2 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                          className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    
                    <div className="w-full">
                      <input
                        type="file"
                        id="logo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                        disabled={uploadingLogo}
                      />
                      <label 
                        htmlFor="logo-upload"
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploadingLogo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Favicon</label>
                  <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    {formData.favicon_url ? (
                      <div className="relative group">
                        <img 
                          src={formData.favicon_url} 
                          alt="Favicon" 
                          className="w-12 h-12 object-contain rounded bg-white p-1 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, favicon_url: '' }))}
                          className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    
                    <div className="w-full">
                      <input
                        type="file"
                        id="favicon-upload"
                        className="hidden"
                        accept="image/x-icon,image/png,image/svg+xml"
                        onChange={(e) => handleFileUpload(e, 'favicon')}
                        disabled={uploadingFavicon}
                      />
                      <label 
                        htmlFor="favicon-upload"
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition ${uploadingFavicon ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploadingFavicon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}
                      </label>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 text-center">Suggested: 32x32px .ico or .png</p>
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Regional & Preferences</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="EGP">EGP (£)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Timezone</label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-900">Enable Order Receipts</p>
                    <p className="text-xs text-slate-600">Allow customers to download PDF receipts after purchase.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, enable_receipts: !prev.enable_receipts }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.enable_receipts ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.enable_receipts ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-slate-200 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 mt-8 border-red-200 bg-red-50">
          <h2 className="text-lg font-bold text-red-900 mb-4">Danger Zone</h2>
          <p className="text-red-800 mb-4">Permanently delete this store and all associated data.</p>
          <Button
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Delete Store
          </Button>
        </Card>
      </div>
    </div>
  )
}
