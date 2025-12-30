'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { analytics, trackPage } from '@/lib/analytics'
import { performanceMonitor } from '@/lib/monitoring'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    // Initialize performance monitoring
    performanceMonitor.trackPageLoad()
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    // Track page views
    trackPage(pathname)
  }, [pathname, isClient])

  useEffect(() => {
    if (!isClient) return
    
    // Track user engagement
    const handleVisibilityChange = () => {
      if (document.hidden) {
        analytics.track('page_blur')
      } else {
        analytics.track('page_focus')
      }
    }

    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      )
      
      if (scrollPercentage > 0 && scrollPercentage % 25 === 0) {
        analytics.track('scroll_depth', { percentage: scrollPercentage })
      }
    }

    let scrollTimeout: NodeJS.Timeout
    const throttledScroll = () => {
      if (scrollTimeout) return
      scrollTimeout = setTimeout(() => {
        handleScroll()
        scrollTimeout = null as any
      }, 1000)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('scroll', throttledScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [isClient])

  // Only render children after client-side initialization to prevent hydration errors
  if (!isClient) {
    return null
  }

  return <>{children}</>
}
