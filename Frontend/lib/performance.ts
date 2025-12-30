/**
 * Performance utilities for optimization
 */

import React from 'react'

// Import web-vitals types
import type { CLSMetric, FCPMetric, INPMetric, LCPMetric, TTFBMetric, MetricType } from 'web-vitals'

// Memory management utilities
export const memory = {
  /**
   * Get memory usage information
   */
  getUsage: () => {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      const memory = (window as any).performance.memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      }
    }
    return null
  },

  /**
   * Monitor memory leaks
   */
  monitor: (componentName: string) => {
    if (process.env.NODE_ENV === 'development') {
      const usage = memory.getUsage()
      if (usage && usage.used > 50) { // 50MB threshold
        console.warn(`Memory usage high in ${componentName}:`, usage)
      }
    }
  }
}

// Performance monitoring utilities
export const performance = {
  /**
   * Measure the time it takes to execute a function
   */
  measure: async <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
    const start = Date.now()
    const result = await Promise.resolve(fn())
    const end = Date.now()
    
    if (typeof window !== 'undefined' && window.console) {
      console.log(`⚡ Performance: ${name} - Duration: ${end - start}ms`)
    }
    
    return result
  },

  /**
   * Mark performance metrics
   */
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance?.mark) {
      window.performance.mark(name)
    }
  },

  /**
   * Measure performance between two marks
   */
  measureBetween: (name: string, startMark: string, endMark: string) => {
    if (typeof window !== 'undefined' && window.performance?.measure) {
      try {
        window.performance.measure(name, startMark, endMark)
        const measure = window.performance.getEntriesByName(name, 'measure')[0]
        return measure?.duration || 0
      } catch (error) {
        console.warn('Performance measurement failed:', error)
        return 0
      }
    }
    return 0
  },

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals: () => {
    if (typeof window === 'undefined') return null
    
    return new Promise<Record<string, number> | null>((resolve) => {
      import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
        const vitals: Record<string, number> = {}
        
        onCLS((metric: CLSMetric) => { vitals.CLS = metric.value })
        onFCP((metric: FCPMetric) => { vitals.FCP = metric.value })
        onINP((metric: INPMetric) => { vitals.INP = metric.value })
        onLCP((metric: LCPMetric) => { vitals.LCP = metric.value })
        onTTFB((metric: TTFBMetric) => { vitals.TTFB = metric.value })
        
        setTimeout(() => resolve(vitals), 1000)
      }).catch(() => resolve(null))
    })
  },

  /**
   * Report Core Web Vitals to analytics
   */
  reportWebVitals: (metric: MetricType) => {
    // In a real application, send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Core Web Vital:', metric)
    }
  },
  
  // Add memory property to fix type errors
  memory
}

// Image optimization utilities
export const images = {
  /**
   * Generate responsive image props
   */
  responsive: (src: string, alt: string, sizes?: string) => ({
    src,
    alt,
    sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    loading: 'lazy' as const,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyBYhyUZAWA='
  }),

  /**
   * Preload critical images
   */
  preload: (src: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    }
  }
}

// Bundle splitting utilities
export const bundle = {
  /**
   * Lazy load a component
   */
  lazy: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    return React.lazy(importFn)
  },

  /**
   * Preload a route/component
   */
  preload: (routeFn: () => Promise<any>) => {
    // Preload on interaction or after initial load
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        setTimeout(routeFn, 100)
      } else {
        window.addEventListener('load', () => setTimeout(routeFn, 100))
      }
    }
  }
}

// Network optimization
export const network = {
  /**
   * Check if user has slow connection
   */
  isSlowConnection: () => {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      const connection = (navigator as any).connection
      if (connection) {
        return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
      }
    }
    return false
  },

  /**
   * Preconnect to external domains
   */
  preconnect: (domains: string[]) => {
    if (typeof window !== 'undefined') {
      domains.forEach(domain => {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = domain
        document.head.appendChild(link)
      })
    }
  }
}

// Debounce and throttle utilities
export const optimize = {
  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  /**
   * Throttle function calls
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean = false
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  /**
   * Request idle callback polyfill
   */
  requestIdleCallback: (callback: () => void, options?: { timeout?: number }) => {
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      return window.requestIdleCallback(callback, options)
    } else {
      return setTimeout(callback, options?.timeout || 0)
    }
  }
}
