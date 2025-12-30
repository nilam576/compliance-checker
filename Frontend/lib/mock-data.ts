// Mock data for SEBI compliance verification system

export interface MockClause {
  id: string
  text_en: string
  document_name: string
  section: string
  clause_type: 'data_retention' | 'disclosure' | 'governance' | 'financial'
  created_at: string
}

export interface MockComplianceResult {
  clause_id: string
  is_compliant: boolean
  confidence_score: number
  matched_rules: MockMatchedRule[]
  risk_assessment: MockRiskAssessment
  explanation: string
  processing_time_ms: number
}

export interface MockMatchedRule {
  rule_text: string
  score: number
  metadata: {
    doc_id: string
    clause_id: string
    chunk_id: string
  }
  is_relevant: boolean
  reason: string
}

export interface MockRiskAssessment {
  severity: 'None' | 'Low' | 'Medium' | 'High'
  category: 'Legal' | 'Financial' | 'Operational' | 'General'
  score: number
  impact: string
  mitigation: string
}

export interface MockDocument {
  id: string
  name: string
  type: string
  size: number
  uploaded_at: string
  status: 'processing' | 'completed' | 'failed'
  clauses_count: number
  compliance_rate: number
}

// Sample SEBI regulation clauses
export const mockRegulations = [
  {
    id: "sebi-reg-001",
    text: "Every listed entity shall maintain records for a minimum period of eight years.",
    category: "Record Keeping",
    section: "LODR Regulation 30"
  },
  {
    id: "sebi-reg-002", 
    text: "Material events must be disclosed within 30 minutes of conclusion of board meeting.",
    category: "Disclosure Requirements",
    section: "LODR Regulation 30"
  },
  {
    id: "sebi-reg-003",
    text: "Related party transactions exceeding Rs. 1000 crores require shareholder approval.",
    category: "Related Party Transactions",
    section: "LODR Regulation 23"
  },
  {
    id: "sebi-reg-004",
    text: "Independent directors shall not hold office for more than two consecutive terms.",
    category: "Board Composition",
    section: "LODR Regulation 17"
  },
  {
    id: "sebi-reg-005",
    text: "Audit committee must have minimum three members with majority being independent directors.",
    category: "Audit Requirements",
    section: "LODR Regulation 18"
  }
]

// Sample legal clauses to verify
export const mockClauses: MockClause[] = [
  {
    id: "clause-001",
    text_en: "The company shall maintain all financial records for a period of five years from the date of creation.",
    document_name: "Service_Agreement_2024.pdf",
    section: "Record Retention",
    clause_type: "data_retention",
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "clause-002", 
    text_en: "Any material changes to corporate structure must be disclosed within 24 hours of board approval.",
    document_name: "Corporate_Policy_2024.docx",
    section: "Disclosure Policy",
    clause_type: "disclosure",
    created_at: "2024-12-01T10:15:00Z"
  },
  {
    id: "clause-003",
    text_en: "Related party transactions above Rs. 500 crores require prior shareholder consent through special resolution.",
    document_name: "RPT_Policy_2024.pdf", 
    section: "Related Party Transactions",
    clause_type: "governance",
    created_at: "2024-12-01T10:30:00Z"
  },
  {
    id: "clause-004",
    text_en: "Independent directors may serve for a maximum of three consecutive terms of five years each.",
    document_name: "Board_Charter_2024.pdf",
    section: "Director Tenure",
    clause_type: "governance",
    created_at: "2024-12-01T10:45:00Z"
  },
  {
    id: "clause-005",
    text_en: "The audit committee shall comprise of four members, with two being independent directors.",
    document_name: "Audit_Committee_Charter.pdf",
    section: "Committee Composition", 
    clause_type: "governance",
    created_at: "2024-12-01T11:00:00Z"
  }
]

// Generate mock compliance results
export const mockComplianceResults: MockComplianceResult[] = [
  {
    clause_id: "clause-001",
    is_compliant: false,
    confidence_score: 0.89,
    matched_rules: [
      {
        rule_text: "Every listed entity shall maintain records for a minimum period of eight years.",
        score: 0.85,
        metadata: { doc_id: "sebi-reg-001", clause_id: "rec-001", chunk_id: "1" },
        is_relevant: true,
        reason: "Company policy specifies 5 years retention, but SEBI requires 8 years minimum."
      }
    ],
    risk_assessment: {
      severity: "High",
      category: "Legal", 
      score: 8,
      impact: "Non-compliance with SEBI record retention requirements may result in regulatory penalties.",
      mitigation: "Update record retention policy to comply with 8-year minimum requirement."
    },
    explanation: "The clause specifies 5-year record retention, which falls short of SEBI's 8-year minimum requirement.",
    processing_time_ms: 2340
  },
  {
    clause_id: "clause-002",
    is_compliant: false,
    confidence_score: 0.92,
    matched_rules: [
      {
        rule_text: "Material events must be disclosed within 30 minutes of conclusion of board meeting.",
        score: 0.90,
        metadata: { doc_id: "sebi-reg-002", clause_id: "disc-001", chunk_id: "1" },
        is_relevant: true,
        reason: "24-hour disclosure timeline exceeds SEBI's 30-minute requirement for material events."
      }
    ],
    risk_assessment: {
      severity: "High",
      category: "Legal",
      score: 9,
      impact: "Delayed disclosure may result in market manipulation concerns and regulatory action.",
      mitigation: "Revise disclosure timeline to comply with 30-minute requirement for material events."
    },
    explanation: "24-hour disclosure period is non-compliant with SEBI's 30-minute requirement for material event disclosure.",
    processing_time_ms: 1890
  },
  {
    clause_id: "clause-003",
    is_compliant: false,
    confidence_score: 0.87,
    matched_rules: [
      {
        rule_text: "Related party transactions exceeding Rs. 1000 crores require shareholder approval.",
        score: 0.82,
        metadata: { doc_id: "sebi-reg-003", clause_id: "rpt-001", chunk_id: "1" },
        is_relevant: true,
        reason: "Company policy sets threshold at Rs. 500 crores while SEBI requires approval above Rs. 1000 crores."
      }
    ],
    risk_assessment: {
      severity: "Medium",
      category: "Financial",
      score: 6,
      impact: "Lower threshold creates unnecessary compliance burden but ensures conservative approach.",
      mitigation: "Consider aligning threshold with SEBI requirement while maintaining internal controls."
    },
    explanation: "Company policy is more conservative than required, setting approval threshold below SEBI requirement.",
    processing_time_ms: 2100
  },
  {
    clause_id: "clause-004", 
    is_compliant: false,
    confidence_score: 0.94,
    matched_rules: [
      {
        rule_text: "Independent directors shall not hold office for more than two consecutive terms.",
        score: 0.93,
        metadata: { doc_id: "sebi-reg-004", clause_id: "board-001", chunk_id: "1" },
        is_relevant: true,
        reason: "Company allows three consecutive terms while SEBI limits to two consecutive terms."
      }
    ],
    risk_assessment: {
      severity: "High",
      category: "Legal",
      score: 8,
      impact: "Extended tenure may compromise director independence and violate SEBI governance norms.",
      mitigation: "Update director tenure policy to limit independent directors to two consecutive terms."
    },
    explanation: "Company policy allows three consecutive terms, exceeding SEBI's two-term limit for independent directors.",
    processing_time_ms: 1750
  },
  {
    clause_id: "clause-005",
    is_compliant: true,
    confidence_score: 0.96,
    matched_rules: [
      {
        rule_text: "Audit committee must have minimum three members with majority being independent directors.",
        score: 0.95,
        metadata: { doc_id: "sebi-reg-005", clause_id: "audit-001", chunk_id: "1" },
        is_relevant: true,
        reason: "Four-member committee with two independent directors meets minimum requirements."
      }
    ],
    risk_assessment: {
      severity: "None",
      category: "General",
      score: 0,
      impact: "No regulatory exposure identified.",
      mitigation: "No action required. Continue current practice."
    },
    explanation: "Audit committee composition meets SEBI requirements with adequate independent director representation.",
    processing_time_ms: 1650
  }
]

// Mock documents for upload simulation
export const mockDocuments: MockDocument[] = [
  {
    id: "doc-001",
    name: "Service_Agreement_2024.pdf",
    type: "application/pdf",
    size: 2458000,
    uploaded_at: "2024-12-01T09:00:00Z",
    status: "completed",
    clauses_count: 15,
    compliance_rate: 73
  },
  {
    id: "doc-002",
    name: "Corporate_Policy_2024.docx", 
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 1890000,
    uploaded_at: "2024-12-01T09:30:00Z",
    status: "completed",
    clauses_count: 22,
    compliance_rate: 68
  },
  {
    id: "doc-003",
    name: "RPT_Policy_2024.pdf",
    type: "application/pdf", 
    size: 3200000,
    uploaded_at: "2024-12-01T10:15:00Z",
    status: "processing",
    clauses_count: 0,
    compliance_rate: 0
  }
]

// Mock LLM provider performance data
export const mockLLMProviderStats = {
  gemini: {
    avg_response_time: 2100,
    accuracy_rate: 0.94,
    total_requests: 1250,
    success_rate: 0.98
  },
  claude: {
    avg_response_time: 2800,
    accuracy_rate: 0.96, 
    total_requests: 890,
    success_rate: 0.99
  },
  openai: {
    avg_response_time: 3200,
    accuracy_rate: 0.93,
    total_requests: 1100,
    success_rate: 0.97
  },
  mistral: {
    avg_response_time: 2500,
    accuracy_rate: 0.91,
    total_requests: 450,
    success_rate: 0.95
  }
}

// Generate random compliance data for charts
export function generateRandomComplianceData() {
  const categories = ['Data Protection', 'Financial Terms', 'Liability', 'Termination', 'Intellectual Property', 'Governance', 'Disclosure']
  
  return categories.map(category => {
    const total = Math.floor(Math.random() * 20) + 10
    const compliant = Math.floor(Math.random() * total)
    const nonCompliant = total - compliant
    
    return {
      category,
      compliant,
      nonCompliant, 
      total
    }
  })
}

export function generateRandomRiskData() {
  const levels = [
    { level: 'High', color: '#dc2626' },
    { level: 'Medium', color: '#f59e0b' },
    { level: 'Low', color: '#10b981' },
    { level: 'None', color: '#6b7280' }
  ]
  
  return levels.map(level => ({
    ...level,
    count: Math.floor(Math.random() * 30) + 5
  }))
}
