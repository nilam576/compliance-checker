'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  Share,
  Clock,
  User,
  Calendar,
  BarChart3,
  TrendingUp,
  ExternalLink
} from 'lucide-react'

interface Clause {
  id: string
  text: string
  riskLevel: 'high' | 'medium' | 'low' | 'compliant'
  regulation: string
  recommendation: string
  confidence: number
  isCompliant?: boolean
  riskScore?: number
  category?: string
  impact?: string
}

interface AnalysisResult {
  id: string
  documentName: string
  uploadedAt: string
  analyzedAt: string
  totalClauses: number
  compliantClauses: number
  highRiskClauses: number
  mediumRiskClauses: number
  lowRiskClauses: number
  overallScore: number
  llmProvider: string
  processingTime: number
  clauses: Clause[]
  summary?: {
    complianceRate: number
    riskLevel: string
    totalClausesAnalyzed: number
    riskScore: number
  }
  recommendations?: Array<{
    type: string
    title: string
    description: string
    priority: string
  }>
}

export default function AnalysisResultPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        console.log(`Fetching real-time analysis for document ID: ${params.id}`)

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'

        // Use the document analysis endpoint  
        const response = await fetch(`${apiUrl}/api/dashboard/analysis/${params.id}`)

        if (response.ok) {
          const apiData = await response.json()
          console.log('Real-time analysis response:', apiData)

          if (apiData.status === 'success' && apiData.data) {
            const data = apiData.data

            // Convert backend analysis data to frontend format  
            const clauses = data.clauses || []

            // Convert clauses to expected format
            const convertedClauses = clauses.map((clause: any, index: number) => {
              return {
                id: clause.id || `clause_${index + 1}`,
                text: clause.text || `Clause ${index + 1}`,
                riskLevel: clause.riskLevel || (clause.isCompliant ? 'none' : 'medium'),
                regulation: clause.category || 'SEBI Regulations',
                recommendation: clause.mitigation || clause.explanation || 'Review clause for compliance', 
                confidence: Math.round((clause.confidenceScore || 0.85) * 100),
                isCompliant: clause.isCompliant || false,
                riskScore: clause.riskScore || 0,
                category: clause.category || 'General',
                impact: clause.impact || 'No specific impact identified'
              }
            }) || []

            setResult({
              id: data.id || params.id,
              documentName: data.fileName || 'Unknown Document',
              uploadedAt: data.uploadedAt || new Date().toISOString(),
              analyzedAt: data.processedAt || new Date().toISOString(),
              totalClauses: data.totalClauses || 0,
              compliantClauses: data.compliantClauses || 0, 
              highRiskClauses: data.highRiskClauses || 0,
              mediumRiskClauses: data.mediumRiskClauses || 0,
              lowRiskClauses: data.lowRiskClauses || 0,
              overallScore: data.overallScore || 0,
              llmProvider: data.language || 'GCP Analysis',
              processingTime: 2500, // Standard processing time
              clauses: convertedClauses,
              summary: {
                complianceRate: data.complianceRate || data.overallScore || 0,
                riskLevel: data.riskLevel || 'medium',
                totalClausesAnalyzed: data.totalClauses || 0,
                riskScore: Math.round((100 - (data.overallScore || 50)) / 10)
              },
              recommendations: clauses.filter((clause: any) => clause.mitigation)
                .map((clause: any) => ({
                  type: clause.riskLevel || 'medium',
                  title: `${clause.category} Compliance Issue`,
                  description: clause.mitigation || clause.explanation || 'Review for compliance',
                  priority: clause.riskLevel === 'high' ? 'high' : clause.riskLevel === 'medium' ? 'medium' : 'low'
                })) || []
            })

            console.log('Successfully loaded real-time analysis data')
            setLoading(false)
            return
          }
        }

        // If real-time analysis fails, show error
        console.error('Real-time analysis failed')
        setResult(null)
      } catch (error) {
        console.error('Error fetching real-time analysis:', error)
        setResult(null)
      } finally {
        setLoading(false)
      }
        
    }

    fetchAnalysisData()
  }, [params.id])

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      case 'compliant': return 'default'
      default: return 'secondary'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <AlertTriangle className="h-4 w-4" />
      case 'low': return <AlertTriangle className="h-4 w-4" />
      case 'compliant': return <CheckCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Analysis not found</h2>
            <Button onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
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
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h1 className="text-2xl font-bold">{result.documentName}</h1>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Analyzed: {new Date(result.analyzedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Processing time: {result.processingTime}s
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {result.llmProvider}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className="text-2xl font-bold">{result.overallScore}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compliant</p>
                  <p className="text-2xl font-bold">{result.compliantClauses}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-2xl font-bold">{result.highRiskClauses}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clauses</p>
                  <p className="text-2xl font-bold">{result.totalClauses}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="clauses" className="w-full">
                <TabsList>
                  <TabsTrigger value="clauses">Clauses</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="clauses" className="space-y-6">
                  {result.clauses && result.clauses.length > 0 ? (
                    result.clauses.map((clause, index) => (
                      <motion.div
                        key={clause.id}
                        className="border rounded-lg p-4 space-y-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-sm font-medium">Clause {index + 1}</p>
                              {clause.isCompliant !== undefined && (
                                <Badge variant={clause.isCompliant ? "default" : "destructive"}>
                                  {clause.isCompliant ? "✓ Compliant" : "✗ Non-compliant"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              {clause.text}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRiskBadgeColor(clause.riskLevel)}>
                              {getRiskIcon(clause.riskLevel)}
                              {clause.riskLevel}
                            </Badge>
                            {clause.riskScore !== undefined && clause.riskScore > 0 && (
                              <Badge variant="secondary">
                                Risk Score: {clause.riskScore}
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {clause.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Related Regulation</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              {clause.regulation}
                              <ExternalLink className="h-3 w-3" />
                            </p>
                            {clause.category && (
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-1">Category</p>
                                <Badge variant="outline" className="text-xs">
                                  {clause.category}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Recommendation</p>
                            <p className="text-sm text-muted-foreground mb-2">
                              {clause.recommendation}
                            </p>
                            {clause.impact && (
                              <div>
                                <p className="text-sm font-medium mb-1">Impact Assessment</p>
                                <p className="text-xs text-muted-foreground">
                                  {clause.impact}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8">
                        <div className="text-center space-y-4">
                          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto" />
                          <div>
                            <h3 className="text-lg font-medium">No Clauses Analyzed</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                              This document processing encountered an issue during clause extraction. 
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Document Status: {result.summary?.riskLevel || 'Processing incomplete'}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Trigger reprocessing - would need backend endpoint
                                console.log('Reprocess document:', result.id)
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Request Reprocessing
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => router.push('/dashboard/documents')}
                            >
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              View All Documents
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Risk Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">High Risk</span>
                            <span className="text-sm font-medium">{result.highRiskClauses} clauses</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Medium Risk</span>
                            <span className="text-sm font-medium">{result.mediumRiskClauses} clauses</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Low Risk</span>
                            <span className="text-sm font-medium">{result.lowRiskClauses} clauses</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Compliant</span>
                            <span className="text-sm font-medium">{result.compliantClauses} clauses</span>
                          </div>
                          {result.summary && (
                            <>
                              <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Risk Level</span>
                                  <Badge variant={
                                    result.summary.riskLevel === 'High' ? 'destructive' :
                                    result.summary.riskLevel === 'Medium' ? 'secondary' :
                                    'default'
                                  }>
                                    {result.summary.riskLevel}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Risk Score</span>
                                <span className="text-sm font-medium">{result.summary.riskScore?.toFixed(1) || 0}%</span>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Analysis Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Processing Time</span>
                            <span className="text-sm font-medium">{result.processingTime}s</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">LLM Provider</span>
                            <span className="text-sm font-medium">{result.llmProvider}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Overall Score</span>
                            <span className="text-sm font-medium">{result.overallScore}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4">
                  <div className="space-y-6">
                    {result.recommendations && result.recommendations.length > 0 ? (
                      <>
                        {/* High Priority Recommendations */}
                        {result.recommendations.filter(rec => rec.priority === 'high' || rec.type === 'High').length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg text-red-600">Immediate Action Required</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {result.recommendations
                                  .filter(rec => rec.priority === 'high' || rec.type === 'High')
                                  .map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                                      <span className="text-sm">{rec.description || rec.title}</span>
                                    </li>
                                  ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {/* Medium Priority Recommendations */}
                        {result.recommendations.filter(rec => rec.priority === 'medium' || rec.type === 'Medium').length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg text-yellow-600">Recommended Improvements</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {result.recommendations
                                  .filter(rec => rec.priority === 'medium' || rec.type === 'Medium')
                                  .map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5" />
                                      <span className="text-sm">{rec.description || rec.title}</span>
                                    </li>
                                  ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {/* Low Priority Recommendations */}
                        {result.recommendations.filter(rec => rec.priority === 'low').length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg text-blue-600">Optional Enhancements</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {result.recommendations
                                  .filter(rec => rec.priority === 'low')
                                  .map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                      <span className="text-sm">{rec.description || rec.title}</span>
                                    </li>
                                  ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-green-600">Analysis Complete</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <p>All clauses have been analyzed for compliance.</p>
                            <p className="text-sm mt-2">No specific recommendations needed at this time.</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}