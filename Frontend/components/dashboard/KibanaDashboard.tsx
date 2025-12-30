"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react'

// Mock data that would come from Kibana/BigQuery
const riskDistributionData = [
  { name: 'Low', value: 45, percentage: 60 },
  { name: 'Medium', value: 23, percentage: 30 },
  { name: 'High', value: 7, percentage: 10 },
]

const complianceTrendsData = [
  { date: 'Oct 01', score: 92, documents: 15 },
  { date: 'Oct 08', score: 94, documents: 22 },
  { date: 'Oct 15', score: 91, documents: 18 },
  { date: 'Oct 22', score: 96, documents: 25 },
]

const violationPatternsData = [
  { regulation: 'Record Retention', count: 12 },
  { regulation: 'Data Privacy', count: 8 },
  { regulation: 'Financial Disclosure', count: 5 },
  { regulation: 'Risk Management', count: 3 },
]

const COLORS = {
  Low: '#10b981',    // green
  Medium: '#f59e0b', // amber
  High: '#ef4444',   // red
}

export function KibanaDashboard() {
  const [metrics, setMetrics] = useState({
    totalDocuments: 125,
    avgCompliance: 94.2,
    highRiskDocs: 12,
    totalClauses: 542,
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // In production, fetch from your backend's Kibana API endpoint
    // fetch('/api/kibana/dashboard')
    //   .then(res => res.json())
    //   .then(data => setMetrics(data))
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kibana Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time compliance analytics powered by Elasticsearch + Kibana
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 animate-pulse text-green-500" />
          <span>Live from Elastic Cloud</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">Analyzed via Elastic</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgCompliance}%</div>
            <p className="text-xs text-muted-foreground">+2.4% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Docs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.highRiskDocs}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clauses</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClauses}</div>
            <p className="text-xs text-muted-foreground">Indexed in Elastic</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Risk Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>
              Distribution of compliance risk levels across all documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-green-500">60%</div>
                <div className="text-muted-foreground">Low Risk</div>
              </div>
              <div>
                <div className="font-bold text-amber-500">30%</div>
                <div className="text-muted-foreground">Medium Risk</div>
              </div>
              <div>
                <div className="font-bold text-red-500">10%</div>
                <div className="text-muted-foreground">High Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Trends Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Trends</CardTitle>
            <CardDescription>
              Average compliance score over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={complianceTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[85, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Compliance Score (%)"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <TrendingUp className="inline h-4 w-4 text-green-500" />
              <span className="ml-2">Improving trend: +4.3% this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card>
        <CardHeader>
          <CardTitle>Common Violations</CardTitle>
          <CardDescription>
            Most frequently violated SEBI regulations (from Elastic aggregations)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={violationPatternsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="regulation" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ef4444" name="Violation Count" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Data Source:</span>
              <span className="font-mono text-xs">Elasticsearch aggregations</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Kibana Dashboard:</span>
              <span className="font-mono text-xs">RegLex-Compliance-Overview</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Elastic Integration Info */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Elastic Stack Integration
          </CardTitle>
          <CardDescription>
            Real-time analytics powered by Elasticsearch + Kibana
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Elasticsearch Cluster:</span>
            <code className="rounded bg-white px-2 py-1 dark:bg-gray-900">
              sebi-compliance-agent-d15205
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span>Index:</span>
            <code className="rounded bg-white px-2 py-1 dark:bg-gray-900">
              sebi_compliance_index
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span>Search Type:</span>
            <code className="rounded bg-white px-2 py-1 dark:bg-gray-900">
              Hybrid (BM25 + Vector)
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span>Kibana URL:</span>
            <code className="rounded bg-white px-2 py-1 text-xs dark:bg-gray-900">
              sebi-compliance-agent-d15205.kb.asia-south1.gcp.elastic.cloud
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

