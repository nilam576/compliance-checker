'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Table, FileImage, ChevronDown, Loader2 } from 'lucide-react'
import { ExportService, ExportData } from '@/lib/export-utils'

export interface ExportButtonProps {
  data: ExportData
  fileName?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  disabled?: boolean
  className?: string
}

export function ExportButton({
  data,
  fileName = 'compliance_export',
  variant = 'outline',
  size = 'sm',
  disabled = false,
  className = ''
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    if (!ExportService.validateExportData(data)) {
      alert('Invalid data format for export')
      return
    }

    setIsExporting(true)
    setExportFormat(format)

    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))

      const timestamp = new Date().toISOString().split('T')[0]
      const exportFileName = `${fileName}_${timestamp}`

      switch (format) {
        case 'json':
          ExportService.exportAsJSON(data, exportFileName)
          break
        case 'csv':
          ExportService.exportAsCSV(data, exportFileName)
          break
        case 'pdf':
          ExportService.exportAsPDF(data, exportFileName)
          break
        default:
          throw new Error(`Unsupported format: ${format}`)
      }

      console.log(`✅ Successfully exported data as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  const exportOptions = [
    {
      format: 'json' as const,
      label: 'JSON Format',
      description: 'Complete data with metadata',
      icon: FileText,
      recommended: true
    },
    {
      format: 'csv' as const,
      label: 'CSV Format',
      description: 'Spreadsheet compatible',
      icon: Table,
      recommended: false
    },
    {
      format: 'pdf' as const,
      label: 'PDF Report',
      description: 'Professional formatted report',
      icon: FileImage,
      recommended: true
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          disabled={disabled || isExporting}
          className={className}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting {exportFormat?.toUpperCase()}...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
              <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5">
          <p className="text-sm font-semibold">Export Formats</p>
          <p className="text-xs text-muted-foreground">
            Choose format for compliance data export
          </p>
        </div>
        
        <DropdownMenuSeparator />
        
        {exportOptions.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={isExporting}
              className="flex items-start gap-3 p-3 cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">
                    {option.label}
                  </p>
                  {option.recommended && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </DropdownMenuItem>
          )
        })}
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Data includes:
            </p>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">
                {data.clauses?.length || 0} clauses
              </Badge>
              <Badge variant="outline" className="text-xs">
                {data.compliance_results?.verification_results?.length || 0} results
              </Badge>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExportButton
