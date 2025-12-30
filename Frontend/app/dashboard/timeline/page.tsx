'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, FileText, AlertTriangle, CheckCircle, Filter, ArrowRight, RefreshCw, Loader2 } from 'lucide-react'

interface TimelineEvent {
  id: string
  type: 'upload' | 'processing' | 'completed' | 'document' | 'compliance' | 'risk' | 'system'
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'processing' | 'pending' | 'failed'
  documentId?: string
}

// Helper to normalize event types from backend
const normalizeEventType = (event: TimelineEvent): TimelineEvent => {
  // Map backend types to frontend filter types
  if (event.type === 'upload' || event.type === 'completed') {
    return { ...event, type: 'document' }
  }
  if (event.type === 'processing') {
    return { ...event, type: 'system' }
  }
  return event
}

export default function TimelinePage() {
  const [filterType, setFilterType] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('7d')
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch timeline events from API
  const fetchTimelineEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/dashboard/timeline`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch timeline events: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      if (result.status === 'success') {
        // Normalize event types to match frontend filters
        const normalizedEvents = (result.data || []).map(normalizeEventType)
        console.log('Timeline events received:', normalizedEvents)
        console.log('Event types:', normalizedEvents.map(e => e.type))
        setTimelineEvents(normalizedEvents)
      } else {
        throw new Error(result.message || 'Failed to fetch timeline events')
      }
    } catch (err) {
      console.error('Error fetching timeline events:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching timeline events')
    } finally {
      setLoading(false)
    }
  }

  // Load timeline events on component mount
  useEffect(() => {
    fetchTimelineEvents()
  }, [])


  const getIcon = (type: string, status: string) => {
    if (status === 'failed') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    if (status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    
    switch (type) {
      case 'document': return <FileText className="h-4 w-4 text-blue-500" />
      case 'compliance': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'system': return <Clock className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default">Completed</Badge>
      case 'failed': return <Badge variant="destructive">Failed</Badge>
      case 'in-progress': return <Badge variant="secondary">In Progress</Badge>
      case 'pending': return <Badge variant="outline">Pending</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes} minutes ago`
    } else if (hours < 24) {
      return `${Math.floor(hours)} hours ago`
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }
  }

  const filteredEvents = timelineEvents.filter(event => {
    if (filterType === 'all') return true
    // Additional fallback matching for flexibility
    if (filterType === 'document' && (event.type === 'document' || event.type === 'upload')) return true
    if (filterType === 'system' && (event.type === 'system' || event.type === 'processing')) return true
    return event.type === filterType
  })
  
  console.log(`Filter: ${filterType}, Total events: ${timelineEvents.length}, Filtered: ${filteredEvents.length}`)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Timeline
            {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground">
            Track all document processing and compliance activities from GCS
          </p>
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              {error}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTimelineEvents} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Export Timeline
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filterType} onValueChange={setFilterType}>
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="document">Documents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading timeline events from GCS...</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                <div key={event.id} className="relative flex items-start gap-6">
                  {/* Timeline Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background">
                      {getIcon(event.type, event.status)}
                    </div>
                  </div>

                  {/* Event Card */}
                  <Card className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{event.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatTimestamp(event.timestamp)}</span>
                            <ArrowRight className="h-3 w-3" />
                            {getStatusBadge(event.status)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {event.description}
                      </p>
                      
                    </CardContent>
                  </Card>
                </div>
                )) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No events found</h3>
                    <p className="text-muted-foreground">
                      {error ? 'Unable to load timeline events from GCS' : 'No timeline events match the current filter criteria.'}
                    </p>
                    {error && (
                      <Button variant="outline" className="mt-4" onClick={fetchTimelineEvents}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="document" className="mt-6">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {timelineEvents.filter(e => e.type === 'document').length > 0 ? timelineEvents.filter(e => e.type === 'document').map((event) => (
                <div key={event.id} className="relative flex items-start gap-6">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background">
                      {getIcon(event.type, event.status)}
                    </div>
                  </div>
                  <Card className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{event.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatTimestamp(event.timestamp)}</span>
                            <ArrowRight className="h-3 w-3" />
                            {getStatusBadge(event.status)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No document events found</h3>
                  <p className="text-muted-foreground">
                    No document-related events in the selected time range.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {timelineEvents.filter(e => e.type === 'compliance').length > 0 ? timelineEvents.filter(e => e.type === 'compliance').map((event) => (
                <div key={event.id} className="relative flex items-start gap-6">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background">
                      {getIcon(event.type, event.status)}
                    </div>
                  </div>
                  <Card className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{event.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatTimestamp(event.timestamp)}</span>
                            <ArrowRight className="h-3 w-3" />
                            {getStatusBadge(event.status)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No compliance events found</h3>
                  <p className="text-muted-foreground">
                    No compliance-related events in the selected time range.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="mt-6">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {timelineEvents.filter(e => e.type === 'risk').length > 0 ? timelineEvents.filter(e => e.type === 'risk').map((event) => (
                <div key={event.id} className="relative flex items-start gap-6">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background">
                      {getIcon(event.type, event.status)}
                    </div>
                  </div>
                  <Card className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{event.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatTimestamp(event.timestamp)}</span>
                            <ArrowRight className="h-3 w-3" />
                            {getStatusBadge(event.status)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No risk events found</h3>
                  <p className="text-muted-foreground">
                    No risk-related events in the selected time range.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {timelineEvents.filter(e => e.type === 'system' || e.type === 'processing').length > 0 ? timelineEvents.filter(e => e.type === 'system' || e.type === 'processing').map((event) => (
                <div key={event.id} className="relative flex items-start gap-6">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background">
                      {getIcon(event.type, event.status)}
                    </div>
                  </div>
                  <Card className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{event.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatTimestamp(event.timestamp)}</span>
                            <ArrowRight className="h-3 w-3" />
                            {getStatusBadge(event.status)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No system events found</h3>
                  <p className="text-muted-foreground">
                    No system-related events in the selected time range.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>
            Overview of recent activity across all categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {timelineEvents.filter(e => e.status === 'completed').length}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {timelineEvents.filter(e => e.status === 'failed').length}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {timelineEvents.filter(e => e.type === 'document').length}
              </div>
              <div className="text-xs text-muted-foreground">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {timelineEvents.filter(e => e.type === 'compliance').length}
              </div>
              <div className="text-xs text-muted-foreground">Compliance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
