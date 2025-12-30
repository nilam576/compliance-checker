import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from '@/components/ui/navbar'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { PerformanceMonitor } from '@/components/shared/performance-monitor'
import { 
  WebSiteStructuredData, 
  OrganizationStructuredData,
  WebApplicationStructuredData 
} from '@/components/shared/structured-data'
import { AnalyticsProvider } from '@/components/shared/analytics-provider'
import { cn } from '@/lib/utils'
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'SEBI Compliance Verification System',
    template: '%s | SEBI Compliance',
  },
  description: 'AI-powered legal document compliance verification against SEBI regulations',
  keywords: ['SEBI', 'compliance', 'legal', 'AI', 'document verification'],
  authors: [{ name: 'SEBI Compliance Team' }],
  creator: 'SEBI Compliance Team',
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',
    title: 'SEBI Compliance Verification System',
    description: 'AI-powered legal document compliance verification against SEBI regulations',
    siteName: 'SEBI Compliance',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEBI Compliance Verification System',
    description: 'AI-powered legal document compliance verification against SEBI regulations',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={cn('h-full antialiased', inter.variable)}
      suppressHydrationWarning
    >
      <head>
        <WebSiteStructuredData />
        <OrganizationStructuredData />
        <WebApplicationStructuredData />
      </head>
      <body className="h-full font-sans">
        <ErrorBoundary>
          <AuthProvider>
            <Providers>
              <AnalyticsProvider>
                <div className="relative flex min-h-full flex-col">
                <Suspense fallback={<div className="h-16 bg-background border-b" />}>
                  <Navbar />
                </Suspense>
                <main className="flex-1">
                  <Suspense fallback={
                    <div className="flex h-64 items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  }>
                    {children}
                  </Suspense>
                </main>
                </div>
                <PerformanceMonitor />
              </AnalyticsProvider>
            </Providers>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
