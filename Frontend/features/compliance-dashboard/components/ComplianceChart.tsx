'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ComplianceData {
  category: string
  compliant: number
  nonCompliant: number
  total: number
}

interface RiskData {
  level: string
  count: number
  color: string
}

interface ComplianceChartProps {
  data: ComplianceData[]
  riskData: RiskData[]
  className?: string
}

const COLORS = {
  compliant: '#10b981', // green-500
  nonCompliant: '#ef4444', // red-500
  high: '#dc2626', // red-600
  medium: '#f59e0b', // amber-500
  low: '#10b981', // green-500
  none: '#6b7280', // gray-500
}

export function ComplianceChart({ data, riskData, className }: ComplianceChartProps) {
  const totalClauses = data.reduce((sum, item) => sum + item.total, 0)
  const totalCompliant = data.reduce((sum, item) => sum + item.compliant, 0)
  const complianceRate = totalClauses > 0 ? (totalCompliant / totalClauses) * 100 : 0

  return (
    <motion.div 
      className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Compliance Overview Bar Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Compliance Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Overall compliance rate: {complianceRate.toFixed(1)}%
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === 'compliant' ? 'Compliant' : 'Non-Compliant',
                  ]}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="compliant"
                  stackId="a"
                  fill={COLORS.compliant}
                  name="Compliant"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="nonCompliant"
                  stackId="a"
                  fill={COLORS.nonCompliant}
                  name="Non-Compliant"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Assessment Pie Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution of risk levels across all clauses
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ level, count, percent }) =>
                    `${level}: ${count} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, 'Count']}
                  labelFormatter={(label) => `Risk Level: ${label}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Mock data generator for development
export function generateMockData(): { complianceData: ComplianceData[], riskData: RiskData[] } {
  const complianceData: ComplianceData[] = [
    { category: 'Data Protection', compliant: 12, nonCompliant: 3, total: 15 },
    { category: 'Financial Terms', compliant: 8, nonCompliant: 7, total: 15 },
    { category: 'Liability', compliant: 10, nonCompliant: 2, total: 12 },
    { category: 'Termination', compliant: 5, nonCompliant: 8, total: 13 },
    { category: 'Intellectual Property', compliant: 9, nonCompliant: 1, total: 10 },
  ]

  const riskData: RiskData[] = [
    { level: 'High', count: 8, color: COLORS.high },
    { level: 'Medium', count: 15, color: COLORS.medium },
    { level: 'Low', count: 22, color: COLORS.low },
    { level: 'None', count: 20, color: COLORS.none },
  ]

  return { complianceData, riskData }
}
