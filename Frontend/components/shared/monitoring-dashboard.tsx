'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMonitoring } from '@/lib/monitoring'
import { Activity, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react'

export function MonitoringDashboard({ 
  showErrors = true, 
  showPerformance = true,
  compact = false 
}: { 
  showErrors?: boolean
  showPerformance?: boolean
  compact?: boolean
}) {
  const { health, isLoading, uptime, history } = useMonitoring()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Card className={compact ? 'w-full' : 'w-full max-w-4xl mx-auto'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Monitoring
          </CardTitle>
          <CardDescription>Loading monitoring data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // For demo purposes, show simplified monitoring
  return (
    <Card className={compact ? 'w-full' : 'w-full max-w-4xl mx-auto'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Monitoring
        </CardTitle>
        <CardDescription>Demo monitoring dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Status
              </div>
              <div className="text-2xl font-bold mt-1">Healthy</div>
              <div className="text-xs text-muted-foreground">Demo service</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-blue-500" />
                Uptime
              </div>
              <div className="text-2xl font-bold mt-1">
                {Math.floor(uptime / 1000 / 60)}m
              </div>
              <div className="text-xs text-muted-foreground">Since started</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium">
                <RefreshCw className="h-4 w-4 text-purple-500" />
                Checks
              </div>
              <div className="text-2xl font-bold mt-1">3</div>
              <div className="text-xs text-muted-foreground">Active monitors</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Monitoring Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Memory Usage</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  Healthy
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Storage</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  Healthy
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Network</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  Healthy
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
