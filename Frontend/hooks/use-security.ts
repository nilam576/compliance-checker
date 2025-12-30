'use client'

import { useEffect, useState, useCallback } from 'react'
import { validation, security, csrf, secureStorage } from '@/lib/security'

// Security hook for authentication and CSRF protection
export function useSecurity() {
  const [csrfToken, setCsrfToken] = useState<string>('')
  const [isSecure, setIsSecure] = useState(false)

  useEffect(() => {
    // Generate CSRF token on mount
    const token = csrf.generateToken()
    setCsrfToken(token)

    // Store in secure storage
    secureStorage.setSecureItem('csrf-token', token)

    // Check if we're in a secure context
    setIsSecure(typeof window !== 'undefined' && window.location.protocol === 'https:')
  }, [])

  const validateInput = useCallback((input: string, type: 'html' | 'email' | 'password' | 'filename') => {
    switch (type) {
      case 'html':
        return validation.sanitizeHtml(input)
      case 'email':
        return validation.isValidEmail(input)
      case 'password':
        return validation.validatePassword(input)
      case 'filename':
        return validation.sanitizeFileName(input)
      default:
        return input
    }
  }, [])

  const logSecurityEvent = useCallback((type: 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'xss_attempt', details: string) => {
    security.logSecurityEvent({
      type,
      details,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    })
  }, [])

  return {
    csrfToken,
    isSecure,
    validateInput,
    logSecurityEvent,
    sanitizeHtml: validation.sanitizeHtml,
    isValidEmail: validation.isValidEmail,
    validatePassword: validation.validatePassword,
    sanitizeFileName: validation.sanitizeFileName,
    isAllowedFileType: validation.isAllowedFileType,
    isValidFileSize: validation.isValidFileSize,
  }
}

// Hook for monitoring user activity for security purposes
export function useSecurityMonitoring() {
  const [userActions, setUserActions] = useState<Array<{ action: string; timestamp: number }>>([])
  
  const logAction = useCallback((action: string) => {
    const timestamp = Date.now()
    setUserActions(prev => {
      const newActions = [...prev, { action, timestamp }]
      
      // Keep only last 100 actions
      if (newActions.length > 100) {
        newActions.splice(0, newActions.length - 100)
      }
      
      // Check for suspicious activity
      const suspiciousCheck = security.detectSuspiciousActivity(newActions)
      if (suspiciousCheck.suspicious) {
        security.logSecurityEvent({
          type: 'suspicious_activity',
          details: suspiciousCheck.reason || 'Unusual user activity detected'
        })
      }
      
      return newActions
    })
  }, [])

  const clearActions = useCallback(() => {
    setUserActions([])
  }, [])

  useEffect(() => {
    // Clear old actions periodically
    const cleanup = setInterval(() => {
      const oneHourAgo = Date.now() - 3600000
      setUserActions(prev => prev.filter(action => action.timestamp > oneHourAgo))
    }, 300000) // Every 5 minutes

    return () => clearInterval(cleanup)
  }, [])

  return {
    logAction,
    clearActions,
    actionCount: userActions.length,
    recentActions: userActions.slice(-10) // Last 10 actions
  }
}

// Hook for secure file handling
export function useSecureFileHandling() {
  const validateFile = useCallback((file: File): { valid: boolean; errors: string[] } => {
    const errors = []
    
    if (!validation.isAllowedFileType(file.name)) {
      errors.push('File type not allowed')
    }
    
    if (!validation.isValidFileSize(file.size)) {
      errors.push('File size too large (max 10MB)')
    }
    
    const sanitizedName = validation.sanitizeFileName(file.name)
    if (sanitizedName !== file.name) {
      errors.push('File name contains invalid characters')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }, [])

  const processFile = useCallback(async (file: File): Promise<{ success: boolean; processedFile?: File; error?: string }> => {
    const validation_result = validateFile(file)
    
    if (!validation_result.valid) {
      return {
        success: false,
        error: validation_result.errors.join(', ')
      }
    }

    // Create a new file with sanitized name
    const sanitizedName = validation.sanitizeFileName(file.name)
    const processedFile = new File([file], sanitizedName, { type: file.type })
    
    return {
      success: true,
      processedFile
    }
  }, [validateFile])

  return {
    validateFile,
    processFile
  }
}

// Hook for rate limiting on the client side
export function useRateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  const [requestCount, setRequestCount] = useState(0)
  const [windowStart, setWindowStart] = useState(Date.now())

  const checkRateLimit = useCallback(() => {
    const now = Date.now()
    
    // Reset window if expired
    if (now - windowStart >= windowMs) {
      setWindowStart(now)
      setRequestCount(0)
      return true
    }
    
    if (requestCount >= maxRequests) {
      return false
    }
    
    setRequestCount(prev => prev + 1)
    return true
  }, [requestCount, windowStart, maxRequests, windowMs])

  const resetRateLimit = useCallback(() => {
    setRequestCount(0)
    setWindowStart(Date.now())
  }, [])

  const remainingRequests = Math.max(0, maxRequests - requestCount)
  const timeUntilReset = Math.max(0, windowMs - (Date.now() - windowStart))

  return {
    checkRateLimit,
    resetRateLimit,
    requestCount,
    remainingRequests,
    timeUntilReset,
    isLimited: requestCount >= maxRequests
  }
}

// Hook for XSS detection and prevention
export function useXSSProtection() {
  const detectAndSanitize = useCallback((input: string): { safe: boolean; sanitized: string; threats: string[] } => {
    const threats = []
    
    if (security.detectXSS(input)) {
      threats.push('Potential XSS attempt detected')
    }
    
    const sanitized = validation.sanitizeHtml(input)
    
    if (sanitized !== input) {
      threats.push('HTML content sanitized')
    }
    
    return {
      safe: threats.length === 0,
      sanitized,
      threats
    }
  }, [])

  const validateUserInput = useCallback((input: string, logThreats = true): string => {
    const result = detectAndSanitize(input)
    
    if (!result.safe && logThreats) {
      security.logSecurityEvent({
        type: 'xss_attempt',
        details: `Potential XSS detected: ${result.threats.join(', ')}`
      })
    }
    
    return result.sanitized
  }, [detectAndSanitize])

  return {
    detectAndSanitize,
    validateUserInput
  }
}
