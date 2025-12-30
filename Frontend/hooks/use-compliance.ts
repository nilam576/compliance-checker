'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { complianceAPI } from '@/lib/api'
import { useToast } from './use-toast'
import type { ComplianceVerificationRequest, ComplianceVerificationResponse } from '@/lib/api'

// Hook for compliance verification
export function useComplianceVerification() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: ComplianceVerificationRequest) => complianceAPI.verifyCompliance(data),
    onSuccess: (data) => {
      toast({
        title: "Compliance Verification Complete",
        description: `Processed ${data.results.length} clauses in ${data.processing_time_ms}ms`,
        variant: "default"
      })
      
      // Save results to local storage (convert to mock format)
      const mockResults = data.results.map(result => ({
        ...result,
        processing_time_ms: 0 // Default value since it's not in the API response
      }))
      // TODO: Implement saving results with FastAPIService
      console.log('Compliance results received:', mockResults)
      
      // Invalidate analytics to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify compliance",
        variant: "destructive"
      })
    }
  })

  return {
    verifyCompliance: mutation.mutate,
    isLoading: mutation.isPending,
    data: mutation.data,
    error: mutation.error
  }
}

// Hook for document upload
export function useDocumentUpload() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: (file: File) => complianceAPI.uploadDocument(file, 'en', (progress) => setUploadProgress(progress)),
    onSuccess: (data) => {
      toast({
        title: "Document Uploaded Successfully",
        description: `Extracted ${data.clauses?.length || 0} clauses from document`,
        variant: "default"
      })
      
      setUploadProgress(0)
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      })
      setUploadProgress(0)
    }
  })

  return {
    uploadDocument: mutation.mutate,
    isUploading: mutation.isPending,
    uploadProgress,
    data: mutation.data,
    error: mutation.error
  }
}

// Hook for analytics data
export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => complianceAPI.getAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  })
}

// Hook for LLM providers
export function useLLMProviders() {
  return useQuery({
    queryKey: ['llm-providers'],
    queryFn: () => complianceAPI.getProviders(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for documents
export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => {
      // TODO: Implement document retrieval with FastAPIService
      return Promise.resolve([])
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Hook for clauses
export function useClauses() {
  return useQuery({
    queryKey: ['clauses'],
    queryFn: () => {
      // TODO: Implement clause retrieval with FastAPIService
      return Promise.resolve([])
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Hook for compliance results
export function useComplianceResults() {
  return useQuery({
    queryKey: ['compliance-results'],
    queryFn: () => {
      // TODO: Implement compliance results retrieval with FastAPIService
      return Promise.resolve([])
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Hook for managing offline status
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOffline
}

// Hook for data export
export function useDataExport() {
  const { toast } = useToast()

  const exportData = () => {
    try {
      const data = complianceAPI.exportData()
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sebi-compliance-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Data Exported Successfully",
        description: "Compliance data has been downloaded as JSON file",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export compliance data",
        variant: "destructive"
      })
    }
  }

  return { exportData }
}

// Hook for data management
export function useDataManagement() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteDocument = (documentId: string) => {
    try {
      complianceAPI.deleteDocument(documentId)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['clauses'] })
      queryClient.invalidateQueries({ queryKey: ['compliance-results'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      
      toast({
        title: "Document Deleted",
        description: "Document and associated data removed successfully",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete document",
        variant: "destructive"
      })
    }
  }

  const clearAllData = () => {
    try {
      complianceAPI.clearAllData()
      queryClient.invalidateQueries()
      
      toast({
        title: "All Data Cleared",
        description: "All compliance data has been cleared from local storage",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Clear Failed", 
        description: "Failed to clear all data",
        variant: "destructive"
      })
    }
  }

  return { deleteDocument, clearAllData }
}
