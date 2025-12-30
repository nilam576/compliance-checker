'use client'

import { 
  mockClauses, 
  mockComplianceResults, 
  mockDocuments, 
  mockLLMProviderStats,
  generateRandomComplianceData,
  generateRandomRiskData,
  type MockClause,
  type MockComplianceResult,
  type MockDocument
} from './mock-data'

// Simulate network delay
const simulateDelay = (min: number = 800, max: number = 2500) => 
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min))

// Local storage keys
const STORAGE_KEYS = {
  DOCUMENTS: 'sebi_documents',
  CLAUSES: 'sebi_clauses', 
  COMPLIANCE_RESULTS: 'sebi_compliance_results',
  SETTINGS: 'sebi_settings'
}

// Mock API responses matching the real API structure
export class MockComplianceService {
  
  // Health check
  static async healthCheck() {
    await simulateDelay(200, 500)
    return {
      status: 'healthy',
      service: 'SEBI Compliance API (Mock)',
      version: '1.0.0-mock',
      message: 'Mock service running normally'
    }
  }

  // Get LLM providers
  static async getProviders() {
    await simulateDelay(300, 600)
    return {
      providers: [
        { name: 'gemini', status: 'available', default: true },
        { name: 'claude', status: 'available', default: false },
        { name: 'openai', status: 'available', default: false },
        { name: 'mistral', status: 'limited', default: false }
      ],
      default: 'gemini',
      stats: mockLLMProviderStats
    }
  }

  // Verify compliance
  static async verifyCompliance(request: {
    clauses: Array<{id: string, text_en: string, metadata?: Record<string, unknown>}>
    llm_provider?: string
    options?: Record<string, unknown>
  }) {
    const processingTime = Math.random() * 2000 + 1000
    await simulateDelay(processingTime, processingTime + 500)

    // Find existing results or generate new ones
    const results = request.clauses.map(clause => {
      const existingResult = mockComplianceResults.find(r => r.clause_id === clause.id)
      if (existingResult) {
        return existingResult
      }

      // Generate random result for new clauses
      const isCompliant = Math.random() > 0.4 // 60% non-compliant for demo
      const severities: Array<'None' | 'Low' | 'Medium' | 'High'> = ['None', 'Low', 'Medium', 'High']
      const categories: Array<'Legal' | 'Financial' | 'Operational' | 'General'> = ['Legal', 'Financial', 'Operational', 'General']
      
      return {
        clause_id: clause.id,
        is_compliant: isCompliant,
        confidence_score: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
        matched_rules: [{
          rule_text: "Sample SEBI regulation that matches this clause context.",
          score: Math.random() * 0.3 + 0.7,
          metadata: { doc_id: "sebi-reg-sample", clause_id: "sample", chunk_id: "1" },
          is_relevant: true,
          reason: "This clause relates to SEBI compliance requirements."
        }],
        risk_assessment: {
          severity: isCompliant ? 'None' : severities[Math.floor(Math.random() * 3) + 1] as 'Low' | 'Medium' | 'High',
          category: categories[Math.floor(Math.random() * categories.length)],
          score: isCompliant ? 0 : Math.floor(Math.random() * 8) + 3,
          impact: isCompliant ? "No regulatory exposure." : "May result in compliance violations.",
          mitigation: isCompliant ? "No action required." : "Review and update clause to meet SEBI requirements."
        },
        explanation: isCompliant 
          ? "This clause meets SEBI compliance requirements."
          : "This clause may not fully comply with current SEBI regulations.",
        processing_time_ms: Math.floor(Math.random() * 2000) + 1000
      }
    })

    return {
      results,
      processing_time_ms: Math.floor(processingTime),
      model_version: '1.0.0-mock',
      llm_provider: request.llm_provider || 'gemini'
    }
  }

  // Upload document simulation
  static async uploadDocument(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<{document: MockDocument, clauses: MockClause[]}> {
    // Simulate upload progress
    const totalTime = Math.random() * 3000 + 2000 // 2-5 seconds
    const steps = 20
    const stepTime = totalTime / steps

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepTime))
      const progress = Math.min((i / steps) * 100, 100)
      onProgress?.(progress)
    }

    // Generate document data
    const document: MockDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploaded_at: new Date().toISOString(),
      status: 'completed',
      clauses_count: Math.floor(Math.random() * 25) + 5,
      compliance_rate: Math.floor(Math.random() * 40) + 60
    }

    // Generate extracted clauses
    const clauseCount = document.clauses_count
    const extractedClauses: MockClause[] = []
    
    for (let i = 0; i < clauseCount; i++) {
      extractedClauses.push({
        id: `clause-${Date.now()}-${i}`,
        text_en: `Sample extracted clause ${i + 1} from ${file.name}. This clause contains legal terms that need to be verified against SEBI regulations.`,
        document_name: file.name,
        section: `Section ${Math.floor(i / 5) + 1}`,
        clause_type: (['data_retention', 'disclosure', 'governance', 'financial'] as const)[Math.floor(Math.random() * 4)] as 'data_retention' | 'disclosure' | 'governance' | 'financial',
        created_at: new Date().toISOString()
      })
    }

    // Store in local storage
    this.saveDocumentToStorage(document)
    this.saveClausesToStorage(extractedClauses)

    return { document, clauses: extractedClauses }
  }

  // Get documents from storage
  static getDocumentsFromStorage(): MockDocument[] {
    const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
    return stored ? JSON.parse(stored) : mockDocuments
  }

  // Save document to storage
  static saveDocumentToStorage(document: MockDocument) {
    const documents = this.getDocumentsFromStorage()
    const updated = [document, ...documents.filter(d => d.id !== document.id)]
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated))
  }

  // Get clauses from storage
  static getClausesFromStorage(): MockClause[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CLAUSES)
    return stored ? JSON.parse(stored) : mockClauses
  }

  // Save clauses to storage
  static saveClausesToStorage(clauses: MockClause[]) {
    const existing = this.getClausesFromStorage()
    const updated = [...clauses, ...existing.filter(c => !clauses.find(nc => nc.id === c.id))]
    localStorage.setItem(STORAGE_KEYS.CLAUSES, JSON.stringify(updated))
  }

  // Get compliance results from storage
  static getComplianceResultsFromStorage(): MockComplianceResult[] {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPLIANCE_RESULTS)
    return stored ? JSON.parse(stored) : mockComplianceResults
  }

  // Save compliance results to storage
  static saveComplianceResultsToStorage(results: MockComplianceResult[]) {
    const existing = this.getComplianceResultsFromStorage()
    const updated = [...results, ...existing.filter(r => !results.find(nr => nr.clause_id === r.clause_id))]
    localStorage.setItem(STORAGE_KEYS.COMPLIANCE_RESULTS, JSON.stringify(updated))
  }

  // Get analytics data
  static async getAnalytics() {
    await simulateDelay(500, 1000)
    
    const documents = this.getDocumentsFromStorage()
    const clauses = this.getClausesFromStorage()
    const results = this.getComplianceResultsFromStorage()

    const totalClauses = clauses.length
    const compliantClauses = results.filter(r => r.is_compliant).length
    const highRiskClauses = results.filter(r => r.risk_assessment.severity === 'High').length

    return {
      overview: {
        total_documents: documents.length,
        total_clauses: totalClauses,
        compliant_clauses: compliantClauses,
        compliance_rate: totalClauses > 0 ? (compliantClauses / totalClauses) * 100 : 0,
        high_risk_clauses: highRiskClauses
      },
      compliance_data: generateRandomComplianceData(),
      risk_data: generateRandomRiskData(),
      recent_activity: documents.slice(0, 10).map(doc => ({
        id: doc.id,
        type: 'document_processed',
        document_name: doc.name,
        timestamp: doc.uploaded_at,
        status: doc.status
      }))
    }
  }

  // Delete document and associated clauses
  static deleteDocument(documentId: string) {
    const documents = this.getDocumentsFromStorage()
    const clauses = this.getClausesFromStorage()
    const results = this.getComplianceResultsFromStorage()

    const document = documents.find(d => d.id === documentId)
    if (!document) return

    // Remove document
    const updatedDocuments = documents.filter(d => d.id !== documentId)
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updatedDocuments))

    // Remove associated clauses  
    const updatedClauses = clauses.filter(c => c.document_name !== document.name)
    localStorage.setItem(STORAGE_KEYS.CLAUSES, JSON.stringify(updatedClauses))

    // Remove associated results
    const clauseIds = clauses.filter(c => c.document_name === document.name).map(c => c.id)
    const updatedResults = results.filter(r => !clauseIds.includes(r.clause_id))
    localStorage.setItem(STORAGE_KEYS.COMPLIANCE_RESULTS, JSON.stringify(updatedResults))
  }

  // Clear all data
  static clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS)
    localStorage.removeItem(STORAGE_KEYS.CLAUSES)
    localStorage.removeItem(STORAGE_KEYS.COMPLIANCE_RESULTS)
  }

  // Export data
  static exportData() {
    return {
      documents: this.getDocumentsFromStorage(),
      clauses: this.getClausesFromStorage(), 
      results: this.getComplianceResultsFromStorage(),
      exported_at: new Date().toISOString()
    }
  }
}
