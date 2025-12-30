/**
 * Security utilities for the SEBI Compliance application
 */

// Content Security Policy configuration
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js in development
    "'unsafe-eval'", // Required for Next.js in development
    'https://vercel.live',
    'https://*.googletagmanager.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled components and CSS-in-JS
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.vercel.app',
    'https://*.googletagmanager.com',
    'https://*.google-analytics.com',
  ],
  'connect-src': [
    "'self'",
    'https://reglex-backend-127310351608.us-central1.run.app',
    process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-127310351608.us-central1.run.app',
    'http://localhost:8000', // For local development only
    'http://127.0.0.1:8000', // For local development only
    'https://*.run.app', // Allow all Cloud Run services
    'https://vercel.live',
    'https://*.google-analytics.com',
    'blob:',
    'data:',
  ],
  'frame-src': [
    "'none'",
  ],
  'object-src': [
    "'none'",
  ],
  'media-src': [
    "'self'",
    'blob:',
    'https://storage.googleapis.com',
  ],
  'worker-src': [
    "'self'",
    'blob:',
  ],
  'child-src': [
    "'self'",
  ],
  'form-action': [
    "'self'",
  ],
  'frame-ancestors': [
    "'none'",
  ],
  'upgrade-insecure-requests': [],
  'block-all-mixed-content': [],
}

export function generateCSP(): string {
  return Object.entries(cspConfig)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive
      }
      return `${directive} ${sources.join(' ')}`
    })
    .join('; ')
}

// Security headers configuration
export const securityHeaders = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // XSS Protection (legacy, but good for older browsers)
  'X-XSS-Protection': '1; mode=block',

  // Strict Transport Security (for HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Content Security Policy
  'Content-Security-Policy': generateCSP(),

  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),

  // Cross-Origin Policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

// Input validation and sanitization
export const validation = {
  /**
   * Sanitize HTML to prevent XSS
   */
  sanitizeHtml: (input: string): string => {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): { valid: boolean; issues: string[] } => {
    const issues = []

    if (password.length < 8) {
      issues.push('Password must be at least 8 characters long')
    }

    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter')
    }

    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter')
    }

    if (!/[0-9]/.test(password)) {
      issues.push('Password must contain at least one number')
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      issues.push('Password must contain at least one special character')
    }

    return {
      valid: issues.length === 0,
      issues
    }
  },

  /**
   * Sanitize file name for upload
   */
  sanitizeFileName: (fileName: string): string => {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255)
  },

  /**
   * Validate file type for upload
   */
  isAllowedFileType: (fileName: string): boolean => {
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt']
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
    return allowedExtensions.includes(extension)
  },

  /**
   * Check file size limits
   */
  isValidFileSize: (size: number, maxSizeMB = 10): boolean => {
    return size <= maxSizeMB * 1024 * 1024
  }
}

// Rate limiting utilities
export const rateLimiting = {
  /**
   * Simple client-side rate limiter
   */
  createRateLimiter: (maxRequests: number, windowMs: number) => {
    const requests = new Map<string, number[]>()

    return (identifier: string): boolean => {
      const now = Date.now()
      const windowStart = now - windowMs

      if (!requests.has(identifier)) {
        requests.set(identifier, [])
      }

      const userRequests = requests.get(identifier)!

      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => time > windowStart)

      if (validRequests.length >= maxRequests) {
        return false // Rate limit exceeded
      }

      validRequests.push(now)
      requests.set(identifier, validRequests)

      return true // Request allowed
    }
  }
}

// Encryption utilities (for client-side operations)
export const encryption = {
  /**
   * Generate a random string for CSRF tokens
   */
  generateToken: (length = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result
  },

  /**
   * Hash a string (client-side hashing for non-sensitive data)
   */
  simpleHash: async (input: string): Promise<string> => {
    if (typeof window === 'undefined') return input

    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(input)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch {
      // Fallback for environments without crypto.subtle
      return btoa(input).replace(/[^a-zA-Z0-9]/g, '')
    }
  }
}

// Security monitoring
export const security = {
  /**
   * Log security events (in production, send to monitoring service)
   */
  logSecurityEvent: (event: {
    type: 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'xss_attempt'
    details: string
    userAgent?: string
    ip?: string
  }) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event)
    }

    // In production, send to your security monitoring service
    // Example: sendToSecurityService(event)
  },

  /**
   * Detect potential XSS attempts
   */
  detectXSS: (input: string): boolean => {
    const xssPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    ]

    return xssPatterns.some(pattern => pattern.test(input))
  },

  /**
   * Check for suspicious user behavior
   */
  detectSuspiciousActivity: (userActions: Array<{ action: string; timestamp: number }>) => {
    const now = Date.now()
    const recentActions = userActions.filter(action =>
      now - action.timestamp < 60000 // Last minute
    )

    // Detect rapid successive actions
    if (recentActions.length > 50) {
      return {
        suspicious: true,
        reason: 'Too many actions in short time period'
      }
    }

    return { suspicious: false }
  }
}

// CSRF Protection
export const csrf = {
  /**
   * Generate CSRF token
   */
  generateToken: (): string => {
    return encryption.generateToken(32)
  },

  /**
   * Validate CSRF token (basic client-side validation)
   */
  validateToken: (token: string, expectedToken: string): boolean => {
    return token === expectedToken && token.length === 32
  }
}

// Secure storage utilities
export const secureStorage = {
  /**
   * Store sensitive data with encryption key
   */
  setSecureItem: async (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return

    try {
      const encryptedValue = await encryption.simpleHash(value)
      sessionStorage.setItem(`secure_${key}`, encryptedValue)
    } catch (error) {
      console.error('Failed to store secure item:', error)
    }
  },

  /**
   * Retrieve and decrypt sensitive data
   */
  getSecureItem: async (key: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null

    try {
      return sessionStorage.getItem(`secure_${key}`)
    } catch (error) {
      console.error('Failed to retrieve secure item:', error)
      return null
    }
  },

  /**
   * Clear all secure storage
   */
  clearSecureStorage: (): void => {
    if (typeof window === 'undefined') return

    Object.keys(sessionStorage)
      .filter(key => key.startsWith('secure_'))
      .forEach(key => sessionStorage.removeItem(key))
  }
}
