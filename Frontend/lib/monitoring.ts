/**
 * Application monitoring and health checks
 */

import { performance } from './performance'
import { useState, useEffect } from 'react'

// Health check configuration
const healthConfig = {
  checkInterval: 30000, // 30 seconds
  timeout: 5000, // 5 seconds
  criticalThresholds: {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    memoryUsage: 100, // 100MB
  }
}

// Health status types
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthCheck {
  name: string
  status: HealthStatus
  responseTime?: number
  error?: string
  timestamp: number
  details?: Record<string, any>
}

export interface SystemHealth {
  overall: HealthStatus
  checks: HealthCheck[]
  timestamp: number
  uptime: number
}

class MonitoringService {
  private healthChecks: Map<string, () => Promise<HealthCheck>> = new Map()
  private healthHistory: SystemHealth[] = []
  private startTime: number = Date.now()
  private checkTimer: NodeJS.Timeout | null = null
  private isRunning = false

  constructor() {
    this.setupDefaultHealthChecks()
    
    if (typeof window !== 'undefined') {
      this.start()
    }
  }

  private setupDefaultHealthChecks() {
    // Memory health check
    this.addHealthCheck('memory', async () => {
      // Check if memory monitoring is available
      if (!performance.memory || typeof performance.memory.getUsage !== 'function') {
        return {
          name: 'memory',
          status: 'healthy' as HealthStatus,
          timestamp: Date.now(),
          details: { message: 'Memory monitoring not available' }
        }
      }
      
      const memoryInfo = performance.memory.getUsage()
      
      if (!memoryInfo) {
        return {
          name: 'memory',
          status: 'healthy' as HealthStatus,
          timestamp: Date.now(),
          details: { message: 'Memory monitoring not available' }
        }
      }
      
      const status: HealthStatus = 
        memoryInfo.used > healthConfig.criticalThresholds.memoryUsage ? 'degraded' : 'healthy'
      
      return {
        name: 'memory',
        status,
        timestamp: Date.now(),
        details: memoryInfo
      }
    })

    // Local storage health check
    this.addHealthCheck('storage', async () => {
      try {
        const testKey = 'health_check_test'
        const testValue = 'test'
        
        localStorage.setItem(testKey, testValue)
        const retrieved = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)
        
        const status: HealthStatus = retrieved === testValue ? 'healthy' : 'unhealthy'
        
        return {
          name: 'storage',
          status,
          timestamp: Date.now()
        }
      } catch (error) {
        return {
          name: 'storage',
          status: 'unhealthy' as HealthStatus,
          error: error instanceof Error ? error.message : 'Storage unavailable',
          timestamp: Date.now()
        }
      }
    })

    // Network connectivity check
    this.addHealthCheck('network', async () => {
      const isOnline = typeof navigator !== 'undefined' && navigator.onLine
      
      return {
        name: 'network',
        status: isOnline ? 'healthy' as HealthStatus : 'unhealthy' as HealthStatus,
        timestamp: Date.now(),
        details: {
          online: isOnline,
          connectionType: (navigator as any)?.connection?.effectiveType || 'unknown'
        }
      }
    })
  }

  addHealthCheck(name: string, checkFn: () => Promise<HealthCheck>) {
    this.healthChecks.set(name, checkFn)
  }

  removeHealthCheck(name: string) {
    this.healthChecks.delete(name)
  }

  async runHealthCheck(name: string): Promise<HealthCheck | null> {
    const checkFn = this.healthChecks.get(name)
    if (!checkFn) return null

    try {
      return await checkFn()
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: Date.now()
      }
    }
  }

  async runAllHealthChecks(): Promise<SystemHealth> {
    const checks = await Promise.all(
      Array.from(this.healthChecks.keys()).map(name => this.runHealthCheck(name))
    )

    const validChecks = checks.filter((check): check is HealthCheck => check !== null)
    
    // Determine overall health
    const unhealthyCount = validChecks.filter(check => check.status === 'unhealthy').length
    const degradedCount = validChecks.filter(check => check.status === 'degraded').length
    
    let overall: HealthStatus = 'healthy'
    if (unhealthyCount > 0) {
      overall = 'unhealthy'
    } else if (degradedCount > 0) {
      overall = 'degraded'
    }

    const systemHealth: SystemHealth = {
      overall,
      checks: validChecks,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime
    }

    this.healthHistory.push(systemHealth)
    
    // Keep only last 100 health checks
    if (this.healthHistory.length > 100) {
      this.healthHistory.splice(0, this.healthHistory.length - 100)
    }

    return systemHealth
  }

  start() {
    if (this.isRunning) return

    this.isRunning = true
    this.checkTimer = setInterval(async () => {
      await this.runAllHealthChecks()
    }, healthConfig.checkInterval)

    // Run initial health check
    this.runAllHealthChecks()
  }

  stop() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
      this.checkTimer = null
    }
    this.isRunning = false
  }

  getHealthHistory(): SystemHealth[] {
    return [...this.healthHistory]
  }

  getLatestHealth(): SystemHealth | null {
    return this.healthHistory[this.healthHistory.length - 1] || null
  }

  getUptime(): number {
    return Date.now() - this.startTime
  }

  // Alert system
  private alertHandlers: Array<(health: SystemHealth) => void> = []

  addAlertHandler(handler: (health: SystemHealth) => void) {
    this.alertHandlers.push(handler)
  }

  removeAlertHandler(handler: (health: SystemHealth) => void) {
    const index = this.alertHandlers.indexOf(handler)
    if (index > -1) {
      this.alertHandlers.splice(index, 1)
    }
  }

  private triggerAlerts(health: SystemHealth) {
    this.alertHandlers.forEach(handler => {
      try {
        handler(health)
      } catch (error) {
        console.error('Alert handler failed:', error)
      }
    })
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService()

// React hook for monitoring
export function useMonitoring() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const updateHealth = async () => {
      const currentHealth = await monitoring.runAllHealthChecks()
      setHealth(currentHealth)
      setIsLoading(false)
    }

    updateHealth()

    const interval = setInterval(updateHealth, healthConfig.checkInterval)
    return () => clearInterval(interval)
  }, [])

  return {
    health,
    isLoading,
    uptime: monitoring.getUptime(),
    history: monitoring.getHealthHistory()
  }
}

// Error tracking
class ErrorTracker {
  private errors: Array<{
    error: Error
    context?: Record<string, any>
    timestamp: number
    url?: string
    userAgent?: string
  }> = []

  trackError(error: Error, context?: Record<string, any>) {
    const errorEntry = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
    }

    this.errors.push(errorEntry as any)

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.splice(0, this.errors.length - 50)
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorEntry as any)
    }
  }

  private async reportError(errorEntry: any) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorEntry),
      })
    } catch (err) {
      console.error('Failed to report error:', err)
    }
  }

  getErrors() {
    return [...this.errors]
  }

  clearErrors() {
    this.errors = []
  }
}

export const errorTracker = new ErrorTracker()

// Performance monitoring
export const performanceMonitor = {
  trackPageLoad: () => {
    if (typeof window === 'undefined' || typeof window.performance === 'undefined') return

    window.addEventListener('load', () => {
      setTimeout(() => {
        // Check if performance API is available
        if (typeof window.performance.getEntriesByType !== 'function') return
        
        const navigationEntries = window.performance.getEntriesByType('navigation')
        if (navigationEntries.length === 0) return
        
        const navigation = navigationEntries[0] as PerformanceNavigationTiming
        
        if (navigation) {
          // Use valid navigation timing properties
          const metrics = {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ssl: navigation.secureConnectionStart ? navigation.connectEnd - navigation.secureConnectionStart : 0,
            ttfb: navigation.responseStart - navigation.requestStart,
            download: navigation.responseEnd - navigation.responseStart,
            domProcessing: navigation.domContentLoadedEventStart - navigation.responseEnd,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.startTime // Use startTime instead of navigationStart
          }

          // Track metrics
          Object.entries(metrics).forEach(([name, value]) => {
            if (value > 0) {
              window.performance.mark(`page_${name}`)
            }
          })
        }
      }, 0)
    })
  }
}
