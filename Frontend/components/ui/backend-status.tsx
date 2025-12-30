'use client'

import { useState, useEffect } from 'react'
import { Badge } from './badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import { CheckCircle2, AlertCircle, XCircle, Wifi } from 'lucide-react'
import { complianceAPI } from '@/lib/api'
import { APP_CONFIG } from '@/lib/config'

interface BackendStatusProps {
  className?: string
  showDetails?: boolean
}

type ConnectionStatus = 'connected' | 'disconnected' | 'mock' | 'checking'

export function BackendStatus({ className, showDetails = false }: BackendStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [backendInfo, setBackendInfo] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const checkBackendStatus = async () => {
    setIsChecking(true)
    setError(null)
    
    try {
      // Check if we're using mock API
      if (APP_CONFIG.USE_MOCK_API) {
        setStatus('mock')
        setBackendInfo({
          status: 'mock',
          service: 'SEBI Compliance API (Mock)',
          version: '1.0.0-mock',
          message: 'Mock service for development'
        })
        setLastChecked(new Date())
        return
      }

      // Try to connect to real backend using FastAPI service
      const healthData = await complianceAPI.healthCheck()
      
      if (healthData.status === 'healthy') {
        setBackendInfo(healthData)
        setStatus('connected')
      } else {
        throw new Error(`Backend unhealthy: ${healthData.message}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setStatus('disconnected')
      setBackendInfo(null)
      
      // Fallback to mock mode on connection failure
      setStatus('mock')
      setBackendInfo({
        status: 'mock',
        service: 'SEBI Compliance API (Mock - Fallback)',
        version: '1.0.0-mock',
        message: 'Using mock service due to backend connection failure'
      })
    } finally {
      setIsChecking(false)
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    if (!isClient) return
    checkBackendStatus()
    
    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000)
    
    return () => clearInterval(interval)
  }, [isClient])

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle2,
          text: 'Backend Connected',
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: `Connected to real Python/FastAPI backend at ${APP_CONFIG.API_URL}`
        }
      case 'mock':
        return {
          icon: Wifi,
          text: 'Mock Mode',
          variant: 'secondary' as const,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          description: 'Using mock services for development and testing'
        }
      case 'disconnected':
        return {
          icon: XCircle,
          text: 'Backend Offline',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          description: `Cannot connect to backend at ${APP_CONFIG.API_URL}. Ensure the Python/FastAPI server is running.`
        }
      case 'checking':
        return {
          icon: AlertCircle,
          text: 'Checking...',
          variant: 'outline' as const,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          description: 'Checking backend connection status'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const statusBadge = (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-2 ${className}`}
    >
      <Icon className="w-3 h-3" />
      {config.text}
    </Badge>
  )

  if (!isClient) {
    return null
  }

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {statusBadge}
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{config.text}</p>
              <p className="text-muted-foreground">{config.description}</p>
              {lastChecked && (
                <p className="text-xs mt-1">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
              {backendInfo && (
                <div className="text-xs mt-1 space-y-1">
                  <p>Service: {backendInfo.service}</p>
                  <p>Version: {backendInfo.version}</p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <div>
            <h3 className="font-medium">{config.text}</h3>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
        
        {status !== 'checking' && (
          <button
            onClick={checkBackendStatus}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Refresh
          </button>
        )}
      </div>
      
      {lastChecked && (
        <p className="text-xs text-muted-foreground mt-2">
          Last checked: {lastChecked.toLocaleString()}
        </p>
      )}
      
      {backendInfo && status === 'connected' && (
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span>{backendInfo.service || 'SEBI Compliance API'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version:</span>
            <span>{backendInfo.version || '1.0.0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="text-green-600">{backendInfo.status || 'healthy'}</span>
          </div>
        </div>
      )}
      
      {status === 'mock' && (
        <div className="mt-3 text-xs text-muted-foreground">
          <p>To connect to real backend:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Start the Python/FastAPI backend server</li>
            <li>Set NEXT_PUBLIC_USE_MOCK_API=false in .env.local</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      )}
      
      {status === 'disconnected' && (
        <div className="mt-3 text-xs text-muted-foreground">
          <p>To resolve this issue:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Ensure Python/FastAPI backend is running</li>
            <li>Check that it&#39;s accessible at {APP_CONFIG.API_URL}</li>
            <li>Verify there are no firewall or network issues</li>
            <li>Check the backend logs for errors</li>
          </ol>
        </div>
      )}
    </div>
  )
}
