/**
 * Analytics and monitoring utilities
 */

// Analytics configuration
const analyticsConfig = {
  enabledInDev: false,
  apiEndpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '', // Disabled - no analytics endpoint
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
}

// Event types
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: number
  sessionId?: string
  userId?: string
  userAgent?: string
  url?: string
  referrer?: string
}

// User properties
export interface UserProperties {
  userId?: string
  email?: string
  role?: string
  lastActive?: number
  sessionStart?: number
  [key: string]: any
}

class Analytics {
  private events: AnalyticsEvent[] = []
  private userProperties: UserProperties = {}
  private sessionId: string = ''
  private flushTimer: NodeJS.Timeout | null = null
  private isEnabled: boolean = false

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' || analyticsConfig.enabledInDev
    
    if (typeof window !== 'undefined' && this.isEnabled) {
      this.sessionId = this.generateSessionId()
      this.startSession()
      this.setupEventListeners()
      this.startFlushTimer()
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private startSession() {
    const sessionStart = Date.now()
    this.userProperties.sessionStart = sessionStart
    this.userProperties.lastActive = sessionStart

    this.track('session_start', {
      sessionId: this.sessionId,
      timestamp: sessionStart,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      }
    })
  }

  private setupEventListeners() {
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden')
      } else {
        this.track('page_visible')
      }
    })

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.track('session_end')
      this.flush(true) // Synchronous flush on exit
    })

    // Track errors
    window.addEventListener('error', (event) => {
      this.track('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.track('unhandled_promise_rejection', {
        reason: event.reason?.toString()
      })
    })
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, analyticsConfig.flushInterval)
  }

  // Public methods
  track(eventName: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) return

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userProperties.userId,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    }

    this.events.push(event)
    this.userProperties.lastActive = Date.now()

    // Flush if batch size is reached
    if (this.events.length >= analyticsConfig.batchSize) {
      this.flush()
    }
  }

  identify(userId: string, properties: UserProperties = {}) {
    if (!this.isEnabled) return

    this.userProperties = {
      ...this.userProperties,
      userId,
      ...properties
    }

    this.track('user_identified', { userId, ...properties })
  }

  page(pageName?: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) return

    this.track('page_view', {
      page: pageName || (typeof window !== 'undefined' ? window.location.pathname : ''),
      title: typeof document !== 'undefined' ? document.title : '',
      ...properties
    })
  }

  async flush(synchronous = false) {
    if (!this.isEnabled || this.events.length === 0 || !analyticsConfig.apiEndpoint) return

    const eventsToSend = [...this.events]
    this.events = []

    const payload = {
      events: eventsToSend,
      userProperties: this.userProperties,
      sessionId: this.sessionId
    }

    try {
      if (synchronous && navigator.sendBeacon) {
        // Use sendBeacon for synchronous requests (page unload)
        navigator.sendBeacon(
          analyticsConfig.apiEndpoint,
          JSON.stringify(payload)
        )
      } else {
        // Use fetch for regular requests
        await fetch(analyticsConfig.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      }
    } catch (error) {
      // Restore events if sending failed
      this.events = [...eventsToSend, ...this.events]
      console.error('Failed to send analytics:', error)
    }
  }

  reset() {
    this.events = []
    this.userProperties = {}
    this.sessionId = this.generateSessionId()
  }

  // Performance monitoring
  trackPerformance(name: string, startTime: number, endTime?: number) {
    if (!this.isEnabled) return

    const duration = (endTime || Date.now()) - startTime
    this.track('performance_metric', {
      name,
      duration,
      startTime,
      endTime: endTime || Date.now()
    })
  }

  // Custom metrics
  trackMetric(name: string, value: number, unit?: string) {
    if (!this.isEnabled) return

    this.track('custom_metric', {
      name,
      value,
      unit: unit || 'count'
    })
  }

  // Business events
  trackBusinessEvent(eventName: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) return

    this.track(`business_${eventName}`, properties)
  }
}

// Global analytics instance
export const analytics = new Analytics()

// Convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) => 
  analytics.track(name, properties)

export const trackPage = (pageName?: string, properties?: Record<string, any>) => 
  analytics.page(pageName, properties)

export const identifyUser = (userId: string, properties?: UserProperties) => 
  analytics.identify(userId, properties)

export const trackPerformance = (name: string, startTime: number, endTime?: number) => 
  analytics.trackPerformance(name, startTime, endTime)

export const trackMetric = (name: string, value: number, unit?: string) => 
  analytics.trackMetric(name, value, unit)

export const trackBusinessEvent = (eventName: string, properties?: Record<string, any>) => 
  analytics.trackBusinessEvent(eventName, properties)

// React hook for analytics
export function useAnalytics() {
  const track = (name: string, properties?: Record<string, any>) => {
    analytics.track(name, properties)
  }

  const page = (pageName?: string, properties?: Record<string, any>) => {
    analytics.page(pageName, properties)
  }

  const identify = (userId: string, properties?: UserProperties) => {
    analytics.identify(userId, properties)
  }

  const trackPerf = (name: string, startTime: number, endTime?: number) => {
    analytics.trackPerformance(name, startTime, endTime)
  }

  const trackCustomMetric = (name: string, value: number, unit?: string) => {
    analytics.trackMetric(name, value, unit)
  }

  const trackBusiness = (eventName: string, properties?: Record<string, any>) => {
    analytics.trackBusinessEvent(eventName, properties)
  }

  return {
    track,
    page,
    identify,
    trackPerformance: trackPerf,
    trackMetric: trackCustomMetric,
    trackBusinessEvent: trackBusiness,
  }
}

// Error boundary analytics
export const trackError = (error: Error, errorInfo?: any) => {
  analytics.track('react_error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    componentStack: errorInfo?.componentStack
  })
}

// Application-specific events
export const complianceAnalytics = {
  documentUploaded: (fileName: string, fileSize: number, fileType: string) => {
    trackBusinessEvent('document_uploaded', {
      fileName,
      fileSize,
      fileType,
      timestamp: Date.now()
    })
  },

  documentProcessed: (documentId: string, processingTime: number, success: boolean) => {
    trackBusinessEvent('document_processed', {
      documentId,
      processingTime,
      success,
      timestamp: Date.now()
    })
  },

  complianceVerified: (documentId: string, complianceScore: number, riskLevel: string) => {
    trackBusinessEvent('compliance_verified', {
      documentId,
      complianceScore,
      riskLevel,
      timestamp: Date.now()
    })
  },

  llmProviderSelected: (provider: string) => {
    trackBusinessEvent('llm_provider_selected', {
      provider,
      timestamp: Date.now()
    })
  },

  userAction: (action: string, context?: Record<string, any>) => {
    trackEvent('user_action', {
      action,
      ...context,
      timestamp: Date.now()
    })
  }
}
