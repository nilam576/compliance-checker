// Enhanced Error Handling for FastAPI Integration
// Provides comprehensive error handling and user feedback

import { toast } from 'sonner'

// Error types for better classification
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server', 
  CLIENT = 'client',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  PROCESSING = 'processing',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Structured error interface
export interface AppError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  details?: string
  code?: string | number
  timestamp: Date
  context?: Record<string, any>
  originalError?: Error
}

export class ErrorHandler {
  /**
   * Handle FastAPI errors with appropriate user feedback
   */
  static handleFastAPIError(error: any, context?: Record<string, any>): AppError {
    const appError = this.classifyError(error, context)
    
    // Log error for debugging
    console.error('FastAPI Error:', {
      type: appError.type,
      severity: appError.severity,
      message: appError.message,
      details: appError.details,
      context: appError.context
    })

    // Show user-friendly notification
    this.showErrorNotification(appError)
    
    return appError
  }

  /**
   * Classify error based on response and context
   */
  private static classifyError(error: any, context?: Record<string, any>): AppError {
    const timestamp = new Date()
    
    // Network/Connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.HIGH,
        message: 'Cannot connect to FastAPI backend',
        details: 'Please ensure the FastAPI server is running at http://127.0.0.1:8000',
        code: error.code,
        timestamp,
        context,
        originalError: error
      }
    }

    // Server errors (5xx)
    if (error.response?.status >= 500) {
      return {
        type: ErrorType.SERVER,
        severity: ErrorSeverity.HIGH,
        message: 'Server processing error',
        details: error.response?.data?.detail || 'Internal server error occurred',
        code: error.response?.status,
        timestamp,
        context,
        originalError: error
      }
    }

    // Client errors (4xx)
    if (error.response?.status >= 400) {
      const status = error.response.status
      
      if (status === 422) {
        return {
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          message: 'Invalid file or request format',
          details: 'Please check the file format and try again',
          code: status,
          timestamp,
          context,
          originalError: error
        }
      }

      if (status === 413) {
        return {
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          message: 'File too large',
          details: 'Please upload a smaller file (max 10MB)',
          code: status,
          timestamp,
          context,
          originalError: error
        }
      }

      return {
        type: ErrorType.CLIENT,
        severity: ErrorSeverity.MEDIUM,
        message: 'Request failed',
        details: error.response?.data?.detail || `HTTP ${status} error`,
        code: status,
        timestamp,
        context,
        originalError: error
      }
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      return {
        type: ErrorType.PROCESSING,
        severity: ErrorSeverity.MEDIUM,
        message: 'Processing timeout',
        details: 'Document analysis is taking longer than expected',
        code: 'TIMEOUT',
        timestamp,
        context,
        originalError: error
      }
    }

    // Generic unknown error
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: 'Unexpected error occurred',
      details: error.message || 'Unknown error',
      timestamp,
      context,
      originalError: error
    }
  }

  /**
   * Show appropriate error notification to user
   */
  private static showErrorNotification(appError: AppError) {
    const { type, severity, message, details } = appError

    const toastOptions = {
      description: details,
      duration: severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL ? 8000 : 5000
    }

    switch (type) {
      case ErrorType.NETWORK:
        toast.error('Connection Failed', {
          ...toastOptions,
          action: {
            label: 'Retry',
            onClick: () => window.location.reload()
          }
        })
        break

      case ErrorType.SERVER:
        toast.error('Server Error', {
          ...toastOptions,
          description: 'Backend processing failed. Please try again or contact support.'
        })
        break

      case ErrorType.VALIDATION:
        toast.warning('Invalid Request', toastOptions)
        break

      case ErrorType.PROCESSING:
        toast.warning('Processing Issue', {
          ...toastOptions,
          action: {
            label: 'Retry',
            onClick: () => console.log('Retry processing')
          }
        })
        break

      default:
        toast.error(message, toastOptions)
        break
    }
  }

  /**
   * Handle upload-specific errors
   */
  static handleUploadError(error: any, fileName: string): AppError {
    const context = { fileName, operation: 'file_upload' }
    const appError = this.handleFastAPIError(error, context)

    // Additional upload-specific logic
    if (appError.type === ErrorType.VALIDATION) {
      toast.info('Upload Tips', {
        description: 'Supported formats: PDF, DOCX, TXT (max 10MB)',
        duration: 6000
      })
    }

    return appError
  }

  /**
   * Handle analysis-specific errors
   */
  static handleAnalysisError(error: any, context?: Record<string, any>): AppError {
    const analysisContext = { ...context, operation: 'document_analysis' }
    const appError = this.handleFastAPIError(error, analysisContext)

    // Provide fallback suggestions for analysis failures
    if (appError.severity === ErrorSeverity.HIGH) {
      toast.info('Fallback Available', {
        description: 'Using mock analysis data for development',
        duration: 4000
      })
    }

    return appError
  }

  /**
   * Create user-friendly error message
   */
  static getUserMessage(appError: AppError): string {
    switch (appError.type) {
      case ErrorType.NETWORK:
        return 'Unable to connect to the analysis server. Please check your connection and try again.'
      
      case ErrorType.SERVER:
        return 'The server encountered an error while processing your document. Please try again later.'
      
      case ErrorType.VALIDATION:
        return 'The uploaded file format is not supported. Please upload a PDF, DOCX, or TXT file.'
      
      case ErrorType.PROCESSING:
        return 'Document analysis is taking longer than expected. Please wait or try again.'
      
      default:
        return appError.message || 'An unexpected error occurred. Please try again.'
    }
  }

  /**
   * Get recovery suggestions based on error type
   */
  static getRecoverySuggestions(appError: AppError): string[] {
    switch (appError.type) {
      case ErrorType.NETWORK:
        return [
          'Check that FastAPI server is running on http://127.0.0.1:8000',
          'Verify your internet connection',
          'Try refreshing the page'
        ]
      
      case ErrorType.SERVER:
        return [
          'Wait a moment and try again',
          'Check server logs for more details',
          'Contact support if the issue persists'
        ]
      
      case ErrorType.VALIDATION:
        return [
          'Use supported file formats: PDF, DOCX, TXT',
          'Ensure file size is under 10MB',
          'Check that the file is not corrupted'
        ]
      
      default:
        return [
          'Try refreshing the page',
          'Clear browser cache',
          'Contact support if needed'
        ]
    }
  }
}

// Utility function for async error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T | null> => {
  try {
    return await operation()
  } catch (error) {
    ErrorHandler.handleFastAPIError(error, context)
    return null
  }
}

export default ErrorHandler
