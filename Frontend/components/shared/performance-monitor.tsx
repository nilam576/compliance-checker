'use client'

import { useEffect, useState } from 'react'
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'
import { performance } from '@/lib/performance'

interface WebVitalsData {
  CLS?: number
  INP?: number
  FCP?: number
  LCP?: number
  TTFB?: number
}

export function PerformanceMonitor() {
  const [vitals, setVitals] = useState<WebVitalsData>({})
  const [isDev, setIsDev] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setIsDev(process.env.NODE_ENV === 'development')
  }, [])

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return

    // Collect Core Web Vitals
    const updateVital = (metric: any) => {
      setVitals(prev => ({
        ...prev,
        [metric.name]: metric.value
      }))
      
      // Report to analytics in production
      performance.reportWebVitals(metric)
    }

    onCLS(updateVital)
    onINP(updateVital)
    onFCP(updateVital)
    onLCP(updateVital)
    onTTFB(updateVital)

    // Monitor memory usage in development
    if (isDev) {
      const interval = setInterval(() => {
        // Check browser memory API (Chrome only)
        if ('memory' in performance) {
          const memory = (performance as any).memory
          if (memory) {
            const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
            const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024)
            const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
            
            // Alert only if memory usage is above 200MB (more reasonable threshold)
            if (usedMB > 200) {
              console.warn('High memory usage detected:', {
                used: usedMB,
                total: totalMB,
                limit: limitMB
              })
            }
          }
        }
      }, 60000) // Check every 60 seconds

      return () => clearInterval(interval)
    }
    
    // Return undefined explicitly to satisfy TypeScript
    return undefined
  }, [isDev, isClient])

  // Only show in development - but always render the component
  if (!isDev || !isClient || typeof window === 'undefined') {
    return <div style={{ display: 'none' }} />
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
      <div className="font-bold mb-2">Performance Metrics</div>
      <div className="space-y-1">
        {vitals.FCP && (
          <div>
            FCP: <span className={vitals.FCP > 2500 ? 'text-red-400' : vitals.FCP > 1800 ? 'text-yellow-400' : 'text-green-400'}>
              {Math.round(vitals.FCP)}ms
            </span>
          </div>
        )}
        {vitals.LCP && (
          <div>
            LCP: <span className={vitals.LCP > 4000 ? 'text-red-400' : vitals.LCP > 2500 ? 'text-yellow-400' : 'text-green-400'}>
              {Math.round(vitals.LCP)}ms
            </span>
          </div>
        )}
        {vitals.INP && (
          <div>
            INP: <span className={vitals.INP > 500 ? 'text-red-400' : vitals.INP > 200 ? 'text-yellow-400' : 'text-green-400'}>
              {Math.round(vitals.INP)}ms
            </span>
          </div>
        )}
        {vitals.CLS && (
          <div>
            CLS: <span className={vitals.CLS > 0.25 ? 'text-red-400' : vitals.CLS > 0.1 ? 'text-yellow-400' : 'text-green-400'}>
              {vitals.CLS.toFixed(3)}
            </span>
          </div>
        )}
        {vitals.TTFB && (
          <div>
            TTFB: <span className={vitals.TTFB > 800 ? 'text-red-400' : vitals.TTFB > 300 ? 'text-yellow-400' : 'text-green-400'}>
              {Math.round(vitals.TTFB)}ms
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook to use performance monitoring in components
export function usePerformanceMonitor(componentName: string) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    // Mark component mount
    performance.mark(`${componentName}-mount-start`)
    
    return () => {
      // Mark component unmount and measure
      performance.mark(`${componentName}-mount-end`)
      const duration = performance.measureBetween(
        `${componentName}-mount-duration`,
        `${componentName}-mount-start`,
        `${componentName}-mount-end`
      )
      
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`Component ${componentName} took ${Math.round(duration)}ms to mount`)
      }
    }
  }, [componentName, isClient])
}

// Component wrapper for performance monitoring
export function withPerformanceMonitoring<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  const name = componentName || Component.displayName || Component.name || 'Anonymous'
  
  return function PerformanceWrappedComponent(props: T) {
    usePerformanceMonitor(name)
    return <Component {...props} />
  }
}
