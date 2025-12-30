/**
 * Real-time Dashboard Hook
 * Provides live data updates from backend
 */

import { useEffect, useState, useCallback } from 'react'
import DashboardService from '@/lib/dashboard-services'
import type { 
  DashboardOverview, 
  DocumentItem, 
  NotificationItem, 
  TimelineEvent 
} from '@/lib/dashboard-services'

interface RealTimeDashboardData {
  overview: DashboardOverview | null
  documents: { documents: DocumentItem[], total: number } | null
  notifications: { notifications: NotificationItem[], unreadCount: number, total: number } | null
  timeline: { events: TimelineEvent[], total: number } | null
  analytics: any | null
  connectivity: { isConnected: boolean, responseTime: number, error?: string } | null
  isLoading: boolean
  lastUpdated: Date | null
  error: string | null
}

interface UseRealTimeDashboardOptions {
  autoStart?: boolean
  pollingInterval?: number
  enableAll?: boolean
  enableOverview?: boolean
  enableDocuments?: boolean
  enableNotifications?: boolean
  enableTimeline?: boolean
  enableAnalytics?: boolean
}

export function useRealTimeDashboard(options: UseRealTimeDashboardOptions = {}): RealTimeDashboardData & {
  refresh: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
  setPollingInterval: (interval: number) => void
} {
  const {
    autoStart = true,
    pollingInterval = 5000,
    enableAll = true,
    enableOverview = enableAll,
    enableDocuments = enableAll,
    enableNotifications = enableAll,
    enableTimeline = enableAll,
    enableAnalytics = enableAll
  } = options

  const [data, setData] = useState<RealTimeDashboardData>({
    overview: null,
    documents: null,
    notifications: null,
    timeline: null,
    analytics: null,
    connectivity: null,
    isLoading: true,
    lastUpdated: null,
    error: null
  })

  const [subscriptions, setSubscriptions] = useState<Array<() => void>>([])


  // Start polling
  const startPolling = useCallback(() => {
    console.log('🔄 Starting real-time dashboard polling')

    const unsubscribeFunctions: Array<() => void> = []

    // Set polling interval (minimum 5 seconds)
    const safeInterval = Math.max(5000, pollingInterval)
    console.log(`🕰 Setting polling interval to ${safeInterval}ms`)
    DashboardService.setPollingInterval(safeInterval)

    // Subscribe to connectivity updates
    unsubscribeFunctions.push(
      DashboardService.subscribe('connectivity', (data: any) => {
        setData(prev => ({
          ...prev,
          connectivity: data,
          lastUpdated: new Date(),
          isLoading: false,
          error: null
        }))
      })
    )

    // Subscribe to data updates based on enabled options
    if (enableOverview) {
      unsubscribeFunctions.push(
        DashboardService.subscribe('overview', (data: DashboardOverview) => {
          setData(prev => ({
            ...prev,
            overview: data,
            lastUpdated: new Date(),
            isLoading: false,
            error: null
          }))
        })
      )
    }

    if (enableDocuments) {
      unsubscribeFunctions.push(
        DashboardService.subscribe('documents', (data: any) => {
          setData(prev => ({
            ...prev,
            documents: data,
            lastUpdated: new Date(),
            isLoading: false,
            error: null
          }))
        })
      )
    }

    if (enableNotifications) {
      unsubscribeFunctions.push(
        DashboardService.subscribe('notifications', (data: any) => {
          setData(prev => ({
            ...prev,
            notifications: data,
            lastUpdated: new Date(),
            isLoading: false,
            error: null
          }))
        })
      )
    }

    if (enableTimeline) {
      unsubscribeFunctions.push(
        DashboardService.subscribe('timeline', (data: any) => {
          setData(prev => ({
            ...prev,
            timeline: data,
            lastUpdated: new Date(),
            isLoading: false,
            error: null
          }))
        })
      )
    }

    if (enableAnalytics) {
      unsubscribeFunctions.push(
        DashboardService.subscribe('analytics', (data: any) => {
          setData(prev => ({
            ...prev,
            analytics: data,
            lastUpdated: new Date(),
            isLoading: false,
            error: null
          }))
        })
      )
    }

    // Subscribe to errors
    unsubscribeFunctions.push(
      DashboardService.subscribe('error', (error: any) => {
        setData(prev => ({
          ...prev,
          error: error?.error || error?.message || 'Unknown error',
          isLoading: false
        }))
      })
    )

    setSubscriptions(unsubscribeFunctions)
  }, []) // Remove all dependencies to prevent re-subscriptions

  // Stop polling
  const stopPolling = useCallback(() => {
    console.log('⏹️ Stopping real-time dashboard polling')
    subscriptions.forEach(unsubscribe => unsubscribe())
    setSubscriptions([])
    DashboardService.pausePolling() // Pause the service polling
  }, [])

  // Force refresh
  const refresh = useCallback(async () => {
    console.log('🔄 Force refreshing dashboard data')
    setData(prev => ({ ...prev, isLoading: true, error: null }))
    await DashboardService.refreshAll()
  }, [])

  // Set polling interval
  const setPollingIntervalWrapper = useCallback((interval: number) => {
    DashboardService.setPollingInterval(interval)
  }, [])

  // Auto-start polling - only depend on autoStart to prevent re-renders
  useEffect(() => {
    let mounted = true
    
    if (autoStart && mounted) {
      console.log('🚀 Auto-starting real-time dashboard')
      startPolling()
    }

    // Cleanup on unmount
    return () => {
      mounted = false
      console.log('🧡 Cleaning up real-time dashboard')
      stopPolling()
    }
  }, [autoStart]) // Remove startPolling and stopPolling from dependencies

  return {
    ...data,
    refresh,
    startPolling,
    stopPolling,
    setPollingInterval: setPollingIntervalWrapper
  }
}

// Specialized hooks for individual dashboard sections
export function useRealTimeOverview() {
  return useRealTimeDashboard({
    enableOverview: true,
    enableDocuments: false,
    enableNotifications: false,
    enableTimeline: false,
    enableAnalytics: false
  })
}

export function useRealTimeDocuments() {
  return useRealTimeDashboard({
    enableOverview: false,
    enableDocuments: true,
    enableNotifications: false,
    enableTimeline: false,
    enableAnalytics: false
  })
}

export function useRealTimeNotifications() {
  return useRealTimeDashboard({
    enableOverview: false,
    enableDocuments: false,
    enableNotifications: true,
    enableTimeline: false,
    enableAnalytics: false
  })
}

export function useRealTimeTimeline() {
  return useRealTimeDashboard({
    enableOverview: false,
    enableDocuments: false,
    enableNotifications: false,
    enableTimeline: true,
    enableAnalytics: false
  })
}
