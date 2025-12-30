'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Mail,
  Building,
  Globe,
  Lock,
  Smartphone,
  Key
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function ProfilePage() {
  const router = useRouter()
  const [showApiKey, setShowApiKey] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Test User',
    email: 'Test-01@gmail.com',
    company: 'ACME Legal Corp',
    role: 'Legal Compliance Officer',
    phone: '+91 98765 43210',
    timezone: 'Asia/Kolkata',
    language: 'English'
  })
  
  const [preferences, setPreferences] = useState({
    defaultLLM: 'gemini',
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    complianceAlerts: true,
    darkMode: false
  })

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: '2024-01-01',
    activeSessions: 3
  })

  const handleLogout = () => {
    Cookies.remove('authToken')
    router.push('/login')
  }

  const handleSaveProfile = () => {
    // Simulate API call
    console.log('Saving profile:', profile)
  }


  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Simulate account deletion
      handleLogout()
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <User className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Profile & Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </motion.div>

        {/* Profile Overview Card */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                  <p className="text-muted-foreground mb-2">{profile.email}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <Building className="h-3 w-3 mr-1" />
                      {profile.company}
                    </Badge>
                    <Badge variant="outline">
                      {profile.role}
                    </Badge>
                    <Badge variant="outline">
                      <Globe className="h-3 w-3 mr-1" />
                      {profile.timezone}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Job Title</Label>
                      <Input
                        id="role"
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={profile.timezone} onValueChange={(value) => setProfile({ ...profile, timezone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                          <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Application Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="defaultLLM">Default LLM Provider</Label>
                    <Select value={preferences.defaultLLM} onValueChange={(value) => setPreferences({ ...preferences, defaultLLM: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude">Claude 3.5 Sonnet</SelectItem>
                        <SelectItem value="gemini">Gemini Pro</SelectItem>
                        <SelectItem value="openai">GPT-4</SelectItem>
                        <SelectItem value="mistral">Mistral Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={profile.language} onValueChange={(value) => setProfile({ ...profile, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">हिंदी</SelectItem>
                        <SelectItem value="Gujarati">ગુજરાતી</SelectItem>
                        <SelectItem value="Marathi">मराठी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Report Settings</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-muted-foreground">Receive weekly compliance summary</p>
                      </div>
                      <Button
                        variant={preferences.weeklyReports ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreferences({ ...preferences, weeklyReports: !preferences.weeklyReports })}
                      >
                        {preferences.weeklyReports ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Button
                      variant={preferences.emailNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                    >
                      {preferences.emailNotifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        SMS Notifications
                      </p>
                      <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                    </div>
                    <Button
                      variant={preferences.smsNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreferences({ ...preferences, smsNotifications: !preferences.smsNotifications })}
                    >
                      {preferences.smsNotifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Compliance Alerts
                      </p>
                      <p className="text-sm text-muted-foreground">High-priority compliance notifications</p>
                    </div>
                    <Button
                      variant={preferences.complianceAlerts ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreferences({ ...preferences, complianceAlerts: !preferences.complianceAlerts })}
                    >
                      {preferences.complianceAlerts ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button
                      variant={security.twoFactorEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
                    >
                      {security.twoFactorEnabled ? "Enabled" : "Enable"}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="font-medium mb-2">Password</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Last changed: {new Date(security.lastPasswordChange).toLocaleDateString()}
                    </p>
                    <Button variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="font-medium mb-2">API Key</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use this key for API access to your compliance data
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value="sk-abc123def456ghi789jkl..."
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Key className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="font-medium mb-2">Active Sessions</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      You have {security.activeSessions} active sessions
                    </p>
                    <Button variant="outline">
                      View All Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">42</p>
                        <p className="text-sm text-muted-foreground">Documents this month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">156</p>
                        <p className="text-sm text-muted-foreground">API calls this month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">$49</p>
                        <p className="text-sm text-muted-foreground">Current plan</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="font-medium mb-4">Current Plan: Professional</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>✓ 100 documents/month</span>
                        <span>42/100 used</span>
                      </div>
                      <div className="flex justify-between">
                        <span>✓ All LLM providers</span>
                        <span>Included</span>
                      </div>
                      <div className="flex justify-between">
                        <span>✓ Priority support</span>
                        <span>Included</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button>Upgrade Plan</Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="font-medium text-red-800 dark:text-red-400 mb-2">Danger Zone</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Once you delete your account, all data will be permanently removed. This action cannot be undone.
                    </p>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}
