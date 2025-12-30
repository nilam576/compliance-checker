'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  FileText, 
  BarChart3, 
  Bell, 
  Calendar,
  Settings,
  Home,
  TrendingUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const navItems = [
  {
    title: 'Overview',
    href: '/dashboard/overview',
    icon: LayoutDashboard,
    description: 'Dashboard overview and key metrics'
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
    description: 'Manage and analyze documents'
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: TrendingUp,
    description: 'Kibana & Fivetran Analytics',
    badge: '🔥'
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    description: 'Generate and export reports'
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    description: 'System alerts and updates',
    badge: 2 // Unread notifications count
  },
  {
    title: 'Timeline',
    href: '/dashboard/timeline',
    icon: Calendar,
    description: 'Activity timeline and history'
  }
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {/* Main Dashboard Link */}
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
          pathname === '/dashboard' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Home className="h-4 w-4" />
        Dashboard Home
      </Link>

      {/* Navigation Items */}
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || 
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted group",
              isActive 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title={item.description}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </div>
            {item.badge && (
              <Badge 
                variant={isActive ? "secondary" : "default"} 
                className="ml-auto text-xs"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
