'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Cookies from 'js-cookie'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsClient(true)
    // Handle error parameter from middleware
    const errorParam = searchParams.get('error')
    if (errorParam === 'invalid_token') {
      // Clear any existing invalid tokens
      Cookies.remove('authToken')
      setError('Invalid authentication token. Please log in again.')
    }
    
    // Check if already logged in, but only if no error parameter
    if (!errorParam && typeof window !== 'undefined') {
      const existingToken = Cookies.get('authToken')
      // Validate the existing token before redirecting
      if (existingToken && existingToken !== 'undefined' && existingToken !== 'null' && existingToken.length >= 15) {
        const redirect = searchParams.get('redirect') || '/dashboard'
        router.push(redirect)
      }
    }
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (email === 'Test-01@gmail.com' && password === '12345678') {
        // Clear any existing invalid tokens and set new authToken
        Cookies.remove('authToken')
        Cookies.set('authToken', 'dummy-auth-token-for-demo-purposes', { expires: 7 }) // Expires in 7 days
        setSuccess(true)
        
        // Wait 7 seconds before redirecting to dashboard
        setTimeout(() => {
          const redirectPath = searchParams.get('redirect') || '/dashboard'
          router.push(redirectPath)
        }, 7000) // 7 second delay
      } else {
        setError('Invalid email or password. Use Test-01@gmail.com / 12345678')
        setIsLoading(false)
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.')
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  // Always render the same component structure to avoid Fast Refresh issues
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {isClient ? (
              <Input
                id="email"
                type="email"
                placeholder="Test-01@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            ) : (
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-md" />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            {isClient ? (
              <Input
                id="password"
                type="password"
                placeholder="12345678"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            ) : (
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-md" />
            )}
          </div>
          {isClient && error && (
            <div className="text-sm text-red-500 text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          )}
          {isClient && success && (
            <div className="text-sm text-green-500 text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                <span>Login successful! Redirecting to dashboard...</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {isClient ? (
            <Button className="w-full" type="submit" disabled={isLoading || success}>
              {success ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Redirecting...</span>
                </div>
              ) : isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          ) : (
            <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-md" />
          )}
          <div className="text-sm text-center text-muted-foreground">
            Use Test-01@gmail.com / 12345678 for demo access
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
