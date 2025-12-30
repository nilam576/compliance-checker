'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle, FileText, FileImage, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn, formatBytes } from '@/lib/utils'
import { complianceAPI } from '@/lib/api'
import { RealTimeAnalysisService, AnalysisSession } from '@/lib/realtime-analysis'

interface FileUploadProps {
  onFileSelect?: (files: File[]) => void
  onUploadComplete?: (results?: any) => void
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
  className?: string
  language?: string
}

interface FileWithPreview extends File {
  id: string
  preview?: string
  status: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error'
  progress: number
  error?: string
  sessionId?: string
  currentStage?: string
  analysisResult?: any
}

export function FileUpload({
  onFileSelect,
  onUploadComplete,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.pdf', '.docx', '.txt'],
  className,
  language = 'en',
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejectedFile) => {
          const errors = rejectedFile.errors.map((error: any) => error.message).join(', ')
          toast.error(`File rejected: ${rejectedFile.file.name}`, {
            description: errors
          })
        })
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        const newFiles = acceptedFiles.map((file) => {
          // Preserve the original File object and add custom properties
          const fileWithPreview = Object.assign(file, {
            id: Math.random().toString(36).substr(2, 9),
            status: 'uploading' as const,
            progress: 0,
          }) as FileWithPreview;

          return fileWithPreview;
        });

        setFiles((prev) => [...prev, ...newFiles])
        onFileSelect?.(acceptedFiles)

        // Show notification for uploaded files
        if (acceptedFiles.length === 1) {
          toast.success('File added successfully', {
            description: `${acceptedFiles[0]?.name} is ready for upload`
          })
        } else {
          toast.success(`${acceptedFiles.length} files added successfully`)
        }

        // Start real-time analysis for each file
        newFiles.forEach((file) => {
          startRealTimeAnalysis(file.id, file)
        })
      }
    },
    [onFileSelect]
  )

  const startRealTimeAnalysis = async (fileId: string, file: File) => {
    try {
      // Start analysis session
      const sessionId = RealTimeAnalysisService.startAnalysis(file, language)
      
      // Update file with session ID
      setFiles((prev) =>
        prev.map((f) => 
          f.id === fileId 
            ? { ...f, sessionId, status: 'uploading' as const, currentStage: 'Starting analysis...' }
            : f
        )
      )

      // Subscribe to real-time updates
      const unsubscribe = RealTimeAnalysisService.subscribe(sessionId, (session: AnalysisSession) => {
        setFiles((prev) =>
          prev.map((f) => 
            f.id === fileId 
              ? { 
                  ...f, 
                  progress: session.progress,
                  status: session.status as any,
                  currentStage: session.currentStage,
                  error: session.error,
                  analysisResult: session.result
                }
              : f
          )
        )

        // Handle completion
        if (session.status === 'completed' && session.result) {
          const isMockData = session.result.summary?.includes('[MOCK DATA]')
          toast.success('Analysis completed', {
            description: isMockData 
              ? `${file.name} analyzed with mock data (FastAPI backend offline) - Score: ${session.result.overallScore}%`
              : `${file.name} processed successfully - Score: ${session.result.overallScore}%`,
            action: {
              label: 'View Results',
              onClick: () => onUploadComplete?.(session.result)
            },
            duration: isMockData ? 8000 : 5000
          })
          
          // Show additional info for mock data
          if (isMockData) {
            setTimeout(() => {
              toast.info('Using Mock Data', {
                description: 'Start FastAPI server for real analysis: python c:\\Users\\adi14\\Downloads\\run_pipeline.py',
                duration: 6000
              })
            }, 1000)
          }

          // Check if all files are completed
          setTimeout(() => {
            setFiles((currentFiles) => {
              const allCompleted = currentFiles.every(f => f.status === 'completed' || f.status === 'error')
              const hasCompleted = currentFiles.some(f => f.status === 'completed')
              if (allCompleted && hasCompleted) {
                const completedFile = currentFiles.find(f => f.id === fileId)
                if (completedFile?.analysisResult) {
                  console.log('📤 FileUpload: Preparing upload result:', {
                    fileName: completedFile.name,
                    fileSize: completedFile.size,
                    hasAnalysisResult: !!completedFile.analysisResult
                  })

                  // Pass both the analysis result and the original file object
                  const uploadResult = {
                    analysisResult: completedFile.analysisResult,
                    file: completedFile, // Include the original FileWithPreview object
                    success: true
                  }

                  console.log('📤 FileUpload: Sending upload result to callback')
                  setTimeout(() => onUploadComplete?.(uploadResult), 1000)
                }
              }
              return currentFiles
            })
          }, 500)
        }

        // Handle error
        if (session.status === 'error') {
          toast.error('Analysis failed', {
            description: session.error || `Failed to analyze ${file.name}`
          })
        }
      })

      // Note: unsubscribe function is handled by the subscription callback
      // No return value needed for this function

    } catch (error) {
      console.error('Real-time analysis failed:', error)
      
      // Update file status to error
      setFiles((prev) =>
        prev.map((f) => 
          f.id === fileId 
            ? { 
                ...f, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Analysis failed'
              }
            : f
        )
      )

      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : `Failed to analyze ${file.name}`
      })
    }
  }

  const removeFile = (fileId: string) => {
    const fileToRemove = files.find(file => file.id === fileId)
    if (fileToRemove) {
      toast.info('File removed', {
        description: `${fileToRemove.name} has been removed`
      })
    }
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const getFileIcon = (fileName: string) => {
    if (!fileName) {
      return <File className="h-8 w-8 text-gray-500" />
    }
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />
      case 'docx':
      case 'doc':
        return <FileText className="h-8 w-8 text-blue-500" />
      case 'txt':
        return <FileText className="h-8 w-8 text-gray-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxFiles,
    maxSize,
  })

  return (
    <div className={cn('w-full space-y-4', className)}>
      <Card className={cn(
        "border-2 border-dashed transition-colors duration-200",
        isDragActive 
          ? "border-primary bg-primary/5" 
          : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/25"
      )}>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <div className={cn(
              "rounded-full p-4 mb-4 transition-colors",
              isDragActive ? "bg-primary/10" : "bg-muted/50"
            )}>
              <Upload className={cn(
                "h-10 w-10 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold">
                {isDragActive
                  ? 'Drop the files here'
                  : 'Upload your documents'}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {acceptedTypes.map(type => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type.replace('.', '').toUpperCase()}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Maximum file size: {formatBytes(maxSize)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Uploaded Files ({files.length})</h3>
            <Badge variant="secondary" className="text-xs">
              {files.filter(f => f.status === 'completed').length} / {files.length} completed
            </Badge>
          </div>
          <div className="space-y-3">
            {files.map((file) => (
              <Card key={file.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === 'completed' && (
                            <Badge variant="success" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {file.status === 'error' && (
                            <Badge variant="danger" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          )}
                          {file.status === 'uploading' && (
                            <Badge variant="secondary" className="text-xs">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Uploading...
                            </Badge>
                          )}
                          {file.status === 'processing' && (
                            <Badge variant="secondary" className="text-xs">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Processing...
                            </Badge>
                          )}
                          {file.status === 'analyzing' && (
                            <Badge variant="secondary" className="text-xs">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Analyzing...
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.id)}
                            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {(file.status === 'uploading' || file.status === 'processing' || file.status === 'analyzing') && (
                        <div className="space-y-2">
                          <Progress value={file.progress} className="h-2" />
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              {Math.round(file.progress)}% complete
                            </p>
                            {file.currentStage && (
                              <p className="text-xs text-muted-foreground">
                                {file.currentStage}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
