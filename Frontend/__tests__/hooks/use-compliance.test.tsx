import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAnalytics, useDocuments } from '@/hooks/use-compliance'
import * as api from '@/lib/api'
import React from 'react'

// Mock the API module and mock services
jest.mock('@/lib/api')

// Create a test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAnalytics Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return initial loading state', () => {
    const mockAnalytics = {
      totalDocuments: 0,
      processedDocuments: 0,
      averageComplianceScore: 0,
      totalClauses: 0,
    }

    // Mock the complianceAPI object
    const mockComplianceAPI = {
      getAnalytics: jest.fn().mockResolvedValue(mockAnalytics),
    }

    // Replace the complianceAPI property temporarily
    const originalComplianceAPI = (api as any).complianceAPI
    Object.defineProperty(api, 'complianceAPI', {
      value: mockComplianceAPI,
      writable: true,
    })

    const { result } = renderHook(() => useAnalytics(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBe(null)

    // Restore the original complianceAPI
    Object.defineProperty(api, 'complianceAPI', {
      value: originalComplianceAPI,
      writable: true,
    })
  })

  it('should fetch analytics data successfully', async () => {
    const mockAnalytics = {
      totalDocuments: 10,
      processedDocuments: 8,
      averageComplianceScore: 85,
      totalClauses: 50,
    }

    // Mock the complianceAPI object
    const mockComplianceAPI = {
      getAnalytics: jest.fn().mockResolvedValue(mockAnalytics),
    }

    // Replace the complianceAPI property temporarily
    const originalComplianceAPI = (api as any).complianceAPI
    Object.defineProperty(api, 'complianceAPI', {
      value: mockComplianceAPI,
      writable: true,
    })

    const { result } = renderHook(() => useAnalytics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockAnalytics)
    expect(result.current.error).toBe(null)

    // Restore the original complianceAPI
    Object.defineProperty(api, 'complianceAPI', {
      value: originalComplianceAPI,
      writable: true,
    })
  })
})

describe('useDocuments Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return empty array from FastAPIService', async () => {
    const mockDocuments: never[] = []

    const { result } = renderHook(() => useDocuments(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Since we're using FastAPIService now, expect empty array
    expect(result.current.data).toEqual(mockDocuments)
  })
})