'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'glass'
}

const sizeVariants = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

export function LoadingSpinner({ 
  className, 
  size = 'md',
  variant = 'default' 
}: LoadingSpinnerProps) {
  return (
    <div className={cn(
      'inline-flex items-center justify-center',
      variant === 'glass' && 'backdrop-blur-md bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20',
      className
    )}>
      <Loader2 className={cn(
        'animate-spin text-primary',
        sizeVariants[size]
      )} />
    </div>
  )
}

interface PageLoaderProps {
  className?: string
  message?: string
}

export function PageLoader({ className, message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-gradient-to-br from-blue-50/50 via-white/50 to-purple-50/50',
      'dark:from-gray-900/50 dark:via-black/50 dark:to-purple-900/50',
      'backdrop-blur-sm',
      className
    )}>
      <div className="glass-card p-8 text-center space-y-4">
        <LoadingSpinner size="xl" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{message}</h3>
          <div className="flex space-x-1 justify-center">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
