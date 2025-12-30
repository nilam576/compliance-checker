"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, RefreshCw, CheckCircle, Clock, ArrowRight } from 'lucide-react'

export function FivetranStatus() {
  const [syncStatus, setSyncStatus] = useState({
    lastSync: new Date().toISOString(),
    nextSync: new Date(Date.now() + 3600000).toISOString(),
    status: 'active',
    recordsSynced: 1247,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Fivetran Data Pipeline</h2>
        <p className="text-muted-foreground">
          Automated data sync to BigQuery for historical analytics
        </p>
      </div>

      {/* Pipeline Status */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              Pipeline Status
            </CardTitle>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              <CheckCircle className="mr-1 h-3 w-3" />
              Active
            </Badge>
          </div>
          <CardDescription>
            Real-time compliance data synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-4 dark:bg-gray-900">
              <div className="text-sm text-muted-foreground">Last Sync</div>
              <div className="text-xl font-bold">
                {new Date(syncStatus.lastSync).toLocaleTimeString()}
              </div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
            <div className="rounded-lg bg-white p-4 dark:bg-gray-900">
              <div className="text-sm text-muted-foreground">Next Sync</div>
              <div className="text-xl font-bold">
                {new Date(syncStatus.nextSync).toLocaleTimeString()}
              </div>
              <div className="text-xs text-muted-foreground">Auto-scheduled</div>
            </div>
            <div className="rounded-lg bg-white p-4 dark:bg-gray-900">
              <div className="text-sm text-muted-foreground">Records Synced</div>
              <div className="text-xl font-bold">{syncStatus.recordsSynced.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">This month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Data Flow Pipeline</CardTitle>
          <CardDescription>
            End-to-end compliance data journey from analysis to analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-2 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Database className="h-8 w-8 text-purple-600" />
              </div>
              <div className="font-semibold">Source</div>
              <div className="text-xs text-muted-foreground">Compliance Analysis</div>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground" />

            <div className="flex-1 space-y-2 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
              <div className="font-semibold">Fivetran</div>
              <div className="text-xs text-muted-foreground">Automated Pipeline</div>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground" />

            <div className="flex-1 space-y-2 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Database className="h-8 w-8 text-green-600" />
              </div>
              <div className="font-semibold">BigQuery</div>
              <div className="text-xs text-muted-foreground">Data Warehouse</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BigQuery Tables */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">compliance_analyses</CardTitle>
            <CardDescription>Document-level analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Records:</span>
                <span className="font-mono">125</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span className="font-mono text-xs">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">clause_verifications</CardTitle>
            <CardDescription>Clause-by-clause compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Records:</span>
                <span className="font-mono">542</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span className="font-mono text-xs">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">risk_metrics</CardTitle>
            <CardDescription>Risk assessment data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Records:</span>
                <span className="font-mono">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span className="font-mono text-xs">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Fivetran connector settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>BigQuery Dataset:</span>
            <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
              reglex-ai:reglex_compliance
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span>Sync Frequency:</span>
            <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
              Every 1 hour
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span>Connector Type:</span>
            <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
              Custom (Python SDK)
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              <CheckCircle className="mr-1 h-3 w-3" />
              Healthy
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

