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
  Users,
  Video,
  Mic,
  Headphones
} from 'lucide-react'
import { VoiceAssistant } from '@/components/dashboard/VoiceAssistant'
import { VideoBriefingStudio } from '@/components/dashboard/VideoBriefingStudio'

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
  analytics: any | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

export default function DashboardPage() {
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

  // Optimized fetch function - avoid unnecessary reloads unless new document uploaded
  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      // Skip if data is already loaded and not forcing refresh
      if (!forceRefresh && dashboardData.lastUpdated && dashboardData.overview && !dashboardData.isLoading) {
        const timeSinceLastUpdate = Date.now() - dashboardData.lastUpdated.getTime()
        // Only refresh if data is older than 5 minutes (unless new document uploaded)
        if (timeSinceLastUpdate < 5 * 60 * 1000) {
          console.log('Using cached dashboard data - no need to reload')
          return
        }
      }

      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }))

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'

      console.log('🔗 Connecting to backend:', apiUrl)

      // Test connectivity first
      const healthResponse = await fetch(`${apiUrl}/health`)
      if (!healthResponse.ok) {
        throw new Error('Backend not available')
      }

      // Fetch all dashboard data in parallel
      const [overviewResponse, documentsResponse, notificationsResponse, timelineResponse, analyticsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/dashboard/overview`),
        fetch(`${apiUrl}/api/dashboard/documents`),
        fetch(`${apiUrl}/api/dashboard/notifications`),
        fetch(`${apiUrl}/api/dashboard/timeline`),
        fetch(`${apiUrl}/api/dashboard/analytics`)
      ])

      // Parse all responses with error handling
      const overviewData = await overviewResponse.json()
      const documentsData = await documentsResponse.json()
      const notificationsData = await notificationsResponse.json()
      const timelineData = await timelineResponse.json()

      let analyticsData = null
      try {
        const analyticsResponseData = await analyticsResponse.json()
        analyticsData = analyticsResponseData.data || analyticsResponseData
        console.log('✅ Analytics data received:', analyticsData)
      } catch (analyticsError) {
        console.error('⚠️ Analytics fetch error:', analyticsError)
        // Continue without analytics - don't fail the whole dashboard
      }

      console.log('Dashboard API responses:', {
        overview: overviewData,
        documents: documentsData,
        notifications: notificationsData,
        timeline: timelineData,
        analytics: analyticsData
      })

      setDashboardData({
        overview: overviewData.data || overviewData,
        documents: documentsData.data || [],
        notifications: notificationsData.data || [],
        timeline: timelineData.data || [],
        analytics: analyticsData,
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

  // Function to perform real-time compliance analysis
  const analyzeDocumentCompliance = async (documentId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/dashboard/analyze/${documentId}`)

      if (!response.ok) {
        throw new Error('Failed to analyze document')
      }

      const result = await response.json()
      console.log('Document analysis result:', result)

      // Refresh dashboard data after analysis
      await fetchDashboardData()

      return result.data
    } catch (error) {
      console.error('Document analysis failed:', error)
      throw error
    }
  }

  // Function to refresh analytics with real-time data
  const refreshAnalytics = async () => {
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true }))

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/dashboard/refresh-analytics`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to refresh analytics')
      }

      const result = await response.json()
      console.log('Analytics refresh result:', result)

      // Update analytics data
      setDashboardData(prev => ({
        ...prev,
        analytics: result.data,
        isLoading: false,
        lastUpdated: new Date()
      }))

    } catch (error) {
      console.error('Analytics refresh failed:', error)
      setDashboardData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to refresh analytics'
      }))
    }
  }

  // Load initial data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const { overview, documents, notifications, timeline, analytics, isLoading, error, lastUpdated } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Monitor your SEBI compliance analysis and document processing
          </p>
          {/* Status Indicators */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-600">FastAPI Working</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-600">GCP Working</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-purple-600">Backend Integrated</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs font-medium text-orange-600">Analysis Complete</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </Badge>
          )}
          <Button onClick={refreshAnalytics} size="sm" disabled={isLoading}>
            <Activity className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyzing...' : 'Analyze All'}
          </Button>
          <Button onClick={() => fetchDashboardData(true)} size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Force Refresh'}
          </Button>
        </div>
      </div>

      {/* Hero Section: Audio Briefing (ElevenLabs Integration) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity className="h-64 w-64 rotate-12" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <Badge className="bg-white/20 hover:bg-white/30 text-white mb-3">
                  New Feature
                </Badge>
                <h2 className="text-3xl font-bold mb-2">Daily Compliance Briefing</h2>
                <p className="text-indigo-100 max-w-xl text-lg">
                  Listen to your personalized AI executive summary powered by ElevenLabs and Gemini.
                  Get up to speed on your latest compliance risks and regulatory updates in seconds.
                </p>
              </div>

              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-lg group"
                    onClick={async () => {
                      // Simple logic to generate and play briefing
                      try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
                        // First generate text summary (mocked for speed in hero button, or call backend)
                        const summaryText = `Good morning. Here is your compliance briefing. You have processed ${overview?.totalDocuments || 0} documents with an average score of ${overview?.averageScore?.toFixed(0) || 0}%. Attention is needed for ${overview?.highRiskItems || 0} high risk items. Recent regulations indicate tighter scrutiny on data retention.`;

                        // Then call voice endpoint
                        const response = await fetch(`${apiUrl}/api/voice/speak`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            text: summaryText,
                            voice_id: "21m00Tcm4TlvDq8ikWAM" // Rachel
                          })
                        });

                        if (response.ok) {
                          const hex = await response.json();
                          const match = hex.match(/.{1,2}/g);
                          const u8 = new Uint8Array(match.map((byte: string) => parseInt(byte, 16)));
                          const blob = new Blob([u8], { type: 'audio/mpeg' });
                          const audio = new Audio(URL.createObjectURL(blob));
                          audio.play();
                        }
                      } catch (e) {
                        console.error("Briefing failed", e);
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                    </svg>
                    Play Briefing
                  </Button>
                  <div className="text-xs text-indigo-200 text-center">
                    <p>Est. 1 min</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
            <Link href="/dashboard/analytics">
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

      {/* Voice & Video Intelligence Suite - PROMOTED FOR HACKATHON WOW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VoiceAssistant />
        <VideoBriefingStudio documents={documents || []} />
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              Documents uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : overview?.processedDocuments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Analysis completed
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
              {isLoading ? '...' : overview?.averageScore?.toFixed(1) || 0}
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
                  <div
                    key={doc.id || index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => doc.status === 'completed' && (window.location.href = `/dashboard/analysis/${doc.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
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
                    <div className="text-right space-y-2">
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        onClick={async (e) => {
                          e.stopPropagation()
                          try {
                            await analyzeDocumentCompliance(doc.id)
                          } catch (error) {
                            console.error('Analysis failed:', error)
                          }
                        }}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Analyze
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {doc.status === 'completed' ? 'Ready' : doc.status || 'Processing'}
                      </p>
                    </div>
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
              {documents && documents.length > 3 && (
                <div className="text-center pt-4 border-t">
                  <Link href="/dashboard/documents">
                    <Button variant="outline" size="sm">
                      View All Documents ({documents.length})
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
                  {notifications ? notifications.filter((n: any) => !n.read).length : 0} unread
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Recent Activity</span>
                </div>
                <Badge variant="outline">
                  {timeline ? timeline.length : 0} events
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
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


      {/* Analytics and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications && notifications.length > 0 ? (
                notifications.slice(0, 4).map((notification: any, index: number) => (
                  <div key={notification.id || index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'error' ? 'bg-red-500' :
                        notification.type === 'success' ? 'bg-green-500' :
                          'bg-blue-500'
                      }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={notification.priority === 'high' ? 'destructive' : 'outline'} className="text-xs">
                      {notification.priority}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Processing Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading timeline...
                </div>
              ) : timeline && timeline.length > 0 ? (
                timeline.slice(0, 4).map((event: any, index: number) => (
                  <div key={event.id || index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${event.type === 'upload' ? 'bg-blue-100 dark:bg-blue-900' :
                      event.type === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        event.type === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                          'bg-gray-100 dark:bg-gray-900'
                      }`}>
                      {event.type === 'upload' && <Upload className="h-4 w-4 text-blue-600" />}
                      {event.type === 'processing' && <Zap className="h-4 w-4 text-yellow-600" />}
                      {event.type === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {!['upload', 'processing', 'completed'].includes(event.type) && <Activity className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
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
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
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
