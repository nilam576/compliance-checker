'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Zap,
  Activity,
  RefreshCw
} from 'lucide-react'

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  file: File | null
  result: any | null
  error: string | null
}

interface ProcessingStage {
  id: string
  name: string
  description: string
  completed: boolean
  active: boolean
}

export default function UploadPage() {
  const router = useRouter()
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    file: null,
    result: null,
    error: null
  })

  const [processingStages, setProcessingStages] = useState<ProcessingStage[]>([
    { id: 'upload', name: 'File Upload', description: 'Uploading document to server', completed: false, active: false },
    { id: 'extract', name: 'Text Extraction', description: 'Extracting text from PDF document', completed: false, active: false },
    { id: 'analyze', name: 'Content Analysis', description: 'Analyzing document content and structure', completed: false, active: false },
    { id: 'compliance', name: 'Compliance Check', description: 'Checking SEBI regulatory compliance', completed: false, active: false },
    { id: 'complete', name: 'Processing Complete', description: 'Analysis results ready for review', completed: false, active: false }
  ])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setUploadState(prev => ({
          ...prev,
          error: 'Please select a PDF file. Other file types are not supported.',
          status: 'error'
        }))
        return
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setUploadState(prev => ({
          ...prev,
          error: 'File size too large. Maximum size is 50MB.',
          status: 'error'
        }))
        return
      }

      setUploadState(prev => ({
        ...prev,
        file,
        error: null,
        status: 'idle'
      }))
    }
  }, [])

  const updateProcessingStage = useCallback((stageId: string, active: boolean, completed: boolean = false) => {
    setProcessingStages(prev => prev.map(stage => ({
      ...stage,
      active: stage.id === stageId ? active : false,
      completed: stage.id === stageId ? completed : stage.completed
    })))
  }, [])

  const handleUpload = useCallback(async () => {
    if (!uploadState.file) return

    setUploadState(prev => ({ ...prev, status: 'uploading', progress: 0, error: null }))

    try {
      // Stage 1: Upload
      updateProcessingStage('upload', true)
      setUploadState(prev => ({ ...prev, progress: 10 }))

      const formData = new FormData()
      formData.append('file', uploadState.file)
      formData.append('lang', 'English')

      // Stage 2: Processing
      updateProcessingStage('upload', false, true)
      updateProcessingStage('extract', true)
      setUploadState(prev => ({ ...prev, status: 'processing', progress: 25 }))

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/upload-pdf/`, {
        method: 'POST',
        body: formData
      })

      // Stage 3: Analysis
      updateProcessingStage('extract', false, true)
      updateProcessingStage('analyze', true)
      setUploadState(prev => ({ ...prev, progress: 50 }))

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail?.message || `HTTP ${response.status} error`)
      }

      // Stage 4: Compliance Check
      updateProcessingStage('analyze', false, true)
      updateProcessingStage('compliance', true)
      setUploadState(prev => ({ ...prev, progress: 75 }))

      const result = await response.json()

      // Stage 5: Complete
      updateProcessingStage('compliance', false, true)
      updateProcessingStage('complete', true, true)
      setUploadState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        result
      }))

      console.log('✅ Upload and processing completed:', result)

    } catch (error: any) {
      console.error('❌ Upload failed:', error)
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to process document. Please try again.',
        progress: 0
      }))

      // Reset processing stages
      setProcessingStages(prev => prev.map(stage => ({
        ...stage,
        active: false,
        completed: false
      })))
    }
  }, [uploadState.file, updateProcessingStage])

  const handleViewResults = useCallback(() => {
    if (uploadState.result && uploadState.file) {
      // Use the document_id returned from the backend API
      const documentId = uploadState.result.document_id

      if (documentId) {
        // Navigate directly to the analysis page - data is stored in GCS
        router.push(`/dashboard/analysis/${documentId}`)
      } else {
        // Fallback: create localStorage entry for older uploads
        const analysisData = {
          fileName: uploadState.file.name,
          fileSize: `${(uploadState.file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
          summary: uploadState.result.summary || 'Analysis completed successfully',
          timelines: uploadState.result.timelines || {},
          clauses: uploadState.result.clauses || [],
          compliance_results: uploadState.result.compliance_results || {},
          overallScore: calculateOverallScore(uploadState.result)
        }

        const fallbackDocumentId = `doc_${Date.now()}`
        localStorage.setItem(`analysis_${fallbackDocumentId}`, JSON.stringify(analysisData))
        router.push(`/dashboard/analysis/${fallbackDocumentId}`)
      }
    }
  }, [uploadState.result, uploadState.file, router])

  const calculateOverallScore = (result: any) => {
    if (result.clauses && Array.isArray(result.clauses)) {
      // Simple scoring based on clause count
      return Math.min(100, Math.max(0, 75 + result.clauses.length * 2))
    }
    return 75 // Default score
  }

  const resetUpload = useCallback(() => {
    setUploadState({
      status: 'idle',
      progress: 0,
      file: null,
      result: null,
      error: null
    })
    setProcessingStages(prev => prev.map(stage => ({
      ...stage,
      active: false,
      completed: false
    })))
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Upload</h1>
        <p className="text-muted-foreground">
          Upload PDF documents for SEBI compliance analysis
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Card */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadState.status === 'idle' && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Select a PDF document</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a PDF file to analyze for SEBI compliance
                  </p>
                  <div className="flex justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 50MB • PDF files only
                  </p>
                </div>
              </div>
            )}

            {uploadState.file && uploadState.status === 'idle' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <File className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">{uploadState.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Badge variant="secondary">PDF</Badge>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpload} className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Start Analysis
                  </Button>
                  <Button variant="outline" onClick={resetUpload}>
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {uploadState.status === 'error' && uploadState.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {uploadState.error}
                  </p>
                </div>
              </div>
            )}

            {uploadState.status === 'completed' && uploadState.result && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Document analysis completed successfully!
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleViewResults} className="flex-1">
                    <Activity className="h-4 w-4 mr-2" />
                    View Analysis Results
                  </Button>
                  <Button variant="outline" onClick={resetUpload}>
                    Upload Another
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Status */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Processing Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadState.status !== 'idle' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{uploadState.progress}%</span>
                </div>
                <Progress value={uploadState.progress} className="h-2" />
              </div>
            )}

            <div className="space-y-3">
              {processingStages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${stage.completed ? 'bg-green-50 dark:bg-green-900/20' :
                      stage.active ? 'bg-blue-50 dark:bg-blue-900/20' :
                        'bg-gray-50 dark:bg-gray-800/50'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${stage.completed ? 'bg-green-500' :
                      stage.active ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                    {stage.completed ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : stage.active ? (
                      <RefreshCw className="h-3 w-3 text-white animate-spin" />
                    ) : (
                      <Clock className="h-3 w-3 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${stage.completed ? 'text-green-700 dark:text-green-300' :
                        stage.active ? 'text-blue-700 dark:text-blue-300' :
                          'text-gray-600 dark:text-gray-400'
                      }`}>
                      {stage.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stage.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Preview */}
      {uploadState.status === 'completed' && uploadState.result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Analysis Results Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {uploadState.result.clauses?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Clauses Found</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {calculateOverallScore(uploadState.result)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {Object.keys(uploadState.result.timelines || {}).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Timelines</p>
                </div>
              </div>

              {uploadState.result.summary && (
                <div>
                  <h4 className="font-semibold mb-2">Document Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {uploadState.result.summary.slice(0, 200)}...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
