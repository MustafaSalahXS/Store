'use client'

import Header from '@/components/header'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SuccessPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate download preparation
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <Header />

      <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="section-container max-w-2xl">
          <div className="text-center space-y-8 animate-fade-in">
            {isLoading ? (
              <>
                <div className="text-6xl mb-8">⏳</div>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground">
                  Preparing Your Template...
                </h1>
                <div className="flex justify-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </>
            ) : (
              <>
                <div className="text-7xl">✨</div>
                <div className="space-y-4">
                  <h1 className="font-serif text-4xl md:text-5xl text-foreground">
                    Thank You!
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Your purchase was successful. Your template is ready to download.
                  </p>
                </div>

                <div className="bg-card border-2 border-primary/30 rounded-lg p-8 text-left space-y-4">
                  <h2 className="font-serif text-2xl text-foreground mb-6">What&apos;s Next?</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Download Your Files</h3>
                        <p className="text-muted-foreground text-sm">
                          Click below to download your complete template package
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Review Setup Guide</h3>
                        <p className="text-muted-foreground text-sm">
                          Included video tutorial shows how to customize your template in minutes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Customize & Print</h3>
                        <p className="text-muted-foreground text-sm">
                          Edit colors, fonts, and content. Print or save as digital
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Share with Your Team</h3>
                        <p className="text-muted-foreground text-sm">
                          Collaborate with your partner, family, or vendors on the template
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="btn-primary text-lg">
                  Download Now
                </button>

                <div className="space-y-4 bg-secondary/20 rounded-lg p-6">
                  <h3 className="font-semibold text-foreground">💌 Check Your Email</h3>
                  <p className="text-muted-foreground text-sm">
                    A download link and setup guide have been sent to your email. Check your spam folder if you don't see it.
                  </p>
                </div>

                <div className="space-y-4 pt-8 border-t border-border">
                  <h3 className="font-serif text-2xl text-foreground mb-4">Need Help?</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <a href="#" className="block bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors text-left">
                      <h4 className="font-semibold text-foreground mb-1">Setup Tutorial</h4>
                      <p className="text-sm text-muted-foreground">Watch our step-by-step video guide</p>
                    </a>
                    <a href="#" className="block bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors text-left">
                      <h4 className="font-semibold text-foreground mb-1">Contact Support</h4>
                      <p className="text-sm text-muted-foreground">Our team is ready to help you</p>
                    </a>
                  </div>
                </div>

                <Link href="/" className="inline-block btn-secondary text-lg">
                  ← Back to Collections
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
