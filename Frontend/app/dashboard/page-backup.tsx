'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload,
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  FileText,
  Plus,
  RefreshCw,
  Bell,
  Clock,
  Activity,
  Database,
  Zap,
  Shield,
  Target,
  Users
} from 'lucide-react'

interface DashboardData {
  overview: {
    totalDocuments: number
    complianceRate: number
    averageScore: number
    highRiskItems: number
    processingTime: number
    backendHealth: string
  } | null
  documents: any[] | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    overview: null,
    documents: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  // Simple fetch function without polling
  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Test connectivity first
      const healthResponse = await fetch('http://127.0.0.1:8000/health')
      if (!healthResponse.ok) {
        throw new Error('Backend not available')
      }

      // Fetch overview data
      const overviewResponse = await fetch('http://127.0.0.1:8000/api/dashboard/overview')
      const overviewData = await overviewResponse.json()

      // Fetch documents data
      const documentsResponse = await fetch('http://127.0.0.1:8000/api/dashboard/documents')
      const documentsData = await documentsResponse.json()

      setDashboardData({
        overview: overviewData.data,
        documents: documentsData.data || [],
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      })

    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error)
      setDashboardData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load dashboard data'
      }))
    }
  }

  // Load initial data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const { overview, documents, isLoading, error, lastUpdated } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Monitor your SEBI compliance analysis and document processing
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
          <Button onClick={fetchDashboardData} size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/upload">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Upload Document</p>
                  <p className="text-sm text-muted-foreground">Upload PDF for analysis</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/documents">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">View Documents</p>
                  <p className="text-sm text-muted-foreground">Browse analyzed docs</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/analysis">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Analytics</p>
                  <p className="text-sm text-muted-foreground">View detailed insights</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/reports">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold">Reports</p>
                  <p className="text-sm text-muted-foreground">Compliance reports</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : overview?.totalDocuments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Documents processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${overview?.complianceRate || 0}%`}
            </div>
            <Progress value={overview?.complianceRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : overview?.averageScore || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? '...' : overview?.highRiskItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading documents...
                </div>
              ) : documents && documents.length > 0 ? (
                documents.slice(0, 3).map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.fileName || `Document ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {doc.overallScore || 75}% • {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">
                      {doc.riskLevel || 'low'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                  <Link href="/dashboard/upload">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload First Document
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Backend Service</span>
                </div>
                <Badge variant={error ? 'destructive' : 'default'}>
                  {error ? (
                    <><AlertTriangle className="h-3 w-3 mr-1" />Offline</>
                  ) : (
                    <><CheckCircle className="h-3 w-3 mr-1" />Online</>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Processing Time</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {overview?.processingTime || 0}ms
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <Badge variant="secondary">
                  0 unread
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Health Status</span>
                </div>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {overview?.backendHealth || 'Healthy'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  Connection Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
