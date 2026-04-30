export type CurrencyCode = 'EGP' | 'USD' | 'SAR' | 'KWD' | 'EUR'

export const CURRENCIES: { code: CurrencyCode; name: string; symbol: string; locale: string }[] = [
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', locale: 'en-EG' },
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', locale: 'ar-SA' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', locale: 'ar-KW' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
]

export function formatPrice(price: number | string, currencyCode: string = 'USD') {
  const amount = Number(price)
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[1] // Default USD

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
    }).format(amount)
  } catch (e) {
    // Fallback if locale/currency combo fails
    return `${currency.symbol}${amount.toFixed(2)}`
  }
}
