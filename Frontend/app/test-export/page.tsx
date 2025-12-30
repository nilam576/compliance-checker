'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExportButton } from '@/components/shared/ExportButton'
import { ExportData } from '@/lib/export-utils'

export default function TestExportPage() {
  const [isLoading, setIsLoading] = useState(false)

  // Sample export data for testing
  const sampleExportData: ExportData = {
    summary: "This document details the terms and conditions for a Personal Power Loan agreement between Axis Bank Ltd. and the applicant, POYYAR DASS S, operating from ASC Madurai. The loan amount sanctioned is Rs. 20,00,000, with a fixed annual interest rate of 10.49%. The repayment tenure is set for 84 months, with Equated Monthly Installments (EMIs) amounting to Rs. 33,711.",
    timelines: {
      loan_repayment_period: {
        start: "Date of Agreement/Disbursal",
        end: "84 months from start",
        description: "The period over which the Personal Power Loan of Rs. 20,00,000 is to be repaid in 84 monthly installments."
      },
      foreclosure_charges_initial_period: {
        start: "Loan A/c opening Date",
        end: "Up to 36 EMIs from Loan A/c opening Date",
        description: "Foreclosure charges of 3% + GST are applicable on the principal outstanding."
      }
    },
    clauses: [
      {
        clause_id: "C-1",
        text_en: "I/We have been provided the following information and I/We have read and understood the following information and agree with the same and have accordingly filled up the aforesaid application form."
      },
      {
        clause_id: "C-2", 
        text_en: "Interest on the Personal Power loan shall accrue from the date on which the disbursal has been effected in the loan account and accordingly the computation of the first EMI shall be calculated only for the actual number of days remaining for the due date of first installment."
      },
      {
        clause_id: "C-3",
        text_en: "The Bank agrees, based on the Borrower's Request, Representations, Warranties, Covenants and Undertakings as contained herein and in the application for Personal Power Loan and other documents executed or tendered by the Borrower in relation to the Personal Power Loan, to lend to the Borrower and the Borrower agrees to borrow from the Bank, the Personal Power Loan on the terms and conditions as fully contained in this Agreement and the Schedule 'B'."
      }
    ],
    compliance_results: {
      verification_results: [
        {
          clause: {
            clause_id: "C-1",
            text_en: "I/We have been provided the following information and I/We have read and understood the following information and agree with the same and have accordingly filled up the aforesaid application form."
          },
          is_compliant: null,
          matched_rules: [],
          final_reason: "Compliance cannot be determined as no specific regulatory rules were provided for comparison.",
          Section: "Compliance"
        },
        {
          clause: {
            clause_id: "C-2",
            text_en: "Interest on the Personal Power loan shall accrue from the date on which the disbursal has been effected in the loan account and accordingly the computation of the first EMI shall be calculated only for the actual number of days remaining for the due date of first installment."
          },
          is_compliant: false,
          matched_rules: [],
          final_reason: "Compliance verification for the clause could not be performed due to incomplete rule data.",
          Section: "Banking"
        },
        {
          clause: {
            clause_id: "C-3",
            text_en: "The Bank agrees, based on the Borrower's Request, Representations, Warranties, Covenants and Undertakings as contained herein and in the application for Personal Power Loan and other documents executed or tendered by the Borrower in relation to the Personal Power Loan, to lend to the Borrower and the Borrower agrees to borrow from the Bank, the Personal Power Loan on the terms and conditions as fully contained in this Agreement and the Schedule 'B'."
          },
          is_compliant: true,
          matched_rules: [],
          final_reason: "The clause describes a standard agreement for a personal loan, outlining the parties' commitments and the basis for the loan with terms defined in the agreement and Schedule 'B'. It appears to be a standard contractual provision for a lending agreement.",
          Section: "Banking"
        }
      ],
      risk_explanations: [
        {
          severity: "Medium",
          category: "General",
          risk_score: 5,
          impact: "Unclassified risk detected.",
          mitigation: "Manual review recommended."
        },
        {
          severity: "Medium", 
          category: "General",
          risk_score: 5,
          impact: "Unclassified risk detected.",
          mitigation: "Manual review recommended."
        },
        {
          severity: "None",
          category: "None", 
          risk_score: 0,
          impact: "No regulatory exposure.",
          mitigation: "No action required."
        }
      ]
    },
    metadata: {
      exportDate: new Date().toISOString(),
      exportedBy: "SEBI Compliance Dashboard",
      documentName: "Personal Power Loan Agreement - POYYAR DASS S"
    }
  }

  const handleTestExport = async (format: 'json' | 'csv' | 'pdf') => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, this would come from your API
      console.log(`Testing ${format.toUpperCase()} export...`)
    } catch (error) {
      console.error('Export test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Export Functionality Test</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the export functionality with sample data
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sample Data Preview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Clauses</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sampleExportData.clauses.length}</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Compliance Results</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sampleExportData.compliance_results.verification_results.length}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Risk Explanations</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {sampleExportData.compliance_results.risk_explanations.length}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Document Summary</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {sampleExportData.summary.substring(0, 200)}...
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => handleTestExport('json')} 
              disabled={isLoading}
              variant="outline"
            >
              Test JSON Export
            </Button>
            
            <Button 
              onClick={() => handleTestExport('csv')} 
              disabled={isLoading}
              variant="outline"
            >
              Test CSV Export
            </Button>
            
            <Button 
              onClick={() => handleTestExport('pdf')} 
              disabled={isLoading}
              variant="outline"
            >
              Test PDF Export
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Export Button Component</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Below is the ExportButton component with the sample data. Click the export button to test the functionality.
          </p>
          
          <div className="flex justify-center">
            <ExportButton 
              data={sampleExportData}
              fileName="test_compliance_export"
              variant="default"
              size="default"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
