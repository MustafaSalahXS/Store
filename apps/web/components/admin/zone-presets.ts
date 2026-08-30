export interface ZonePreset {
  id: string
  nameEn: string
  nameAr: string
  city: string
  deliveryFee: number
  taxRate: number
  estimatedDays: string
}

export const EGYPT_ZONE_PRESETS: ZonePreset[] = [
  // Top Requested Cities & Governorates
  { id: 'qena', nameEn: 'Qena', nameAr: 'قنا', city: 'Qena', deliveryFee: 85, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'sohag', nameEn: 'Sohag', nameAr: 'سوهاج', city: 'Sohag', deliveryFee: 85, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'luxor', nameEn: 'Luxor', nameAr: 'الأقصر', city: 'Luxor', deliveryFee: 90, taxRate: 14, estimatedDays: '2-4 Days' },
  { id: 'hurghada', nameEn: 'Hurghada', nameAr: 'الغردقة', city: 'Hurghada', deliveryFee: 95, taxRate: 14, estimatedDays: '2-3 Days' },

  // Metropolitan & Major Hubs
  { id: 'cairo', nameEn: 'Greater Cairo', nameAr: 'القاهرة الكبرى', city: 'Cairo', deliveryFee: 50, taxRate: 14, estimatedDays: '1-2 Days' },
  { id: 'giza', nameEn: 'Giza & 6th October', nameAr: 'الجيزة و 6 أكتوبر', city: 'Giza', deliveryFee: 50, taxRate: 14, estimatedDays: '1-2 Days' },
  { id: 'alexandria', nameEn: 'Alexandria', nameAr: 'الإسكندرية', city: 'Alexandria', deliveryFee: 65, taxRate: 14, estimatedDays: '2-3 Days' },

  // Upper Egypt (الصعيد)
  { id: 'aswan', nameEn: 'Aswan', nameAr: 'أسوان', city: 'Aswan', deliveryFee: 100, taxRate: 14, estimatedDays: '3-4 Days' },
  { id: 'asyut', nameEn: 'Asyut', nameAr: 'أسيوط', city: 'Asyut', deliveryFee: 80, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'minya', nameEn: 'Minya', nameAr: 'المنيا', city: 'Minya', deliveryFee: 75, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'beni_suef', nameEn: 'Beni Suef', nameAr: 'بني سويف', city: 'Beni Suef', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'fayoum', nameEn: 'Fayoum', nameAr: 'الفيوم', city: 'Fayoum', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'new_valley', nameEn: 'New Valley & Kharga', nameAr: 'الوادي الجديد والخارجة', city: 'Kharga', deliveryFee: 120, taxRate: 14, estimatedDays: '3-5 Days' },

  // Delta & Lower Egypt (وجه بحري والدلتا)
  { id: 'mansoura', nameEn: 'Mansoura & Dakahlia', nameAr: 'المنصورة والدقهلية', city: 'Mansoura', deliveryFee: 65, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'tanta', nameEn: 'Tanta & Gharbia', nameAr: 'طنطا والغربية', city: 'Tanta', deliveryFee: 65, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'zagazig', nameEn: 'Zagazig & Sharqia', nameAr: 'الزقازيق والشرقية', city: 'Zagazig', deliveryFee: 65, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'qalyubia', nameEn: 'Qalyubia & Banha', nameAr: 'القليوبية وبنها', city: 'Banha', deliveryFee: 60, taxRate: 14, estimatedDays: '1-2 Days' },
  { id: 'monufia', nameEn: 'Monufia', nameAr: 'المنوفية', city: 'Shibin El Kom', deliveryFee: 65, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'beheira', nameEn: 'Beheira & Damanhur', nameAr: 'البحيرة ودمنهور', city: 'Damanhur', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'kafr_el_sheikh', nameEn: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', city: 'Kafr El Sheikh', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'damietta', nameEn: 'Damietta', nameAr: 'دمياط', city: 'Damietta', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },

  // Canal Cities (مدن القناة)
  { id: 'port_said', nameEn: 'Port Said', nameAr: 'بورسعيد', city: 'Port Said', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'ismailia', nameEn: 'Ismailia', nameAr: 'الإسماعيلية', city: 'Ismailia', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },
  { id: 'suez', nameEn: 'Suez', nameAr: 'السويس', city: 'Suez', deliveryFee: 70, taxRate: 14, estimatedDays: '2-3 Days' },

  // Coastal & Border Governorates
  { id: 'red_sea', nameEn: 'Red Sea (Safaga, El Gouna)', nameAr: 'البحر الأحمر (سفاجا، الجونة)', city: 'Red Sea', deliveryFee: 100, taxRate: 14, estimatedDays: '3-4 Days' },
  { id: 'sharm', nameEn: 'Sharm El Sheikh & South Sinai', nameAr: 'شرم الشيخ وجنوب سيناء', city: 'Sharm El Sheikh', deliveryFee: 110, taxRate: 14, estimatedDays: '3-4 Days' },
  { id: 'matrouh', nameEn: 'Marsa Matrouh & North Coast', nameAr: 'مرسى مطروح والساحل الشمالي', city: 'Matrouh', deliveryFee: 100, taxRate: 14, estimatedDays: '3-4 Days' },
  { id: 'arish', nameEn: 'North Sinai & Arish', nameAr: 'شمال سيناء والعريش', city: 'Arish', deliveryFee: 120, taxRate: 14, estimatedDays: '3-5 Days' }
]
