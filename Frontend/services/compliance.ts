'use server'

import { APP_CONFIG } from '@/lib/config'
import { FastAPIService } from '@/lib/fastapi-services'
import type { 
  ComplianceVerificationRequest, 
  ComplianceVerificationResponse
} from '@/lib/api'

/**
 * Server Action for verifying compliance
 * This runs on the server side for enhanced security and performance
 */
export async function verifyCompliance(
  data: ComplianceVerificationRequest
): Promise<ComplianceVerificationResponse> {
  'use server'
  
  try {
    // Use FastAPI service for compliance verification (server action)
    // FastAPI service handles both real backend and offline mode internally
    console.log('🚀 Calling FastAPI backend service from server action')
    return await FastAPIService.verifyCompliance(data)
  } catch (error) {
    console.error('Server action compliance verification failed:', error)
    throw new Error(`Compliance verification server action failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Server Action for uploading documents - FULL BACKEND INTEGRATION
 */
export async function uploadDocument(formData: FormData): Promise<any> {
  'use server'
  
  const startTime = Date.now()
  
  try {
    const file = formData.get('file') as File
    if (!file) {
      throw new Error('No file provided in form data')
    }

    console.log('📤 Server Action - Starting document upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      timestamp: new Date().toISOString(),
      useBackend: !APP_CONFIG.USE_MOCK_API
    })

    // Use FastAPI service for document upload (server action)  
    // FastAPI service handles both real backend and offline mode internally
    console.log('🚀 Server Action - Using FastAPI backend service')
    
    // Get language parameter, default to 'en'
    const lang = formData.get('lang') as string || 'en'
    
    // Call FastAPI service
    const backendResult = await FastAPIService.uploadDocument(file, lang)
    
    console.log('✅ Server Action - FastAPI service processing complete:', {
      processingTime: `${backendResult.processingTime}ms`,
      summary_length: backendResult.summary?.length || 0,
      clauses_count: backendResult.clauses?.length || 0,
      source: backendResult.source
    })

    // Enhanced response with server action metadata
    return {
      // FastAPI service data
      ...backendResult,
      
      // Server action metadata
      serverSide: true,
      processedAt: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiTimeout: process.env.NEXT_PUBLIC_API_TIMEOUT,
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
        analyticsEnabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
      }
    }

  } catch (error) {
    const processingTime = Date.now() - startTime
    
    console.error('❌ Server Action - Document upload failed:', {
      error: error instanceof Error ? error.message : String(error),
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    })
    
    // Enhanced error handling for different error types
    if (error instanceof Error) {
      // Network/Connection errors
      if (error.message.includes('ECONNREFUSED') || 
          error.message.includes('fetch failed') ||
          error.message.includes('connect')) {
        const connectionError = {
          error: 'BACKEND_CONNECTION_FAILED',
          message: 'FastAPI backend is not reachable from server',
          details: error.message,
          apiUrl: process.env.NEXT_PUBLIC_API_URL,
          processingTime,
          timestamp: new Date().toISOString(),
          troubleshooting: [
            'Check if FastAPI server is running on the configured port',
            'Verify the NEXT_PUBLIC_API_URL environment variable',
            'Check server-side network connectivity',
            'Review backend server logs'
          ]
        }
        
        console.error('🔌 Server Connection Error:', connectionError)
        throw new Error(JSON.stringify(connectionError))
      }
      
      // Timeout errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        const timeoutError = {
          error: 'PROCESSING_TIMEOUT',
          message: 'Document processing timed out on server side',
          details: error.message,
          processingTime,
          timeout: process.env.NEXT_PUBLIC_API_TIMEOUT,
          timestamp: new Date().toISOString()
        }
        
        console.error('⏱️ Server Timeout Error:', timeoutError)
        throw new Error(JSON.stringify(timeoutError))
      }
    }
    
    // For unexpected errors, provide comprehensive error information
    const unexpectedError = {
      error: 'UNEXPECTED_SERVER_ERROR',
      message: 'Unexpected error during server-side document processing',
      details: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      processingTime,
      timestamp: new Date().toISOString(),
      context: {
        serverSide: true,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }
    
    console.error('💥 Unexpected Server Error:', unexpectedError)
    throw new Error(JSON.stringify(unexpectedError))
  }
}

/**
 * Server Action for getting analytics data
 */
export async function getAnalytics() {
  'use server'
  
  try {
    console.log('🚀 Fetching analytics from FastAPI backend (server action)')
    
    // Use FastAPI service for analytics (server action)
    // FastAPI service handles both real backend and offline mode internally
    return await FastAPIService.getAnalytics()
  } catch (error) {
    console.error('❌ Analytics server action failed:', error)
    throw new Error(`Analytics fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Server Action for getting LLM providers
 */
export async function getLLMProviders() {
  'use server'
  
  try {
    console.log('🚀 Fetching LLM providers from FastAPI backend (server action)')
    
    // Use FastAPI service for LLM providers (server action)
    // FastAPI service handles both real backend and offline mode internally
    return await FastAPIService.getProviders()
  } catch (error) {
    console.error('❌ Providers server action failed:', error)
    throw new Error(`LLM providers fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Server Action for health check - FULL BACKEND INTEGRATION
 */
export async function healthCheck() {
  'use server'
  
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  
  console.log('🔍 Server Action - Starting comprehensive health check:', {
    timestamp,
    serverSide: true,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    useBackend: !APP_CONFIG.USE_MOCK_API
  })
  
  try {
    // Use FastAPI service for health check (server action)
    // FastAPI service handles both real backend and offline mode internally
    console.log('🚀 Server Action - Using FastAPI backend service for health check')
    
    const healthResult = await FastAPIService.healthCheck()
    
    console.log('✅ Server Action - FastAPI health check complete:', {
      status: healthResult.status,
      responseTime: `${healthResult.responseTime}ms`,
      source: healthResult.source
    })

    return {
      ...healthResult,
      serverSide: true,
      timestamp,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        apiTimeout: process.env.NEXT_PUBLIC_API_TIMEOUT,
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
        analyticsEnabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
        notificationsEnabled: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true'
      }
    }

  } catch (error) {
    const responseTime = Date.now() - startTime
    
    console.error('❌ Server Action - Health check failed:', {
      error: error instanceof Error ? error.message : String(error),
      responseTime: `${responseTime}ms`,
      timestamp,
      apiUrl: process.env.NEXT_PUBLIC_API_URL
    })
    
    // Comprehensive error response with troubleshooting
    const errorResult = {
      status: 'unhealthy' as const,
      service: 'SEBI Compliance FastAPI Backend',
      version: '1.0.0',
      message: 'Backend health check failed - server may be down or unreachable',
      responseTime,
      source: 'fastapi_backend_server_error',
      timestamp,
      serverSide: true,
      
      // Error details
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'UnknownError',
        stack: error instanceof Error ? error.stack : undefined
      },
      
      // Connection attempt details
      connectionAttempt: {
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        endpoint: '/health',
        timeout: 10000,
        method: 'GET',
        userAgent: `SEBI-Compliance-Server/${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`
      },
      
      // Environment context
      environment: {
        nodeEnv: process.env.NODE_ENV,
        serverSide: true,
        timestamp
      },
      
      // Detailed troubleshooting information
      troubleshooting: {
        possibleCauses: [
          'FastAPI backend server is not running',
          'Backend server is running on a different port than configured',
          'Network connectivity issues between Next.js server and FastAPI',
          'Firewall or security software blocking the connection',
          'Backend server crashed or became unresponsive'
        ],
        immediateActions: [
          'Check if FastAPI server is running on the configured port',
          'Verify NEXT_PUBLIC_API_URL environment variable is correct',
          'Check backend server logs for errors or crashes',
          'Test direct connection to backend with curl or Postman'
        ],
        diagnosticCommands: [
          `curl -I ${process.env.NEXT_PUBLIC_API_URL}/health`,
          'Check backend server logs',
          'Verify network connectivity',
          'Check if port is occupied by another process'
        ]
      }
    }

    return errorResult
  }
}