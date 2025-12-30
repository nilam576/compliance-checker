'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  CheckCircle,
  Info,
  Settings,
  X,
  RefreshCw,
  Loader2,
  Mail,
  Check,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'high' | 'medium' | 'low'
  documentId?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendingMail, setSendingMail] = useState<string | null>(null)

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    complianceAlerts: true,
    documentUpdates: true,
    systemNotifications: false,
    weeklyReports: true
  })

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/dashboard/notifications`)

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      if (result.status === 'success') {
        setNotifications(result.data || [])
      } else {
        throw new Error(result.message || 'Failed to fetch notifications')
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching notifications')
    } finally {
      setLoading(false)
    }
  }

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      // Update local state immediately
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )

      // Send API request to mark as read
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/dashboard/notifications/${id}/read`, {
        method: 'PUT',
      })

      if (!response.ok) {
        // Revert local state if API call fails
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: false } : n)
        )
        console.error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Revert local state if API call fails
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: false } : n)
      )
    }
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const sendMail = async (notification: Notification) => {
    try {
      setSendingMail(notification.id)

      // Simulate API call to send email
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/dashboard/notifications/${notification.id}/send-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          type: notification.type
        })
      })

      if (response.ok) {
        // Show success feedback
        alert('Email sent successfully!')
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending mail:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setSendingMail(null)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusBadge = (type: string) => {
    const typeConfig = {
      error: { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
      warning: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: AlertTriangle },
      success: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
      info: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Info }
    } as const

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.info
    const StatusIcon = config.icon

    return (
      <Badge className={`${config.color} border flex items-center gap-1 px-2 py-0.5`}>
        <StatusIcon className="h-3 w-3" />
        <span className="text-xs font-medium capitalize">{type}</span>
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: 'bg-red-500/10 text-red-600 border-red-500/20',
      medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      low: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    } as const

    return (
      <Badge className={`${priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low} border px-2 py-0.5`}>
        <span className="text-xs font-medium capitalize">{priority}</span>
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card
      className={`transition-all hover:shadow-md ${
        !notification.read
          ? 'border-l-4 border-l-primary bg-primary/5 dark:bg-primary/10'
          : 'border-l-4 border-l-transparent'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="mt-1 flex-shrink-0">
            {getIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and Badges */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-semibold text-base ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <div className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {getStatusBadge(notification.type)}
                  {getPriorityBadge(notification.priority)}
                </div>
              </div>
            </div>

            {/* Message */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {notification.message}
            </p>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
              <Info className="h-3 w-3" />
              {formatTimestamp(notification.timestamp)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 ml-2">
            <TooltipProvider>
              {/* Send Mail Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3"
                    onClick={() => sendMail(notification)}
                    disabled={sendingMail === notification.id}
                  >
                    {sendingMail === notification.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send via Email</p>
                </TooltipContent>
              </Tooltip>

              {/* Mark Read Button */}
              {!notification.read && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-3"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as Read</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Delete Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 px-3 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Notification</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Stay updated on compliance status and system events from GCS
          </p>
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              {error}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchNotifications} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="system">Fixed</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading notifications from GCS...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.length > 0 ? notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              )) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">No notifications found</p>
                  <p className="text-xs text-muted-foreground">Process documents to receive notifications</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3 mt-6">
          <div className="space-y-3">
            {notifications.filter(n => !n.read).map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
            {notifications.filter(n => !n.read).length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-2">No unread notifications</p>
                <p className="text-xs text-muted-foreground">You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-3 mt-6">
          <div className="space-y-3">
            {notifications.filter(n => n.priority === 'high' || n.type === 'warning' || n.type === 'error').map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-3 mt-6">
          <div className="space-y-3">
            {notifications.filter(n => n.type === 'info' || n.type === 'success').map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Compliance Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified about compliance issues
                    </p>
                  </div>
                  <Switch
                    checked={settings.complianceAlerts}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, complianceAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Document Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Notifications for document processing status
                    </p>
                  </div>
                  <Switch
                    checked={settings.documentUpdates}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, documentUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">System Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      System maintenance and update notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.systemNotifications}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, systemNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly compliance summary reports
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
