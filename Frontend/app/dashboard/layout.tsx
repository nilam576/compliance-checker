import type { Metadata } from 'next'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import ComplianceChat from '@/components/dashboard/ComplianceChat'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Monitor and analyze document compliance with SEBI regulations',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block w-64">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-lg">SEBI Compliance</span>
            </div>
          </div>
          <div className="flex-1 px-3 py-2">
            <DashboardNav />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      {/* Compliance Chat Assistant */}
      <ComplianceChat />
    </div>
  )
}
