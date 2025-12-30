import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-[280px]" />
              <Skeleton className="h-4 w-[400px]" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-[80px]" />
              <Skeleton className="h-9 w-[90px]" />
              <Skeleton className="h-9 w-[120px]" />
            </div>
          </div>
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-80 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>

        {/* Charts section skeleton */}
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  )
}
