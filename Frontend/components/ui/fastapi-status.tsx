// FastAPI Backend Status Component
// Shows real-time connection status with the FastAPI backend

'use client'

import { useState, useEffect } from 'react'
import { Badge } from './badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { FastAPIService } from '@/lib/fastapi-services'

interface FastAPIStatusProps {
  showDetails?: boolean
  checkInterval?: number
}

export function FastAPIStatus({ showDetails = false, checkInterval = 30000 }: FastAPIStatusProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking')
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const checkStatus = async () => {
      setStatus('checking')
      try {
        // Direct health check with FastAPI backend
        try {
          const health = await FastAPIService.healthCheck()
          if (health.status === 'healthy') {
            setStatus('online')
            setError('')
          } else {
            setStatus('error')
            setError(`Backend status: ${health.status}`)
          }
        } catch (healthError) {
          // If health check fails, backend might be offline
          setStatus('offline')
          setError('FastAPI backend not responding')
        }
      } catch (err) {
        setStatus('offline')
        setError(err instanceof Error ? err.message : 'Connection failed')
      } finally {
        setLastCheck(new Date())
      }
    }

    // Initial check
    checkStatus()

    // Set up interval for periodic checks
    const interval = setInterval(checkStatus, checkInterval)

    return () => clearInterval(interval)
  }, [checkInterval])

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50 hover:bg-green-100'
      case 'offline': return 'text-red-600 bg-red-50 hover:bg-red-100'
      case 'error': return 'text-orange-600 bg-orange-50 hover:bg-orange-100'
      case 'checking': return 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'online': return <CheckCircle className="h-3 w-3" />
      case 'offline': return <XCircle className="h-3 w-3" />
      case 'error': return <AlertCircle className="h-3 w-3" />
      case 'checking': return <Loader2 className="h-3 w-3 animate-spin" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'FastAPI Online'
      case 'offline': return 'FastAPI Offline'
      case 'error': return 'FastAPI Error'
      case 'checking': return 'Checking...'
    }
  }


  if (showDetails) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg border bg-card text-card-foreground">
        {getStatusIcon()}
        <div className="flex flex-col">
          <div className="text-sm font-medium">{getStatusText()}</div>
          {lastCheck && (
            <div className="text-xs text-muted-foreground">
              Last checked: {lastCheck.toLocaleTimeString()}
            </div>
          )}
          {error && (
            <div className="text-xs text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`cursor-help ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-1 text-xs">{getStatusText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          <div className="space-y-2 max-w-xs">
            <div className="font-medium">FastAPI Backend Status</div>
            <div className="text-sm">
              Status: {getStatusText()}
            </div>
            {lastCheck && (
              <div className="text-xs text-muted-foreground">
                Last checked: {lastCheck.toLocaleTimeString()}
              </div>
            )}
            {error && (
              <div className="text-xs text-red-600">
                Error: {error}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Endpoint: http://127.0.0.1:8002
            </div>
            {status === 'offline' && (
              <div className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                <div className="font-medium text-yellow-800">To start backend:</div>
                <code className="text-xs text-yellow-700">cd Backend && python app.py dev</code>
                <div className="mt-1 text-yellow-600">
                  Backend should be running on port 8002
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default FastAPIStatus
