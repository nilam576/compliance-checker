'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileText, 
  Menu,
  X,
  LogOut,
  User,
  HelpCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import Cookies from 'js-cookie'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

const landingNavigation = [
  { name: 'Explore Features', href: '#features' },
  { name: 'Team', href: '#team' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, login, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [clientSideAuth, setClientSideAuth] = useState(false)

  // Check authentication on client side as fallback
  useEffect(() => {
    const token = Cookies.get('authToken')
    const isValid = token && token !== 'undefined' && token !== 'null' && token.trim().length >= 15
    setClientSideAuth(!!isValid)
  }, [pathname])

  // Use client-side auth check if on dashboard routes, otherwise use context
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const effectiveAuth = isDashboardRoute ? clientSideAuth : isAuthenticated


  const handleAuthAction = async () => {
    if (effectiveAuth) {
      logout()
      router.push('/')
    } else {
      router.push('/login')
    }
  }

  return (
    <header className="glass-navbar sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">SEBI Compliance</span>
            </div>
            <nav className="hidden md:block ml-10">
              <div className="flex space-x-4">
                {effectiveAuth ? (
                  // Authenticated navigation
                  navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    )
                  })
                ) : (
                  // Landing page navigation
                  landingNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))
                )}
              </div>
            </nav>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleAuthAction}>
                {effectiveAuth ? (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - always render but conditionally show */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
          {effectiveAuth ? (
            // Authenticated mobile navigation
            navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })
          ) : (
            // Landing page mobile navigation
            landingNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))
          )}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 pb-3">
          <div className="flex items-center px-5">
            <Button variant="ghost" size="sm" className="w-full" onClick={handleAuthAction}>
              {effectiveAuth ? (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
