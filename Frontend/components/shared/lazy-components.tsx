'use client'

import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load heavy components
export const LazyComplianceChart = lazy(() => 
  import('@/features/compliance-dashboard/components/ComplianceChart').then(module => ({
    default: module.ComplianceChart
  }))
)

export const LazyFileUpload = lazy(() => 
  import('@/features/document-upload/components/FileUpload').then(module => ({
    default: module.FileUpload
  }))
)

export const LazyLLMProviderSelector = lazy(() => 
  import('@/features/compliance-dashboard/components/LLMProviderSelector').then(module => ({
    default: module.LLMProviderSelector
  }))
)

// Loading fallbacks
export const ChartSkeleton = () => (
  <div className="w-full h-64 rounded-lg border bg-card">
    <div className="p-6 space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-end space-x-2 h-32">
        {[...Array(7)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  </div>
)

export const UploadSkeleton = () => (
  <div className="w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center">
    <div className="text-center space-y-2">
      <Skeleton className="h-8 w-8 mx-auto rounded" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
)

export const SelectorSkeleton = () => (
  <div className="w-full max-w-xs">
    <Skeleton className="h-4 w-20 mb-2" />
    <Skeleton className="h-10 w-full" />
  </div>
)

// Wrapper components with suspense
export function ComplianceChartWithSuspense(props: React.ComponentProps<typeof LazyComplianceChart>) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <LazyComplianceChart {...props} />
    </Suspense>
  )
}

export function FileUploadWithSuspense(props: React.ComponentProps<typeof LazyFileUpload>) {
  return (
    <Suspense fallback={<UploadSkeleton />}>
      <LazyFileUpload {...props} />
    </Suspense>
  )
}

export function LLMProviderSelectorWithSuspense(props: React.ComponentProps<typeof LazyLLMProviderSelector>) {
  return (
    <Suspense fallback={<SelectorSkeleton />}>
      <LazyLLMProviderSelector {...props} />
    </Suspense>
  )
}

// Generic lazy wrapper with custom fallback
export function withLazyLoading<T extends React.ComponentType<any>>(
  LazyComponent: React.LazyExoticComponent<T>,
  fallback?: React.ReactNode
) {
  return function LazyWrapper(props: React.ComponentProps<T>) {
    const defaultFallback = (
      <div className="animate-pulse bg-muted rounded-lg h-32 w-full flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    )

    return (
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}
