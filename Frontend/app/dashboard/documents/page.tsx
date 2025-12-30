'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  Share,
  Loader2
} from 'lucide-react'

interface Document {
  id: string
  fileName: string
  fileSize: string
  uploadedAt: string
  processedAt: string
  summary: string
  overallScore: number
  riskLevel: 'high' | 'medium' | 'low' | 'compliant'
  totalClauses: number
  compliantClauses: number
  nonCompliantClauses: number
  highRiskClauses: number
  mediumRiskClauses: number
  lowRiskClauses: number
  complianceRate: number
  status: 'completed' | 'processing' | 'failed' | 'pending' | 'unknown'
  language: string
  contentType: string
}

export default function DocumentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('uploadedAt')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRisk, setFilterRisk] = useState('all')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-127310351608.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/dashboard/documents`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      if (result.status === 'success') {
        setDocuments(result.data || [])
      } else {
        throw new Error(result.message || 'Failed to fetch documents')
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching documents')
      
      // Fallback to empty array on error
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleRefresh = () => {
    fetchDocuments()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'processing':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRiskBadge = (riskLevel: string, status: string) => {
    if (status !== 'completed') return null
    
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>
      case 'medium':
        return <Badge variant="secondary">Medium Risk</Badge>
      case 'low':
        return <Badge variant="outline">Low Risk</Badge>
      case 'compliant':
        return <Badge variant="default" className="bg-green-100 text-green-800">Compliant</Badge>
      default:
        return null
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    const matchesRisk = filterRisk === 'all' || doc.riskLevel === filterRisk
    return matchesSearch && matchesStatus && matchesRisk
  })

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'fileName':
        return a.fileName.localeCompare(b.fileName)
      case 'uploadedAt':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      case 'score':
        return b.overallScore - a.overallScore
      default:
        return 0
    }
  })

  const handleViewDocument = (id: string) => {
    router.push(`/dashboard/analysis/${id}`)
  }

  const handleDeleteDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        console.log('Deleting document:', id)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-127310351608.us-central1.run.app'
        const response = await fetch(`${apiUrl}/api/dashboard/documents/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error(`Failed to delete document: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('Document deleted successfully:', result)
        
        // Refresh the documents list
        handleRefresh()
      } catch (err) {
        console.error('Error deleting document:', err)
        alert(err instanceof Error ? err.message : 'Failed to delete document')
      }
    }
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedDocuments(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return
    
    if (confirm(`Are you sure you want to delete ${selectedDocuments.size} document(s)?`)) {
      setIsDeleting(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-127310351608.us-central1.run.app'
        const deletePromises = Array.from(selectedDocuments).map(id =>
          fetch(`${apiUrl}/api/dashboard/documents/${id}`, {
            method: 'DELETE',
          })
        )
        
        const results = await Promise.allSettled(deletePromises)
        
        const successCount = results.filter(r => r.status === 'fulfilled').length
        const failCount = results.filter(r => r.status === 'rejected').length
        
        console.log(`Bulk delete: ${successCount} succeeded, ${failCount} failed`)
        
        if (failCount > 0) {
          alert(`Deleted ${successCount} document(s). ${failCount} failed.`)
        }
        
        // Clear selection and refresh
        setSelectedDocuments(new Set())
        handleRefresh()
      } catch (err) {
        console.error('Error during bulk delete:', err)
        alert('An error occurred during bulk delete')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const stats = {
    total: documents.length,
    completed: documents.filter(d => d.status === 'completed').length,
    processing: documents.filter(d => d.status === 'processing').length,
    failed: documents.filter(d => d.status === 'failed').length,
    averageScore: documents.filter(d => d.status === 'completed').reduce((acc, doc) => acc + doc.overallScore, 0) / documents.filter(d => d.status === 'completed').length || 0
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FileText className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Document Management</h1>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-muted-foreground">
                View and manage all your analyzed documents from Google Cloud Storage
              </p>
              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                  {error}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {selectedDocuments.size > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={handleBulkDelete} 
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedDocuments.size})
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => router.push('/dashboard/upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Document
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              <p className="text-sm text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Avg. Score</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-48">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uploadedAt">Upload Date</SelectItem>
                    <SelectItem value="fileName">Name</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documents ({sortedDocuments.length})</CardTitle>
                {filteredDocuments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading documents from Google Cloud Storage...</p>
                  </div>
                </div>
              ) : (
                <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedDocuments.map((document, index) => (
                  <motion.div
                    key={document.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-start pt-1">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.has(document.id)}
                          onChange={() => handleToggleSelect(document.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-lg">{document.fileName}</h3>
                          {getStatusBadge(document.status)}
                          {getRiskBadge(document.riskLevel, document.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(document.uploadedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {document.contentType?.includes('pdf') ? 'PDF' : 'DOC'} • {document.fileSize}
                          </div>
                          {document.status === 'completed' && (
                            <>
                              <div>
                                Score: <span className="font-medium">{document.overallScore?.toFixed(1) || 0}%</span>
                              </div>
                              <div>
                                Clauses: <span className="font-medium">{document.compliantClauses}/{document.totalClauses}</span>
                              </div>
                            </>
                          )}
                          {document.status === 'processing' && (
                            <div className="col-span-2">
                              <span className="font-medium">Processing document...</span>
                            </div>
                          )}
                        </div>
                        
                        {document.status === 'completed' && document.processedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Analyzed on {new Date(document.processedAt).toLocaleString()} • Language: {document.language}
                          </p>
                        )}
                        
                        {document.summary && document.status === 'completed' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {document.summary.length > 150 ? document.summary.substring(0, 150) + '...' : document.summary}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {document.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(document.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Analysis
                          </Button>
                        )}
                        
                        {document.status === 'failed' && (
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                  ))}
                </div>
                
                {!loading && sortedDocuments.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">No documents found</p>
                    <p className="text-sm text-gray-500">
                      {searchTerm || filterStatus !== 'all' || filterRisk !== 'all' 
                        ? 'Try adjusting your filters'
                        : error 
                          ? 'Unable to load documents from Google Cloud Storage'
                          : 'Upload your first document to get started'
                      }
                    </p>
                    {error && (
                      <Button variant="outline" className="mt-4" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    )}
                  </div>
                )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
