import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from '@/lib/auth-context'
import { StoreProvider } from '@/lib/store-context'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { LanguageProvider } from '@/lib/language-context'
import CartToast from '@/components/ui/cart-toast'
import WishlistDrawer from '@/components/wishlist-drawer'
import MobileBottomNav from '@/components/mobile-bottom-nav'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'DigitalStore - Luxury Haute Couture & Tailoring',
  description: 'Quiet opulence, bespoke sartorial tailoring, and archived collections.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth bg-background" suppressHydrationWarning>
      <head />
      <body className="font-sans antialiased text-foreground" suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <StoreProvider>
              <CartProvider>
                <WishlistProvider>
                  <div suppressHydrationWarning id="app-root">
                    {children}
                  </div>
                  <CartToast />
                  <WishlistDrawer />
                  <MobileBottomNav />
                </WishlistProvider>
              </CartProvider>
            </StoreProvider>
          </AuthProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
