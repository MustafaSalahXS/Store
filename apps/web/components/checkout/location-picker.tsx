'use client'

import React, { useState, useEffect } from 'react'
import {
  MapPin,
  Navigation,
  Clock,
  Compass,
  Check,
  Building,
  Loader,
  ChevronDown,
  X,
  Bookmark
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/currency'

interface LocationPickerProps {
  user: any
  currency: string
  deliveryZones: any[]
  selectedZone: any
  onSelectZone: (zone: any) => void
  address: string
  setAddress: (addr: string) => void
  apartment: string
  setApartment: (apt: string) => void
  coordinates: { lat: number | null; lng: number | null }
  setCoordinates: (coords: { lat: number | null; lng: number | null }) => void
  t: (key: string, fallback?: string) => string
}

export default function LocationPicker({
  user,
  currency,
  deliveryZones,
  selectedZone,
  onSelectZone,
  address,
  setAddress,
  apartment,
  setApartment,
  coordinates,
  setCoordinates,
  t
}: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [showMapModal, setShowMapModal] = useState(false)
  const [pastAddresses, setPastAddresses] = useState<any[]>([])
  const [isLoadingPast, setIsLoadingPast] = useState(false)
  const [saveAddressChecked, setSaveAddressChecked] = useState(false)
  const [addressTitle, setAddressTitle] = useState('Home')

  // Load past addresses for logged-in user
  useEffect(() => {
    if (user?.id) {
      setIsLoadingPast(true)
      api.addresses.list(user.id)
        .then(res => setPastAddresses(res || []))
        .catch(err => console.warn('Could not load past addresses:', err))
        .finally(() => setIsLoadingPast(false))
    }
  }, [user?.id])

  // Automatic nearest delivery zone matcher
  const matchNearestZone = (cityName?: string, addressText?: string) => {
    if (!deliveryZones || deliveryZones.length === 0) return

    const fullText = `${cityName || ''} ${addressText || ''}`.toLowerCase()

    // Find zone whose english or arabic name appears in the address text
    let matched = deliveryZones.find(z => {
      const en = (z.nameEn || '').toLowerCase()
      const ar = (z.nameAr || '').toLowerCase()
      const city = (z.city || '').toLowerCase()
      return (
        (en && fullText.includes(en)) ||
        (ar && fullText.includes(ar)) ||
        (city && fullText.includes(city))
      )
    })

    // If nothing matched, default to Cairo/Giza or first active zone
    if (!matched) {
      matched = deliveryZones.find(z => (z.city || '').toLowerCase().includes('cairo')) || deliveryZones[0]
    }

    if (matched) {
      onSelectZone(matched)
    }
  }

  // "Use My Location" GPS Handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(t('checkout.geoNotSupported', 'Geolocation is not supported by your browser.'))
      return
    }

    setIsLocating(true)
    setGeoError('')

    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords
        setCoordinates({ lat: latitude, lng: longitude })

        try {
          // Reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar,en`
          )
          const data = await res.json()

          if (data && data.display_name) {
            const formatted = data.display_name
            const detectedCity = data.address?.city || data.address?.state || data.address?.county || ''
            setAddress(formatted)
            matchNearestZone(detectedCity, formatted)
          } else {
            setAddress(`GPS Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
            matchNearestZone()
          }
        } catch (fetchErr) {
          console.warn('Reverse geocoding failed, using coordinates:', fetchErr)
          setAddress(`GPS Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
          matchNearestZone()
        } finally {
          setIsLocating(false)
        }
      },
      error => {
        setIsLocating(false)
        console.error('Geolocation error:', error)
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError(t('checkout.geoDenied', 'Location permission denied. Please enter address manually.'))
        } else {
          setGeoError(t('checkout.geoError', 'Unable to retrieve your location. Please select on map or enter manually.'))
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Select a past saved address
  const handleSelectPastAddress = (past: any) => {
    setAddress(past.address)
    if (past.apartment) setApartment(past.apartment)
    if (past.latitude && past.longitude) {
      setCoordinates({ lat: past.latitude, lng: past.longitude })
    }
    matchNearestZone(past.city, past.address)
  }

  // Pre-set map Egyptian hubs
  const MAP_PRESETS = [
    { name: 'New Cairo & Tagamoa (التجمع الخامس)', lat: 30.0074, lng: 31.4913, zoneCity: 'Cairo' },
    { name: 'Zamalek & Downtown (الزمالك ووسط البلد)', lat: 30.0617, lng: 31.2197, zoneCity: 'Cairo' },
    { name: 'Sheikh Zayed & 6th October (الشيخ زايد و 6 أكتوبر)', lat: 30.0468, lng: 30.9845, zoneCity: 'Giza' },
    { name: 'Maadi & Kattameya (المعادي والقطامية)', lat: 29.9602, lng: 31.2569, zoneCity: 'Cairo' },
    { name: 'Alexandria Corniche & Smouha (الإسكندرية سموحة)', lat: 31.2001, lng: 29.9187, zoneCity: 'Alexandria' },
    { name: 'Mansoura & Delta (المنصورة والدلتا)', lat: 31.0409, lng: 31.3785, zoneCity: 'Delta' },
    { name: 'Port Said (بور سعيد)', lat: 31.2653, lng: 32.3019, zoneCity: 'Canal' },
    { name: 'Hurghada / El Gouna (الغردقة والجونة)', lat: 27.2579, lng: 33.8116, zoneCity: 'Red Sea' }
  ]

  const handleSelectMapPreset = (preset: any) => {
    setCoordinates({ lat: preset.lat, lng: preset.lng })
    setAddress(`${preset.name}`)
    matchNearestZone(preset.zoneCity, preset.name)
    setShowMapModal(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {t('checkout.deliveryLocation', 'Delivery Address & Location')} *
        </label>

        {/* GPS & Map Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
          >
            {isLocating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            <span>{isLocating ? 'Locating...' : 'My Location'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Map Pin</span>
          </button>
        </div>
      </div>

      {geoError && (
        <p className="text-xs text-rose-500 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
          {geoError}
        </p>
      )}

      {/* Past / Saved Locations for Authenticated Users */}
      {pastAddresses.length > 0 && (
        <div className="space-y-1.5 bg-stone-50/80 p-3 rounded-2xl border border-stone-200/60">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
            {t('checkout.pastLocations', 'Your Saved Locations (Tap to Select)')}
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {pastAddresses.map(past => (
              <button
                key={past.id}
                type="button"
                onClick={() => handleSelectPastAddress(past)}
                className="px-3 py-1.5 bg-white border border-stone-200 hover:border-primary text-stone-800 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all text-left"
              >
                <Bookmark className="w-3 h-3 text-primary shrink-0" />
                <span className="font-bold text-stone-900">{past.title}:</span>
                <span className="truncate max-w-[180px]">{past.address}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Zone Selector Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">
          {t('checkout.selectDeliveryZone', 'Delivery Governorate / Area')} *
        </label>
        <select
          value={selectedZone?.id || ''}
          onChange={e => {
            const found = deliveryZones.find(z => z.id === e.target.value)
            if (found) onSelectZone(found)
          }}
          className="w-full p-3.5 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-900 outline-none focus:border-primary shadow-sm"
        >
          {deliveryZones.map(z => (
            <option key={z.id} value={z.id}>
              {z.nameAr} - {z.nameEn} ({formatPrice(z.deliveryFee, currency)} delivery • {z.estimatedDays})
            </option>
          ))}
        </select>
      </div>

      {/* Street Address Input */}
      <div className="space-y-1.5">
        <input
          required
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder={t('checkout.addressPlaceholder', 'Building number, street name, district / neighborhood...')}
          className="w-full p-3.5 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-900 outline-none focus:border-primary shadow-sm"
        />
      </div>

      {/* Apartment / Suite Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={apartment}
          onChange={e => setApartment(e.target.value)}
          placeholder={t('checkout.apartmentPlaceholder', 'Apt / Floor / Landmark (optional)')}
          className="w-full p-3.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-primary shadow-sm"
        />

        {/* Selected Zone Rate Display */}
        {selectedZone && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs font-bold text-stone-700">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {selectedZone.estimatedDays}
            </span>
            <span className="font-mono text-primary font-black">
              Fee: {formatPrice(selectedZone.deliveryFee, currency)}
            </span>
          </div>
        )}
      </div>

      {/* Map Pin Selector Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-100">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black text-stone-900">Select Delivery District / Hub</h3>
              </div>
              <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Tap any major delivery hub to pinpoint your order location and auto-calculate shipping:
            </p>

            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {MAP_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectMapPreset(preset)}
                  className="p-3 rounded-xl border border-stone-200 hover:border-primary hover:bg-stone-50 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-stone-400 group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold text-stone-900">{preset.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-black text-primary font-mono">Select</span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-5 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
