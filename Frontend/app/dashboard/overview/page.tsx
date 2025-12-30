'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Database,
  Zap,
  Shield,
  BarChart3,
  Target,
  Upload,
  RefreshCw,
  Bell,
  Users,
  CheckCircle,
  Loader2,
  Eye,
  ArrowUpRight
} from 'lucide-react'

interface DashboardData {
  overview: {
    totalDocuments: number
    processedDocuments: number
    complianceRate: number
    averageScore: number
    highRiskItems: number
    processingTime: number
    backendHealth: string
    lastUpdated: string
  } | null
  documents: any[] | null
  notifications: any[] | null
  timeline: any[] | null
  analytics: {
    complianceTrend: Array<{ date: string; score: number }>
    riskDistribution: { high: number; medium: number; low: number; compliant: number }
    processingStats: { averageTime: number; successRate: number; totalProcessed: number }
    complianceAreas: Record<string, number>
  } | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

export default function OverviewPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    overview: null,
    documents: null,
    notifications: null,
    timeline: null,
    analytics: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  // Optimized fetch function for dashboard data - avoid unnecessary reloads
  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      // Skip if data is already loaded and not forcing refresh
      if (!forceRefresh && dashboardData.lastUpdated && dashboardData.analytics && !dashboardData.isLoading) {
        const timeSinceLastUpdate = Date.now() - dashboardData.lastUpdated.getTime()
        // Only refresh if data is older than 5 minutes
        if (timeSinceLastUpdate < 5 * 60 * 1000) {
          console.log('Using cached dashboard data')
          return
        }
      }

      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }))
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      
      // Test connectivity first
      const healthResponse = await fetch(`${apiUrl}/health`)
      if (!healthResponse.ok) {
        throw new Error('Backend not available')
      }

      // Fetch all dashboard data in parallel for optimal performance
      const [overviewResponse, documentsResponse, notificationsResponse, timelineResponse, analyticsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/dashboard/overview`),
        fetch(`${apiUrl}/api/dashboard/documents`),
        fetch(`${apiUrl}/api/dashboard/notifications`),
        fetch(`${apiUrl}/api/dashboard/timeline`),
        fetch(`${apiUrl}/api/dashboard/analytics`)
      ])

      // Parse all responses
      const overviewData = await overviewResponse.json()
      const documentsData = await documentsResponse.json()
      const notificationsData = await notificationsResponse.json()
      const timelineData = await timelineResponse.json()
      const analyticsData = await analyticsResponse.json()

      console.log('Analytics data received:', analyticsData.data)

      setDashboardData({
        overview: overviewData.data || overviewData,
        documents: documentsData.data || [],
        notifications: notificationsData.data || [],
        timeline: timelineData.data || [],
        analytics: analyticsData.data || null,
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

  const { overview, documents, notifications, timeline, analytics, isLoading, error, lastUpdated } = dashboardData

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive SEBI compliance monitoring from Google Cloud Storage
          </p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={() => fetchDashboardData(true)} size="sm" disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Link href="/dashboard/upload">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
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
                <Button variant="outline" size="sm" onClick={() => fetchDashboardData(true)} className="ml-auto">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Key Metrics Overview */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overview?.totalDocuments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Stored in GCS
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overview?.processedDocuments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Analysis completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${overview?.complianceRate || 0}%`}
            </div>
            <Progress value={overview?.complianceRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overview?.averageScore?.toFixed(1) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overview?.highRiskItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard/upload">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </Link>
              <Link href="/dashboard/documents">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" onClick={() => fetchDashboardData(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts and Analytics */}
      <motion.div 
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Compliance Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Compliance Trend
            </CardTitle>
            <CardDescription>
              Daily compliance scores from GCS data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : analytics?.complianceTrend && analytics.complianceTrend.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                  {analytics.complianceTrend.map((point, index) => {
                    const heightPercentage = Math.max((point.score / 100) * 100, 2) // Ensure minimum 2% height
                    const barHeight = Math.max((heightPercentage / 100) * 200, 8) // Minimum 8px height
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1 max-w-16">
                        <div className="text-xs font-medium text-center mb-1">
                          {point.score}%
                        </div>
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer shadow-sm"
                          style={{
                            height: `${barHeight}px`,
                            minHeight: '8px'
                          }}
                          title={`${point.score}% compliance on ${point.date}`}
                        />
                        <div className="text-xs text-muted-foreground mt-2 text-center">
                          {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-3">
                  <span className="text-muted-foreground">Last 7 days trend</span>
                  <span className="font-medium">
                    Current: {analytics.complianceTrend[analytics.complianceTrend.length - 1]?.score || 0}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                <p>No trend data available</p>
                <p className="text-xs">Upload and process documents to see trends</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Distribution
            </CardTitle>
            <CardDescription>
              Current risk levels across all documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : analytics?.riskDistribution ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-red-500 rounded-full" />
                      <span className="text-sm font-medium">High Risk</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{analytics.riskDistribution.high}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-yellow-500 rounded-full" />
                      <span className="text-sm font-medium">Medium Risk</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{analytics.riskDistribution.medium}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium">Low Risk</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{analytics.riskDistribution.low}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium">Compliant</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{analytics.riskDistribution.compliant}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Processing Success Rate</span>
                    <span className="font-medium">{analytics.processingStats.successRate}%</span>
                  </div>
                  <Progress value={analytics.processingStats.successRate} className="mt-2" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Shield className="h-12 w-12 mb-4 opacity-50" />
                <p>No risk data available</p>
                <p className="text-xs">Process documents to see risk distribution</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* System Status and Recent Activity */}
      <motion.div 
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Backend and GCS connectivity status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
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
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">GCS Storage</span>
                </div>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Processing Time</span>
                </div>
                <span className="text-sm font-medium">
                  {overview?.processingTime || 0}ms avg
                </span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <Badge variant="secondary">
                  {notifications ? notifications.filter((n: any) => !n.read).length : 0} unread
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest document processing events from GCS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading activity...
                </div>
              ) : timeline && timeline.length > 0 ? (
                timeline.slice(0, 5).map((event: any, index: number) => (
                  <div key={event.id || index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.type === 'upload' ? 'bg-blue-100 dark:bg-blue-900' :
                      event.type === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      event.type === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                      'bg-gray-100 dark:bg-gray-900'
                    }`}>
                      {event.type === 'upload' && <Upload className="h-4 w-4 text-blue-600" />}
                      {event.type === 'processing' && <Zap className="h-4 w-4 text-yellow-600" />}
                      {event.type === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {!['upload', 'processing', 'completed'].includes(event.type) && <Activity className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">No recent activity</p>
                  <p className="text-xs text-muted-foreground">Upload documents to see processing activity</p>
                </div>
              )}
            </div>
            {timeline && timeline.length > 5 && (
              <div className="text-center pt-4 border-t">
                <Link href="/dashboard/timeline">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Activity
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Documents Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
            </CardTitle>
            <CardDescription>
              Latest uploaded documents and their analysis status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading documents...
                </div>
              ) : documents && documents.length > 0 ? (
                documents.slice(0, 4).map((doc, index) => (
                  <div 
                    key={doc.id || index} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => doc.status === 'completed' && router.push(`/dashboard/analysis/${doc.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.fileName || `Document ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {doc.overallScore?.toFixed(1) || 0}% • {new Date(doc.uploadedAt || doc.processedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doc.totalClauses || 0} clauses • {doc.fileSize}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <Badge 
                        variant={
                          doc.riskLevel === 'high' ? 'destructive' : 
                          doc.riskLevel === 'medium' ? 'secondary' : 
                          doc.riskLevel === 'low' || doc.riskLevel === 'compliant' ? 'default' : 
                          'outline'
                        }
                      >
                        {doc.riskLevel || 'unknown'}
                      </Badge>
                      {doc.status === 'completed' && (
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                  <Link href="/dashboard/upload">
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Your First Document
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            {documents && documents.length > 4 && (
              <div className="text-center pt-4 border-t">
                <Link href="/dashboard/documents">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Documents ({documents.length})
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
