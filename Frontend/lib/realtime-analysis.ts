/**
 * Real-Time Analysis Service
 * Provides real-time document analysis with progress tracking and session management
 *
 * Features:
 * - Real-time progress updates during document processing
 * - Session-based analysis tracking
 * - Automatic fallback to mock data when backend unavailable
 * - Comprehensive error handling and recovery
 * - Type-safe data transformation and validation
 */

import { FastAPIService } from './fastapi-services'
import type { FastAPIResponse } from './fastapi-client'
import { ErrorHandler } from './error-handler'

// Analysis session status types with clear progression
type AnalysisStatus = 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error'

// Analysis stages configuration
const ANALYSIS_STAGES = {
  UPLOADING: { name: 'Uploading document', progress: 10 },
  EXTRACTING: { name: 'Extracting text content', progress: 25 },
  ANALYZING: { name: 'Analyzing compliance', progress: 70 },
  FINALIZING: { name: 'Finalizing results', progress: 90 },
  COMPLETED: { name: 'Analysis complete', progress: 100 }
};

// Analysis session interface with enhanced type safety
export interface AnalysisSession {
  id: string
  fileName: string
  fileSize: number
  startTime: Date
  status: AnalysisStatus
  progress: number // 0-100
  currentStage: string
  result?: ProcessedDocument
  error?: string
}

// Processed document interface with detailed type definitions
export interface ProcessedDocument {
  id: string
  fileName: string
  fileSize: string
  uploadedAt: string
  processedAt: string
  summary: string
  overallScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high'
  totalClauses: number
  compliantClauses: number
  nonCompliantClauses: number
  highRiskClauses: number
  status?: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error'
  timelines: Record<string, TimelineEntry>
  clauses: Clause[]
  complianceResults: ComplianceResult[]
  complianceAreas: ComplianceArea[]
  keyFindings: KeyFinding[]
  actionItems: ActionItem[]
  clauseAnalysis: ClauseAnalysis[]
}

// Supporting interfaces for better type safety
interface TimelineEntry {
  start?: string
  end?: string
  description?: string
}

interface Clause {
  id?: string
  text?: string
  text_en?: string
  [key: string]: any
}

interface ComplianceResult {
  clause_id?: string
  is_compliant: boolean
  confidence_score: number
  matched_rules?: MatchedRule[]
  risk_assessment?: RiskAssessment
  explanation?: string
}

interface MatchedRule {
  rule_text: string
  score: number
  metadata: Record<string, any>
  is_relevant: boolean
  reason: string
}

interface RiskAssessment {
  severity: 'Low' | 'Medium' | 'High' | 'None'
  category: 'Legal' | 'Financial' | 'Operational' | 'General'
  score: number
  impact: string
  mitigation: string
}

interface ComplianceArea {
  area: string
  total: number
  compliant: number
  nonCompliant: number
  score: number
}

interface KeyFinding {
  type: 'success' | 'warning' | 'error'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
}

interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  dueDate: string
}

interface ClauseAnalysis {
  id: string
  text: string
  isCompliant: boolean
  confidenceScore: number
  riskLevel: string
  category: string
  explanation: string
  matchedRules: MatchedRule[]
  recommendations: string[]
}

// FastAPI response type imported from fastapi-client.ts for consistency

export class RealTimeAnalysisService {
  private static sessions: Map<string, AnalysisSession> = new Map();
  private static listeners: Map<string, ((session: AnalysisSession) => void)[]> = new Map();

  /**
   * Validate input parameters for analysis
   */
  private static validateAnalysisInput(file: File, language: string): void {
    if (!file) {
      throw new Error('File is required for analysis')
    }

    // Debug logging to understand file object state
    console.log('🔍 File validation debug:', {
      hasName: 'name' in file,
      nameValue: file.name,
      nameType: typeof file.name,
      isFileInstance: file instanceof File,
      constructor: file.constructor.name,
      prototype: Object.getPrototypeOf(file)?.constructor?.name
    });

    // Validate file name with more robust checking
    if (!file.name || typeof file.name !== 'string' || file.name.trim().length === 0) {
      console.error('❌ File name validation failed:', {
        name: file.name,
        type: typeof file.name,
        length: file.name?.length
      });
      throw new Error('File must have a valid name. Please ensure the file has been properly selected.')
    }

    // Check for invalid file names that might cause issues
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(file.name)) {
      throw new Error('File name contains invalid characters. Please rename the file and try again.')
    }

    if (file.size === 0) {
      throw new Error('File cannot be empty')
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('File size too large. Maximum size is 50MB')
    }

    if (!language || typeof language !== 'string' || language.trim().length === 0) {
      throw new Error('Language parameter is required and must be a non-empty string')
    }

    // Check for supported file types
    const supportedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const hasValidType = supportedTypes.includes(file.type)
    const hasValidExtension = file.name.toLowerCase().match(/\.(pdf|txt|doc|docx)$/)

    if (!hasValidType && !hasValidExtension) {
      throw new Error('Unsupported file type. Please upload PDF, TXT, DOC, or DOCX files')
    }
  }

  static startAnalysis(file: File, language: string = 'en'): string {
    // Generate fallback name if file doesn't have a proper name BEFORE validation
    let fileName = file.name;
    if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
      const extension = this.getFileExtension(file.type) || 'unknown';
      fileName = `uploaded_file_${Date.now()}.${extension}`;
      console.warn('⚠️ File without proper name detected, using fallback:', fileName);

      // Create a new file-like object with the proper name
      try {
        // Create a new File object with the fallback name
        const fallbackFile = new File([file], fileName, {
          type: file.type,
          lastModified: file.lastModified
        });

        // Copy over any additional properties from the original file
        Object.setPrototypeOf(fallbackFile, Object.getPrototypeOf(file));

        // Replace the original file with the fallback
        file = fallbackFile as File;
      } catch (error) {
        console.warn('Could not create fallback file object, proceeding with original:', error);
      }
    }

    // Validate input parameters
    this.validateAnalysisInput(file, language);

    const sessionId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    const session: AnalysisSession = {
      id: sessionId,
      fileName: fileName,
      fileSize: file.size,
      startTime: new Date(),
      status: 'uploading',
      progress: 0,
      currentStage: ANALYSIS_STAGES.UPLOADING.name,
    };

    this.sessions.set(sessionId, session);
    this.listeners.set(sessionId, []);

    console.log('🚀 Starting real-time analysis:', {
      sessionId,
      fileName: file.name,
      fileSize: file.size,
      language
    });

    // Start processing asynchronously with enhanced error handling
    this.processDocument(sessionId, file, language).catch((error) => {
      console.error('❌ Real-time analysis failed:', error);

      // Determine error type and provide appropriate user message
      let errorMessage = 'Analysis failed due to an unexpected error';
      let errorStage = 'Processing failed';

      if (error instanceof Error) {
        if (error.message.includes('Backend not available')) {
          errorMessage = 'FastAPI backend is not running. Analysis completed with mock data.';
          errorStage = 'Using mock data';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = 'Network error occurred. Please check your connection.';
          errorStage = 'Network error';
        } else if (error.message.includes('Invalid response')) {
          errorMessage = 'Received invalid response from server. Please try again.';
          errorStage = 'Response error';
        } else {
          errorMessage = error.message;
        }
      }

      this.updateSession(sessionId, {
        status: 'error',
        error: errorMessage,
        currentStage: errorStage,
        progress: 100,
      });

      // Log additional error context for debugging
      console.error('📋 Error context:', {
        sessionId,
        fileName: file.name,
        fileSize: file.size,
        language,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack : undefined
      });
    });

    return sessionId;
  }

  static subscribe(sessionId: string, callback: (session: AnalysisSession) => void): () => void {
    const listeners = this.listeners.get(sessionId) || [];
    listeners.push(callback);
    this.listeners.set(sessionId, listeners);

    // Send initial state
    const session = this.sessions.get(sessionId);
    if (session) callback(session);

    // Return unsubscribe function
    return () => {
      const currentListeners = this.listeners.get(sessionId) || [];
      const index = currentListeners.indexOf(callback);
      if (index > -1) {
        currentListeners.splice(index, 1);
        this.listeners.set(sessionId, currentListeners);
      }
    };
  }

  static getSession(sessionId: string): AnalysisSession | undefined {
    return this.sessions.get(sessionId);
  }

  private static async processDocument(sessionId: string, file: File, language: string) {
    try {
      // Update progress during upload
      const progressCallback = (percentage: number) => {
        this.updateSession(sessionId, {
          status: 'uploading',
          progress: Math.min(ANALYSIS_STAGES.UPLOADING.progress + percentage * 0.15, 25),
          currentStage: `${ANALYSIS_STAGES.UPLOADING.name} ${Math.round(percentage)}%`,
        });
      };

      // Update to extracting stage
      this.updateSession(sessionId, {
        status: 'processing',
        progress: ANALYSIS_STAGES.EXTRACTING.progress,
        currentStage: ANALYSIS_STAGES.EXTRACTING.name,
      });

      let backendResponse: any;
      let usingMockData = false;

      try {
        // Check backend availability with timeout
        const healthCheck = await FastAPIService.healthCheck();
        if (healthCheck.status !== 'healthy') {
          throw new Error(`Backend not available: ${healthCheck.message}`);
        }

        // Upload document with progress tracking
        backendResponse = await FastAPIService.uploadDocument(file, language, progressCallback);
        console.log('✅ Real FastAPI backend response received');

        // Validate response structure
        if (!backendResponse || typeof backendResponse !== 'object') {
          throw new Error('Invalid response format from FastAPI backend');
        }

      } catch (fastAPIError) {
        console.warn('⚠ FastAPI backend call failed, falling back to mock data:', fastAPIError);
        console.warn('Error details:', fastAPIError instanceof Error ? fastAPIError.message : String(fastAPIError));
        usingMockData = true;

        // Mock data matching FastAPI structure - fallback when backend is unavailable
        const mockClauses = Array.from({ length: 8 }, (_, i) => ({
          id: `clause_${i + 1}`,
          text: `Clause ${i + 1}: Compliance requirement for ${['disclosure', 'governance', 'reporting', 'risk management'][i % 4]}.`,
          text_en: `Clause ${i + 1}: Compliance requirement for ${['disclosure', 'governance', 'reporting', 'risk management'][i % 4]}.`,
        }));

        const mockComplianceResults = Array.from({ length: 8 }, (_, i) => ({
          clause_id: `clause_${i + 1}`,
          is_compliant: Math.random() > 0.3,
          confidence_score: 0.8 + Math.random() * 0.2,
          matched_rules: [{
            rule_text: `SEBI LODR Regulation ${i + 1}.${i + 1}`,
            score: 0.85,
            metadata: {},
            is_relevant: true,
            reason: 'High relevance match',
          }],
          risk_assessment: {
            severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
            category: ['Legal', 'Financial', 'Operational'][Math.floor(Math.random() * 3)] as 'Legal' | 'Financial' | 'Operational',
            score: Math.random(),
            impact: 'Moderate impact on compliance',
            mitigation: 'Review and update clause as needed',
          },
          explanation: `This clause ${Math.random() > 0.3 ? 'meets' : 'does not meet'} SEBI standards.`,
        }));

        backendResponse = {
          summary: `Analysis of ${file.name} for SEBI compliance.`,
          timelines: {
            'timeline_1': {
              start: '2020-01-01',
              end: '2024-12-31',
              description: 'Document validity period'
            }
          },
          clauses: mockClauses,
          compliance_results: mockComplianceResults,
          compliance_score: 85,
          risk_level: 'medium',
          uploaded_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
        };

        console.log('📋 Generated mock data:', {
          clausesCount: mockClauses.length,
          complianceResultsCount: mockComplianceResults.length,
          mockDataNote: 'Using fallback mock data due to backend unavailability'
        });
      }

      // Update to analyzing stage
      this.updateSession(sessionId, {
        status: 'analyzing',
        progress: ANALYSIS_STAGES.ANALYZING.progress,
        currentStage: ANALYSIS_STAGES.ANALYZING.name,
      });

      // Transform and enrich data
      const processedDocument = await this.enrichAnalysisData(backendResponse, file);

      // Add mock data note
      if (usingMockData) {
        processedDocument.summary = `[MOCK DATA] ${processedDocument.summary}\n\nNote: FastAPI backend not available. Start the FastAPI server at http://127.0.0.1:8000 for real analysis.`;
      }

      // Update to finalizing stage
      this.updateSession(sessionId, {
        status: 'analyzing',
        progress: ANALYSIS_STAGES.FINALIZING.progress,
        currentStage: ANALYSIS_STAGES.FINALIZING.name,
      });

      // Complete analysis
      this.updateSession(sessionId, {
        status: 'completed',
        progress: ANALYSIS_STAGES.COMPLETED.progress,
        currentStage: ANALYSIS_STAGES.COMPLETED.name,
        result: processedDocument,
      });
    } catch (error) {
      console.error('❌ Process document failed:', error);

      const appError = await ErrorHandler.handleAnalysisError(error, {
        sessionId,
        fileName: file.name,
        language,
      });

      this.updateSession(sessionId, {
        status: 'error',
        error: ErrorHandler.getUserMessage(appError),
        currentStage: 'Processing failed',
        progress: 100,
      });

      // Re-throw error with more context
      const enhancedError = new Error(`Document processing failed: ${error instanceof Error ? error.message : String(error)}`);
      enhancedError.cause = error;
      throw enhancedError;
    }
  }

  private static async enrichAnalysisData(backendData: FastAPIResponse, file: File): Promise<ProcessedDocument> {
    // Transform backend data to frontend format with robust validation
    const clauses = Array.isArray(backendData.clauses) ? backendData.clauses : [];
    const complianceResults = Array.isArray(backendData.compliance_results)
      ? backendData.compliance_results
      : (backendData.compliance_results ? [backendData.compliance_results] : []);

    // Validate data integrity
    if (!backendData.summary && clauses.length === 0 && complianceResults.length === 0) {
      throw new Error('Invalid backend response: missing required data fields');
    }

    // Calculate compliance metrics with safety checks
    const totalClauses = Math.max(clauses.length, complianceResults.length, 1); // Ensure at least 1 for division
    const compliantCount = complianceResults.filter((r: any) => r && typeof r.is_compliant === 'boolean' && r.is_compliant).length;
    const nonCompliantCount = totalClauses - compliantCount;
    const highRiskCount = complianceResults.filter((r: any) =>
      r && r.risk_assessment && (r.risk_assessment.severity === 'High' || r.risk_assessment.severity === 'HIGH')
    ).length;

    // Calculate overall score with bounds checking
    const overallScore = totalClauses > 0 ? Math.max(0, Math.min(100, Math.round((compliantCount / totalClauses) * 100))) : 0;
    const riskLevel: 'low' | 'medium' | 'high' = overallScore >= 80 ? 'low' : overallScore >= 60 ? 'medium' : 'high';

    console.log('📊 Compliance metrics calculated:', {
      totalClauses,
      compliantCount,
      nonCompliantCount,
      highRiskCount,
      overallScore,
      riskLevel
    });
    
    const complianceAreas = this.generateComplianceAreas(complianceResults);
    const keyFindings = this.generateKeyFindings({ 
      summary: backendData.summary,
      overallScore,
      riskLevel,
      totalClauses,
      compliantCount,
      nonCompliantCount,
      highRiskCount
    });
    const actionItems = this.generateActionItems(complianceResults);
    const clauseAnalysis = this.formatClauseAnalysis(complianceResults, clauses);

    return {
      id: `doc_${Date.now()}`,
      fileName: file.name,
      fileSize: this.formatFileSize(file.size),
      uploadedAt: backendData.uploaded_at || new Date().toISOString(),
      processedAt: backendData.processed_at || new Date().toISOString(),
      summary: backendData.summary || '',
      overallScore,
      riskLevel,
      totalClauses,
      compliantClauses: compliantCount,
      nonCompliantClauses: nonCompliantCount,
      highRiskClauses: highRiskCount,
      timelines: backendData.timelines || {},
      clauses,
      complianceResults,
      complianceAreas,
      keyFindings,
      actionItems,
      clauseAnalysis,
    };
  }

  private static generateComplianceAreas(complianceResults: any[]): any[] {
    const areas = new Map<string, any>();
    
    complianceResults.forEach((result: any) => {
      const category = result.risk_assessment?.category || 'General';
      const existing = areas.get(category) || {
        area: category,
        total: 0,
        compliant: 0,
        nonCompliant: 0,
        score: 0
      };
      
      existing.total++;
      if (result.is_compliant) {
        existing.compliant++;
      } else {
        existing.nonCompliant++;
      }
      existing.score = Math.round((existing.compliant / existing.total) * 100);
      
      areas.set(category, existing);
    });
    
    return Array.from(areas.values());
  }
  
  private static generateKeyFindings(data: any): any[] {
    const findings: any[] = [];
    
    if (data.overallScore >= 80) {
      findings.push({
        type: 'success',
        title: 'High Compliance Score',
        description: `Document achieves ${data.overallScore}% compliance with SEBI regulations.`,
        priority: 'low'
      });
    } else if (data.overallScore >= 60) {
      findings.push({
        type: 'warning',
        title: 'Moderate Compliance Score',
        description: `Document achieves ${data.overallScore}% compliance. Some improvements needed.`,
        priority: 'medium'
      });
    } else {
      findings.push({
        type: 'error',
        title: 'Low Compliance Score',
        description: `Document achieves only ${data.overallScore}% compliance. Significant improvements required.`,
        priority: 'high'
      });
    }
    
    if (data.highRiskCount > 0) {
      findings.push({
        type: 'error',
        title: 'High-Risk Clauses Detected',
        description: `${data.highRiskCount} clause(s) identified as high-risk and require immediate attention.`,
        priority: 'high'
      });
    }
    
    return findings;
  }
  
  private static generateActionItems(complianceResults: any[]): any[] {
    const actionItems: any[] = [];
    
    complianceResults.forEach((result: any, index: number) => {
      if (!result.is_compliant) {
        actionItems.push({
          id: `action_${index + 1}`,
          title: `Review Clause ${result.clause_id || index + 1}`,
          description: result.explanation || 'This clause requires compliance review.',
          priority: result.risk_assessment?.severity === 'High' ? 'high' : 
                   result.risk_assessment?.severity === 'Medium' ? 'medium' : 'low',
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        });
      }
    });
    
    return actionItems;
  }
  
  private static formatClauseAnalysis(complianceResults: any[], clauses: any[]): any[] {
    return complianceResults.map((result: any, index: number) => {
      const clause = clauses[index] || {};
      
      return {
        id: result.clause_id || `clause_${index + 1}`,
        text: clause.text_en || clause.text || 'Clause text not available',
        isCompliant: result.is_compliant,
        confidenceScore: result.confidence_score || 0,
        riskLevel: result.risk_assessment?.severity || 'Unknown',
        category: result.risk_assessment?.category || 'General',
        explanation: result.explanation || 'No explanation provided',
        matchedRules: result.matched_rules || [],
        recommendations: result.risk_assessment?.mitigation ? [result.risk_assessment.mitigation] : []
      };
    });
  }

  private static updateSession(sessionId: string, updates: Partial<AnalysisSession>) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const updatedSession = { ...session, ...updates };
    this.sessions.set(sessionId, updatedSession);

    const listeners = this.listeners.get(sessionId) || [];
    listeners.forEach((callback) => callback(updatedSession));
  }

  private static getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
    };

    return mimeToExt[mimeType] || 'file';
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }


  static cleanup(maxAge: number = 3600000) {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.startTime.getTime() > maxAge) {
        this.sessions.delete(sessionId);
        this.listeners.delete(sessionId);
      }
    }
  }
}
