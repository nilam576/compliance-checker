import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { securityHeaders } from '@/lib/security'

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next()

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Rate limiting check (basic implementation)
  const rateLimitKey = `rate_limit_${request.ip || 'unknown'}`
  const rateLimitCount = Number(response.cookies.get(rateLimitKey)?.value || 0)
  const maxRequests = 100 // requests per hour
  
  if (rateLimitCount > maxRequests) {
    return new NextResponse('Rate limit exceeded', { 
      status: 429,
      headers: {
        'Retry-After': '3600' // 1 hour
      }
    })
  }

  // Increment rate limit counter
  response.cookies.set(rateLimitKey, String(rateLimitCount + 1), {
    maxAge: 3600, // 1 hour
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })

  // Authentication check for protected routes
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Skip authentication in development mode for easier testing
    const isDevelopment = process.env.NODE_ENV === 'development' ||
                         process.env.NEXT_PUBLIC_SKIP_AUTH === 'true'

    if (!isDevelopment) {
      // Check for auth cookie or header
      const authToken = request.cookies.get('authToken')?.value ||
                       request.headers.get('authorization')?.replace('Bearer ', '')

      if (!authToken) {
        // Redirect to login if no auth token
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Validate token format (basic check)
      // Allow demo tokens or tokens that are reasonably long
      if (authToken && (authToken.trim().length < 15 || authToken.trim() === '')) {
        // Invalid token format - too short to be legitimate or empty
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'invalid_token')
        return NextResponse.redirect(loginUrl)
      }

      // Additional validation: check for common invalid token patterns
      if (authToken && (authToken === 'undefined' || authToken === 'null' || authToken === 'false')) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'invalid_token')
        return NextResponse.redirect(loginUrl)
      }
    } else {
      // Development mode: allow access to dashboard without authentication
      console.log('🔓 Development mode: Skipping authentication for dashboard access')
    }
  }

  // CSRF protection for state-changing operations
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const csrfToken = request.headers.get('x-csrf-token') || 
                     request.cookies.get('csrf-token')?.value

    if (!csrfToken) {
      return new NextResponse('CSRF token missing', { status: 403 })
    }

    // In production, validate CSRF token against server-side store
    if (csrfToken.length < 20) {
      return new NextResponse('Invalid CSRF token', { status: 403 })
    }
  }

  // Content-Type validation for POST/PUT requests
  if ((request.method === 'POST' || request.method === 'PUT') && 
      request.nextUrl.pathname.startsWith('/api/')) {
    const contentType = request.headers.get('content-type')
    
    if (!contentType || (!contentType.includes('application/json') && 
        !contentType.includes('multipart/form-data'))) {
      return new NextResponse('Invalid Content-Type', { status: 400 })
    }
  }

  // Add security-related headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('X-Robots-Tag', 'noindex')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
