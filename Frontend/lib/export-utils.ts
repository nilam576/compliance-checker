import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface ExportData {
  summary: string
  timelines: Record<string, any>
  clauses: Array<{
    clause_id: string
    text_en: string
  }>
  compliance_results: {
    verification_results: Array<{
      clause: any
      is_compliant: boolean | null
      matched_rules: any[]
      final_reason: string
      Section: string
    }>
    risk_explanations: Array<{
      severity: string
      category: string
      risk_score: number
      impact: string
      mitigation: string
    }>
  }
  metadata?: {
    exportDate: string
    exportedBy: string
    documentName: string
  }
}

export class ExportService {
  /**
   * Export data as JSON format
   */
  static exportAsJSON(data: ExportData, filename: string = 'compliance_export.json'): void {
    const exportPayload = {
      ...data,
      metadata: {
        ...data.metadata,
        exportDate: new Date().toISOString(),
        exportFormat: 'JSON',
        version: '1.0'
      }
    }

    const content = JSON.stringify(exportPayload, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.json') ? filename : `${filename}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    window.URL.revokeObjectURL(url)
  }

  /**
   * Export data as CSV format
   */
  static exportAsCSV(data: ExportData, filename: string = 'compliance_export.csv'): void {
    const csvRows: string[] = []
    
    // Headers
    csvRows.push('Clause ID,Clause Text,Compliance Status,Risk Level,Section,Final Reason,Risk Score,Risk Category,Mitigation')
    
    // Process verification results
    data.compliance_results.verification_results.forEach((result, index) => {
      const clause = typeof result.clause === 'object' && result.clause !== null 
        ? result.clause 
        : { clause_id: 'N/A', text_en: result.clause || 'N/A' }
      
      const riskExplanation = data.compliance_results.risk_explanations[index] || {
        risk_score: 'N/A',
        category: 'N/A',
        mitigation: 'N/A'
      }
      
      const row = [
        `"${clause.clause_id || 'N/A'}"`,
        `"${(clause.text_en || clause.text || 'N/A').replace(/"/g, '""')}"`,
        `"${result.is_compliant === null ? 'Unknown' : result.is_compliant ? 'Compliant' : 'Non-Compliant'}"`,
        `"${this.determineRiskLevel(result.is_compliant, riskExplanation.risk_score)}"`,
        `"${result.Section || 'N/A'}"`,
        `"${(result.final_reason || 'N/A').replace(/"/g, '""')}"`,
        `"${riskExplanation.risk_score || 'N/A'}"`,
        `"${riskExplanation.category || 'N/A'}"`,
        `"${(riskExplanation.mitigation || 'N/A').replace(/"/g, '""')}"`
      ]
      csvRows.push(row.join(','))
    })
    
    // Add metadata section
    csvRows.push('')
    csvRows.push('EXPORT METADATA')
    csvRows.push(`Export Date,"${new Date().toLocaleString()}"`)
    csvRows.push(`Document Summary,"${data.summary.replace(/"/g, '""')}"`)
    csvRows.push(`Total Clauses,"${data.clauses.length}"`)
    csvRows.push(`Total Verification Results,"${data.compliance_results.verification_results.length}"`)
    
    const content = csvRows.join('\n')
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    window.URL.revokeObjectURL(url)
  }

  /**
   * Export data as PDF format using jsPDF
   */
  static exportAsPDF(data: ExportData, filename: string = 'compliance_export.pdf'): void {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 20
    let currentY = margin

    // Add header to all pages
    const addHeader = () => {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('SEBI Compliance Report', margin, 10)
      doc.text(new Date().toLocaleDateString(), pageWidth - margin, 10, { align: 'right' })
    }

    // Add footer to all pages
    const addFooter = (pageNumber: number) => {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
      doc.text('Confidential', pageWidth - margin, pageHeight - 10, { align: 'right' })
    }

    // Add page numbers
    let pageNumber = 1
    addHeader()
    addFooter(pageNumber)

    // Cover Page
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('SEBI Compliance Report', pageWidth / 2, 80, { align: 'center' })
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'normal')
    doc.text('Document Compliance Analysis', pageWidth / 2, 100, { align: 'center' })
    
    if (data.metadata?.documentName) {
      doc.setFontSize(14)
      doc.text(data.metadata.documentName, pageWidth / 2, 120, { align: 'center' })
    }
    
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 140, { align: 'center' })
    doc.text('Prepared by: SEBI Compliance Dashboard', pageWidth / 2, 150, { align: 'center' })
    
    // Add disclaimer
    doc.setFontSize(10)
    const disclaimer = 'This document is automatically generated and provides an analysis of compliance with SEBI regulations. It should not be considered as legal advice.'
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin)
    doc.text(disclaimerLines, pageWidth / 2, pageHeight - 40, { align: 'center' })
    
    // Add new page for content
    doc.addPage()
    pageNumber++
    addHeader()
    addFooter(pageNumber)
    currentY = margin

    // Document Information Section
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Document Information', margin, currentY)
    currentY += 15
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    if (data.metadata?.documentName) {
      doc.text(`Document: ${data.metadata.documentName}`, margin, currentY)
      currentY += 7
    }
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, currentY)
    currentY += 7
    doc.text(`Total Clauses Analyzed: ${data.clauses.length}`, margin, currentY)
    currentY += 15

    // Executive Summary Section
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Executive Summary', margin, currentY)
    currentY += 15

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const summaryLines = doc.splitTextToSize(data.summary, pageWidth - 2 * margin)
    doc.text(summaryLines, margin, currentY)
    currentY += summaryLines.length * 7 + 10

    // Compliance Statistics
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Compliance Statistics', margin, currentY)
    currentY += 12

    const compliantCount = data.compliance_results.verification_results.filter(r => r.is_compliant === true).length
    const nonCompliantCount = data.compliance_results.verification_results.filter(r => r.is_compliant === false).length
    const unknownCount = data.compliance_results.verification_results.filter(r => r.is_compliant === null).length
    const totalClauses = data.compliance_results.verification_results.length
    const complianceRate = totalClauses > 0 ? ((compliantCount / totalClauses) * 100).toFixed(1) : '0.0'

    // Create a statistics table
    doc.autoTable({
      startY: currentY,
      head: [['Metric', 'Count', 'Percentage']],
      body: [
        ['Total Clauses', totalClauses.toString(), '100%'],
        ['Compliant', compliantCount.toString(), `${((compliantCount/totalClauses)*100).toFixed(1)}%`],
        ['Non-Compliant', nonCompliantCount.toString(), `${((nonCompliantCount/totalClauses)*100).toFixed(1)}%`],
        ['Unknown', unknownCount.toString(), `${((unknownCount/totalClauses)*100).toFixed(1)}%`],
        ['Overall Compliance Rate', '', `${complianceRate}%`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'center' }
      }
    })

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Risk Analysis Summary
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Risk Analysis Summary', margin, currentY)
    currentY += 12

    const riskCounts = data.compliance_results.risk_explanations.reduce((acc, risk) => {
      acc[risk.severity] = (acc[risk.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Create risk summary table
    const riskTableData = Object.entries(riskCounts).map(([severity, count]) => [
      severity,
      count.toString(),
      totalClauses > 0 ? `${((count/totalClauses)*100).toFixed(1)}%` : '0.0%'
    ])

    if (riskTableData.length > 0) {
      doc.autoTable({
        startY: currentY,
        head: [['Risk Severity', 'Count', 'Percentage']],
        body: riskTableData,
        theme: 'grid',
        headStyles: { fillColor: [220, 53, 69], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' }
        }
      })
      currentY = (doc as any).lastAutoTable.finalY + 15
    }

    // Detailed Results Section
    if (currentY > pageHeight - 50) {
      doc.addPage()
      pageNumber++
      addHeader()
      addFooter(pageNumber)
      currentY = margin
    }

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Detailed Compliance Results', margin, currentY)
    currentY += 12

    // Prepare detailed table data with explanations
    const detailedTableData = data.compliance_results.verification_results.map((result, index) => {
      const clause = typeof result.clause === 'object' && result.clause !== null 
        ? result.clause 
        : { clause_id: 'N/A', text_en: result.clause || 'N/A' }
      
      const riskExplanation = data.compliance_results.risk_explanations[index] || {
        risk_score: 'N/A',
        severity: 'N/A',
        impact: 'N/A',
        mitigation: 'N/A'
      }

      const complianceStatus = result.is_compliant === null 
        ? 'Unknown' 
        : result.is_compliant 
          ? 'Compliant' 
          : 'Non-Compliant'

      return [
        clause.clause_id || 'N/A',
        (clause.text_en || clause.text || 'N/A').substring(0, 50) + '...',
        complianceStatus,
        riskExplanation.severity || 'N/A',
        result.Section || 'N/A',
        (result.final_reason || 'N/A').substring(0, 60) + '...'
      ]
    })

    doc.autoTable({
      startY: currentY,
      head: [['Clause ID', 'Clause Text', 'Compliance', 'Risk Level', 'Section', 'Reason']],
      body: detailedTableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        1: { cellWidth: 50 }, // Clause text
        5: { cellWidth: 60 }  // Reason
      },
      didDrawPage: () => {
        // Update footer if new page was created
        if ((doc as any).internal.getNumberOfPages() > pageNumber) {
          pageNumber = (doc as any).internal.getNumberOfPages()
          addFooter(pageNumber)
        }
      }
    })

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Add risk explanations section if there's space
    if (currentY < pageHeight - 100) {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Risk Explanations', margin, currentY)
      currentY += 12

      // Prepare risk explanations table
      const riskExplanationData = data.compliance_results.risk_explanations.map((risk, index) => [
        (data.compliance_results.verification_results[index]?.clause?.clause_id) || `Clause ${index + 1}`,
        risk.severity || 'N/A',
        risk.category || 'N/A',
        risk.impact?.substring(0, 50) + '...' || 'N/A',
        risk.mitigation?.substring(0, 50) + '...' || 'N/A'
      ])

      if (riskExplanationData.length > 0) {
        doc.autoTable({
          startY: currentY,
          head: [['Clause ID', 'Severity', 'Category', 'Impact', 'Mitigation']],
          body: riskExplanationData,
          theme: 'striped',
          headStyles: { fillColor: [23, 162, 184] },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            3: { cellWidth: 50 }, // Impact
            4: { cellWidth: 50 }  // Mitigation
          }
        })
      }
    }

    // Add timeline section on a new page
    doc.addPage()
    pageNumber++
    addHeader()
    addFooter(pageNumber)
    currentY = margin

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Key Timelines', margin, currentY)
    currentY += 15

    // Prepare timeline table data
    const timelineEntries = Object.entries(data.timelines).map(([key, timeline]) => [
      key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Title case
      timeline.start || 'N/A',
      timeline.end || 'Ongoing',
      timeline.description ? timeline.description.substring(0, 80) + '...' : 'N/A'
    ])

    if (timelineEntries.length > 0) {
      doc.autoTable({
        startY: currentY,
        head: [['Event', 'Start', 'End', 'Description']],
        body: timelineEntries,
        theme: 'striped',
        headStyles: { fillColor: [40, 167, 69] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          3: { cellWidth: 80 } // Description
        }
      })
    } else {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('No timeline information available.', margin, currentY)
    }

    // Add appendix with full clause texts
    doc.addPage()
    pageNumber++
    addHeader()
    addFooter(pageNumber)
    currentY = margin

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Appendix: Full Clause Texts', margin, currentY)
    currentY += 15

    // Add each clause with better formatting
    data.clauses.forEach((clause, index) => {
      if (currentY > pageHeight - 50) {
        doc.addPage()
        pageNumber++
        addHeader()
        addFooter(pageNumber)
        currentY = margin
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`Clause ${index + 1}: ${clause.clause_id}`, margin, currentY)
      currentY += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const clauseLines = doc.splitTextToSize(clause.text_en, pageWidth - 2 * margin)
      doc.text(clauseLines, margin, currentY)
      currentY += clauseLines.length * 5 + 10

      // Add a line separator
      doc.setLineWidth(0.1)
      doc.line(margin, currentY, pageWidth - margin, currentY)
      currentY += 10
    })

    // Save the PDF
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
  }

  /**
   * Determine risk level based on compliance status and risk score
   */
  private static determineRiskLevel(isCompliant: boolean | null, riskScore: number | string): string {
    if (isCompliant === false) return 'High'
    if (isCompliant === null) return 'Medium'
    
    const score = typeof riskScore === 'number' ? riskScore : parseInt(riskScore as string) || 0
    if (score >= 7) return 'High'
    if (score >= 4) return 'Medium'
    return 'Low'
  }

  /**
   * Validate export data structure
   */
  static validateExportData(data: any): data is ExportData {
    return (
      data &&
      typeof data.summary === 'string' &&
      typeof data.timelines === 'object' &&
      Array.isArray(data.clauses) &&
      data.compliance_results &&
      Array.isArray(data.compliance_results.verification_results) &&
      Array.isArray(data.compliance_results.risk_explanations)
    )
  }

  /**
   * Load debug results from JSON file path or data object
   */
  static async loadDebugResults(source: string | object): Promise<ExportData> {
    let data: any

    if (typeof source === 'string') {
      // If source is a file path, we'll handle it client-side
      throw new Error('File loading from path not supported in browser environment')
    } else {
      data = source
    }

    if (!this.validateExportData(data)) {
      throw new Error('Invalid export data structure')
    }

    return data as ExportData
  }
}
