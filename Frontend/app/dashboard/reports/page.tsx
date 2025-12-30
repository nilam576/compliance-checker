'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, FileText, Filter, Calendar, BarChart3 } from 'lucide-react'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('compliance')
  const [timeRange, setTimeRange] = useState('30d')
  const [exportLoading, setExportLoading] = useState(false)
  const [gcpReports, setGcpReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setReportsLoading(true)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/dashboard/reports`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      if (result.status === 'success') {
        setGcpReports(result.data || [])
      } else {
        throw new Error(result.message || 'Failed to fetch reports')
      }
    } catch (err) {
      console.error('Error fetching reports:', err)
      setGcpReports([])
    } finally {
      setReportsLoading(false)
    }
  }

  // Load reports on component mount
  React.useEffect(() => {
    fetchReports()
  }, [])

  const handleExportReport = async (format: 'csv' | 'json', reportType?: string) => {
    setExportLoading(true)
    try {
      let exportData
      let filename

      if (reportType) {
        // Use GCP export endpoints for detailed reports
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'

        let endpoint = ''
        switch (reportType) {
          case 'compliance':
            endpoint = '/api/dashboard/reports/export/compliance'
            filename = `compliance-reports-${new Date().toISOString().split('T')[0]}`
            break
          case 'risk':
            endpoint = '/api/dashboard/reports/export/risk-analysis'
            filename = `risk-analysis-${new Date().toISOString().split('T')[0]}`
            break
          case 'trends':
            endpoint = '/api/dashboard/reports/export/trend-analysis'
            filename = `trend-analysis-${new Date().toISOString().split('T')[0]}`
            break
          case 'custom':
            endpoint = '/api/dashboard/reports/export/custom'
            filename = `custom-report-${new Date().toISOString().split('T')[0]}`
            break
          default:
            endpoint = '/api/dashboard/reports/export/compliance'
            filename = `compliance-report-${new Date().toISOString().split('T')[0]}`
        }

        const response = await fetch(`${apiUrl}${endpoint}`)
        if (!response.ok) {
          throw new Error('Failed to fetch export data from GCP')
        }

        const result = await response.json()
        exportData = result.data
      } else {
        // Fallback to basic export
        exportData = { message: 'No data available for export' }
        filename = `compliance-report-${new Date().toISOString().split('T')[0]}`
      }
      
      if (format === 'json') {
        // Enhanced JSON export with metadata
        const enhancedExportData = {
          metadata: {
            report_type: reportType || 'compliance',
            generated_at: new Date().toISOString(),
            generated_by: 'SEBI Compliance System',
            version: '1.0.0',
            data_source: 'GCP Cloud Storage',
            total_documents: exportData.documents?.length || 0,
            export_format: 'json'
          },
          ...exportData,
          analytics: reportType === 'compliance' && exportData.documents ? {
            processing_success_rate: ((exportData.documents.filter((d: any) => d.clauses_analyzed > 0).length / exportData.documents.length) * 100).toFixed(1) + '%',
            average_compliance_rate: (exportData.documents.reduce((sum: number, doc: any) => {
              return sum + (doc.clauses_analyzed > 0 ? (doc.compliant_clauses / doc.clauses_analyzed) : 0)
            }, 0) / exportData.documents.length * 100).toFixed(1) + '%',
            risk_distribution: {
              high: exportData.documents.filter((d: any) => d.risk_level === 'high').length,
              medium: exportData.documents.filter((d: any) => d.risk_level === 'medium').length,
              low: exportData.documents.filter((d: any) => d.risk_level === 'low').length
            },
            total_clauses_processed: exportData.documents.reduce((sum: number, doc: any) => sum + (doc.clauses_analyzed || 0), 0),
            total_violations: exportData.documents.reduce((sum: number, doc: any) => sum + (doc.violations?.length || 0), 0),
            documents_by_status: {
              completed: exportData.documents.filter((d: any) => d.status === 'completed').length,
              processing: exportData.documents.filter((d: any) => d.status === 'processing').length,
              failed: exportData.documents.filter((d: any) => d.status === 'failed').length
            }
          } : undefined
        }
        
        const blob = new Blob([JSON.stringify(enhancedExportData, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        await exportToCSV(exportData, filename, reportType)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExportLoading(false)
    }
  }

  const exportToCSV = async (data: any, filename: string, reportType?: string) => {
    try {
      let csvContent = ''

      if (reportType === 'compliance' && data.documents) {
        // Enhanced compliance reports CSV with detailed analysis
        csvContent = 'Document ID,Filename,Upload Date,File Size,Compliance Status,Risk Level,Clauses Analyzed,Compliant Clauses,Violations Count,Compliance Rate,Overall Score,Processing Status,LLM Provider,Processing Time,Last Updated\n'
        data.documents.forEach((doc: any) => {
          const uploadDate = doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'
          const lastUpdated = doc.processed_at ? new Date(doc.processed_at).toLocaleDateString() : 'N/A'
          const complianceRate = doc.clauses_analyzed > 0 ? ((doc.compliant_clauses / doc.clauses_analyzed) * 100).toFixed(1) + '%' : '0%'
          
          csvContent += `"${doc.document_id || 'N/A'}","${doc.filename || 'N/A'}","${uploadDate}","${doc.file_size || 'N/A'}","${doc.compliance_status || 'Processed'}","${doc.risk_level || 'Medium'}","${doc.clauses_analyzed || 0}","${doc.compliant_clauses || 0}","${doc.violations?.length || 0}","${complianceRate}","${doc.overall_score || 0}","${doc.status || 'Unknown'}","${doc.llm_provider || 'GCP Analysis'}","${doc.processing_time || 'N/A'}","${lastUpdated}"\n`
        })
        
        // Add summary information
        if (data.summary) {
          csvContent += '\n\n--- SUMMARY ---\n'
          csvContent += 'Metric,Value\n'
          csvContent += `"Total Documents","${data.summary.total_documents || data.documents.length}"\n`
          csvContent += `"Successfully Processed","${data.summary.processed_documents || data.documents.filter((d: any) => d.clauses_analyzed > 0).length}"\n`
          csvContent += `"Overall Compliance Rate","${data.compliance_rate || 0}%"\n`
          csvContent += `"Average Risk Level","${data.summary.average_risk_level || 'Medium'}"\n`
          csvContent += `"Total Clauses Analyzed","${data.summary.total_clauses_analyzed || data.documents.reduce((sum: number, doc: any) => sum + (doc.clauses_analyzed || 0), 0)}"\n`
        }
      } else if (reportType === 'risk') {
        // Enhanced risk analysis CSV with detailed breakdown
        csvContent = 'Document ID,Filename,File Size,Risk Level,Risk Score,Total Clauses,High Risk Clauses,Medium Risk Clauses,Low Risk Clauses,Violations Count,Compliance Rate,Risk Category,Mitigation Recommendations,Processing Status,Assessment Date\n'
        
        if (data.documents) {
          data.documents.forEach((doc: any) => {
            const assessmentDate = doc.processed_at ? new Date(doc.processed_at).toLocaleDateString() : 'N/A'
            const complianceRate = doc.clauses_analyzed > 0 ? ((doc.compliant_clauses / doc.clauses_analyzed) * 100).toFixed(1) + '%' : '0%'
            const totalViolations = (doc.violations?.length || 0)
            const mitigationCount = doc.recommendations?.length || 0
            
            csvContent += `"${doc.document_id || 'N/A'}","${doc.filename || 'N/A'}","${doc.file_size || 'N/A'}","${doc.risk_level || 'Medium'}","${doc.overall_score || 0}","${doc.clauses_analyzed || 0}","${doc.high_risk_clauses || 0}","${doc.medium_risk_clauses || 0}","${doc.low_risk_clauses || 0}","${totalViolations}","${complianceRate}","${doc.risk_category || 'General'}","${mitigationCount}","${doc.status || 'Unknown'}","${assessmentDate}"\n`
          })
          
          // Add risk distribution summary
          csvContent += '\n\n--- RISK ANALYSIS SUMMARY ---\n'
          csvContent += 'Risk Metric,Count,Percentage\n'
          const totalDocs = data.documents.length
          const highRiskDocs = data.documents.filter((d: any) => d.risk_level === 'high').length
          const mediumRiskDocs = data.documents.filter((d: any) => d.risk_level === 'medium').length
          const lowRiskDocs = data.documents.filter((d: any) => d.risk_level === 'low').length
          
          csvContent += `"High Risk Documents","${highRiskDocs}","${((highRiskDocs / totalDocs) * 100).toFixed(1)}%"\n`
          csvContent += `"Medium Risk Documents","${mediumRiskDocs}","${((mediumRiskDocs / totalDocs) * 100).toFixed(1)}%"\n`
          csvContent += `"Low Risk Documents","${lowRiskDocs}","${((lowRiskDocs / totalDocs) * 100).toFixed(1)}%"\n`
          
          const avgComplianceRate = data.documents.reduce((sum: number, doc: any) => {
            return sum + (doc.clauses_analyzed > 0 ? (doc.compliant_clauses / doc.clauses_analyzed) : 0)
          }, 0) / totalDocs
          csvContent += `"Average Compliance Rate","${(avgComplianceRate * 100).toFixed(1)}%","100%"\n`
          csvContent += `"Total Violations","${data.documents.reduce((sum: number, doc: any) => sum + (doc.violations?.length || 0), 0)}","N/A"\n`
        }
      } else if (reportType === 'trends' && data.compliance_trends) {
        // Enhanced trend analysis CSV
        csvContent = 'Date,Compliance Rate,Documents Count,Average Risk Score,High Risk Count,Medium Risk Count,Low Risk Count,Violation Trend\n'
        data.compliance_trends.forEach((trend: any) => {
          csvContent += `"${trend.date}","${trend.compliance_rate}%","${trend.total_documents}","${trend.avg_risk_score || 'N/A'}","${trend.high_risk_count || 0}","${trend.medium_risk_count || 0}","${trend.low_risk_count || 0}","${trend.violation_trend || 'Stable'}"\n`
        })
      } else if (reportType === 'custom') {
        // Custom report CSV format
        csvContent = 'Report Section,Metric,Value,Description,Generated Date\n'
        const generateDate = new Date().toLocaleDateString()
        
        if (data.summary) {
          Object.entries(data.summary).forEach(([key, value]) => {
            csvContent += `"Summary","${key}","${value}","Summary metric","${generateDate}"\n`
          })
        }
        
        if (data.details) {
          Object.entries(data.details).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((item: any, index: number) => {
                csvContent += `"${key}","Item ${index + 1}","${JSON.stringify(item)}","Detail item","${generateDate}"\n`
              })
            } else {
              csvContent += `"Details","${key}","${value}","Detail metric","${generateDate}"\n`
            }
          })
        }
      } else {
        // Enhanced generic CSV export
        csvContent = 'Section,Key,Value,Type,Generated Date\n'
        const generateDate = new Date().toLocaleDateString()
        
        const flattenObject = (obj: any, section = 'Data') => {
          Object.keys(obj).forEach(key => {
            const value = obj[key]
            const valueType = typeof value
            
            if (value !== null && valueType === 'object' && !Array.isArray(value)) {
              flattenObject(value, key)
            } else if (Array.isArray(value)) {
              csvContent += `"${section}","${key}","${value.length} items","Array","${generateDate}"\n`
            } else {
              csvContent += `"${section}","${key}","${value}","${valueType}","${generateDate}"\n`
            }
          })
        }
        
        flattenObject(data)
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('CSV export failed:', error)
      throw error
    }
  }

  const downloadDocumentFromGCP = async (documentId: string, filename: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/dashboard/documents/${documentId}/download`)
      
      if (!response.ok) {
        throw new Error('Failed to download document from GCP')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Document download failed:', error)
      throw error
    }
  }

  const generateTrendChart = async (data: any) => {
    try {
      // Create a simple SVG chart for trend analysis
      const width = 800
      const height = 400
      const margin = { top: 20, right: 30, bottom: 40, left: 50 }
      
      const trends = data.compliance_trends || []
      if (trends.length === 0) return null
      
      const maxRate = Math.max(...trends.map((t: any) => t.compliance_rate))
      const minRate = Math.min(...trends.map((t: any) => t.compliance_rate))
      
      let svgContent = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              .axis { stroke: #333; stroke-width: 1; }
              .grid { stroke: #ccc; stroke-width: 0.5; stroke-dasharray: 2,2; }
              .line { fill: none; stroke: #2563eb; stroke-width: 2; }
              .point { fill: #2563eb; stroke: white; stroke-width: 2; }
              .text { font-family: Arial, sans-serif; font-size: 12px; fill: #333; }
              .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #333; }
            </style>
          </defs>
          
          <!-- Background -->
          <rect width="${width}" height="${height}" fill="white"/>
          
          <!-- Title -->
          <text x="${width/2}" y="20" text-anchor="middle" class="title">Compliance Trend Analysis</text>
          
          <!-- Axes -->
          <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis"/>
          <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis"/>
      `
      
      // Y-axis labels
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + (height - margin.top - margin.bottom) * i / 5
        const value = maxRate - (maxRate - minRate) * i / 5
        svgContent += `<text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" class="text">${value.toFixed(0)}%</text>`
        svgContent += `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" class="grid"/>`
      }
      
      // Plot data
      const xStep = (width - margin.left - margin.right) / (trends.length - 1)
      let pathData = 'M'
      
      trends.forEach((trend: any, index: number) => {
        const x = margin.left + index * xStep
        const y = margin.top + (height - margin.top - margin.bottom) * (1 - (trend.compliance_rate - minRate) / (maxRate - minRate))
        
        if (index === 0) {
          pathData += `${x},${y}`
        } else {
          pathData += ` L${x},${y}`
        }
        
        // Add point
        svgContent += `<circle cx="${x}" cy="${y}" r="4" class="point"/>`
        
        // Add x-axis label
        svgContent += `<text x="${x}" y="${height - margin.bottom + 15}" text-anchor="middle" class="text">${trend.date}</text>`
      })
      
      svgContent += `<path d="${pathData}" class="line"/>`
      svgContent += '</svg>'
      
      return svgContent
    } catch (error) {
      console.error('Chart generation failed:', error)
      return null
    }
  }

  // Transform GCP reports data for display
  const reports = gcpReports ? gcpReports.map((report: any, index: number) => ({
    id: report.id || `report_${index + 1}`,
    name: report.title || `Report ${index + 1}`,
    type: report.type || 'Compliance',
    date: report.generatedAt || new Date().toISOString().split('T')[0],
    status: report.status || 'Ready',
    size: report.size || 'N/A'
  })) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download compliance and analysis reports
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Quick Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Generate New Report
          </CardTitle>
          <CardDescription>
            Export detailed compliance reports from GCP in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={async () => {
                  try {
                    setExportLoading(true)
                    await handleExportReport('json', 'compliance')
                  } catch (error) {
                    console.error('Export failed:', error)
                  } finally {
                    setExportLoading(false)
                  }
                }}
                disabled={exportLoading}
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                {exportLoading ? (
                  <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Download className="h-6 w-6" />
                )}
                <div className="text-center">
                  <div className="font-medium">Summary</div>
                  <div className="text-xs text-muted-foreground">Compliance summary report</div>
                </div>
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setExportLoading(true)
                    await handleExportReport('json', 'risk')
                  } catch (error) {
                    console.error('Export failed:', error)
                  } finally {
                    setExportLoading(false)
                  }
                }}
                disabled={exportLoading}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                {exportLoading ? (
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Download className="h-6 w-6" />
                )}
                <div className="text-center">
                  <div className="font-medium">Risk Analysis</div>
                  <div className="text-xs text-muted-foreground">Risk assessment reports</div>
                </div>
              </Button>
              <Button
                onClick={() => handleExportReport('json', 'trends')}
                disabled={exportLoading}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                {exportLoading ? (
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Download className="h-6 w-6" />
                )}
                <div className="text-center">
                  <div className="font-medium">Trend Analysis</div>
                  <div className="text-xs text-muted-foreground">Historical trends</div>
                </div>
              </Button>
              <Button
                onClick={() => handleExportReport('json', 'custom')}
                disabled={exportLoading}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                {exportLoading ? (
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Download className="h-6 w-6" />
                )}
                <div className="text-center">
                  <div className="font-medium">Custom Report</div>
                  <div className="text-xs text-muted-foreground">Filtered custom reports</div>
                </div>
            </Button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="secondary"
                size="sm"
                disabled={exportLoading}
                onClick={() => handleExportReport('csv', 'compliance')}
              >
                {exportLoading ? 'Exporting...' : 'Export All as CSV'}
            </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={exportLoading}
                onClick={() => handleExportReport('json', 'compliance')}
              >
                {exportLoading ? 'Exporting...' : 'Export All as JSON'}
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Compliance Reports</CardTitle>
              <CardDescription>
                Download comprehensive compliance analysis reports from GCP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="ml-2">Loading reports from GCP...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 mb-4">
                      <Button
                        onClick={() => handleExportReport('json', 'compliance')}
                        disabled={exportLoading}
                        variant="outline"
                        size="sm"
                      >
                        {exportLoading ? (
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Export Detailed Compliance Report (JSON)
                      </Button>
                      <Button
                        onClick={() => handleExportReport('csv', 'compliance')}
                        disabled={exportLoading}
                        variant="outline"
                        size="sm"
                      >
                        {exportLoading ? (
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Export as CSV
                      </Button>
                    </div>
                {reports.filter(r => r.type === 'Compliance').map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Generated on {report.date} • {report.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'Ready' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        disabled={report.status !== 'Ready' || exportLoading}
                        onClick={async () => {
                          try {
                            setExportLoading(true)
                            await handleExportReport('json', 'compliance')
                          } catch (error) {
                            console.error('Export failed:', error)
                          } finally {
                            setExportLoading(false)
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis Reports</CardTitle>
              <CardDescription>
                Detailed risk assessment and mitigation reports with document analysis from GCP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={() => handleExportReport('json', 'risk')}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    {exportLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export Risk Analysis (JSON)
                  </Button>
                  <Button
                    onClick={() => handleExportReport('csv', 'risk')}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    {exportLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export as CSV
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Documents Available for Analysis</h4>
                  <div className="grid gap-3">
                    {gcpReports && gcpReports.length > 0 ? (
                      gcpReports.map((doc: any, index: number) => (
                        <div key={doc.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{doc.filename || `Document ${index + 1}`}</p>
                              <p className="text-xs text-muted-foreground">
                                Risk Level: {doc.risk_level || 'Medium'} • 
                                Status: {doc.status || 'Analyzed'}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadDocumentFromGCP(doc.id || `doc_${index}`, doc.filename || `document_${index + 1}.pdf`)}
                            disabled={exportLoading}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No documents available for risk analysis</p>
                        <p className="text-xs">Upload documents to generate risk assessments</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Generated Risk Reports</h4>
                  {reports.filter(r => r.type === 'Risk Analysis').length > 0 ? (
                    reports.filter(r => r.type === 'Risk Analysis').map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Generated on {report.date} • {report.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'Ready' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        disabled={report.status !== 'Ready' || exportLoading}
                        onClick={async () => {
                          try {
                            setExportLoading(true)
                            await handleExportReport('json', 'risk')
                          } catch (error) {
                            console.error('Export failed:', error)
                          } finally {
                            setExportLoading(false)
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No risk analysis reports generated yet
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis Reports</CardTitle>
              <CardDescription>
                Historical compliance trends and patterns with interactive graphs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={() => handleExportReport('json', 'trends')}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    {exportLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export Trend Data (JSON)
                  </Button>
                  <Button
                    onClick={() => handleExportReport('csv', 'trends')}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    {exportLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export as CSV
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        setExportLoading(true)
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
                        const response = await fetch(`${apiUrl}/api/dashboard/reports/export/trend-analysis`)
                        
                        if (!response.ok) throw new Error('Failed to fetch trend data')
                        
                        const result = await response.json()
                        const svgChart = await generateTrendChart(result.data)
                        
                        if (svgChart) {
                          const blob = new Blob([svgChart], { type: 'image/svg+xml' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `compliance-trend-chart-${new Date().toISOString().split('T')[0]}.svg`
                          a.click()
                          URL.revokeObjectURL(url)
                        } else {
                          alert('No trend data available to generate chart')
                        }
                      } catch (error) {
                        console.error('Chart export failed:', error)
                        alert('Failed to export trend chart')
                      } finally {
                        setExportLoading(false)
                      }
                    }}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    {exportLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    Download Chart (SVG)
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Compliance Trend Visualization</h4>
                    <Badge variant="outline">Interactive</Badge>
                  </div>
              <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Trend Analysis Chart</p>
                    <p className="text-sm">
                      Historical compliance trends will be displayed here once sufficient data is available.
                    </p>
                    <p className="text-xs mt-2">
                      Upload more documents and perform compliance analysis to generate meaningful trends.
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Trend Analysis Features</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Compliance Rate Over Time</h5>
                      <p className="text-xs text-muted-foreground">
                        Track how compliance rates change across different time periods
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Risk Level Distribution</h5>
                      <p className="text-xs text-muted-foreground">
                        Analyze the distribution of risk levels across documents over time
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Document Volume Trends</h5>
                      <p className="text-xs text-muted-foreground">
                        Monitor the volume of documents processed and analyzed
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Violation Patterns</h5>
                      <p className="text-xs text-muted-foreground">
                        Identify patterns in compliance violations and regulatory breaches
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>
                Create custom reports with specific criteria and filters from GCP data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Export Buttons */}
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={() => handleExportReport('json', 'custom')}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    {exportLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export Custom Report (JSON)
                  </Button>
                  <Button
                    onClick={() => handleExportReport('csv', 'custom')}
                    disabled={exportLoading}
                    variant="outline"
                    size="sm"
                  >
                    {exportLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export as CSV
                  </Button>
                </div>

                {/* Filter Options */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Report Filters & Criteria</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Risk Level Filter</label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Risk Levels</SelectItem>
                          <SelectItem value="high">High Risk Only</SelectItem>
                          <SelectItem value="medium">Medium Risk Only</SelectItem>
                          <SelectItem value="low">Low Risk Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Compliance Status</label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="compliant">Compliant Only</SelectItem>
                          <SelectItem value="non-compliant">Non-Compliant Only</SelectItem>
                          <SelectItem value="pending">Pending Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Document Type</label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Document Types</SelectItem>
                          <SelectItem value="contract">Contracts</SelectItem>
                          <SelectItem value="policy">Policies</SelectItem>
                          <SelectItem value="agreement">Agreements</SelectItem>
                          <SelectItem value="regulation">Regulations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date Range</label>
                      <Select defaultValue="30d">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                          <SelectItem value="1y">Last year</SelectItem>
                          <SelectItem value="all">All time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="secondary" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Filters & Generate Report
                    </Button>
                  </div>
                </div>

                {/* Report Templates */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Quick Report Templates</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-sm">High-Risk Documents</h5>
                          <p className="text-xs text-muted-foreground">
                            All documents with high risk assessment
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-sm">Non-Compliant Items</h5>
                          <p className="text-xs text-muted-foreground">
                            Documents failing compliance checks
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-sm">Recent Analysis</h5>
                          <p className="text-xs text-muted-foreground">
                            Documents analyzed in the last 7 days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Metrics */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Include Custom Metrics</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="compliance-score" className="rounded" defaultChecked />
                        <label htmlFor="compliance-score" className="text-sm">Overall Compliance Score</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="risk-breakdown" className="rounded" defaultChecked />
                        <label htmlFor="risk-breakdown" className="text-sm">Risk Level Breakdown</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="violation-details" className="rounded" defaultChecked />
                        <label htmlFor="violation-details" className="text-sm">Detailed Violation Analysis</label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="time-analysis" className="rounded" />
                        <label htmlFor="time-analysis" className="text-sm">Processing Time Analysis</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="recommendations" className="rounded" defaultChecked />
                        <label htmlFor="recommendations" className="text-sm">Risk Mitigation Recommendations</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="document-metadata" className="rounded" />
                        <label htmlFor="document-metadata" className="text-sm">Document Metadata & Properties</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Report Preview</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center py-6 text-muted-foreground">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="font-medium text-sm">Custom Report Preview</p>
                      <p className="text-xs">
                        Configure your filters and metrics above, then generate your custom report
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
