"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, Brain, Sparkles, Target } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface AnalyticsOverview {
  overview: {
    total_documents: number;
    total_clauses_analyzed: number;
    average_compliance_score: number;
    high_risk_documents: number;
    medium_risk_documents: number;
    low_risk_documents: number;
    total_violations: number;
    compliance_trend: string;
  };
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  top_violations: Array<{
    regulation: string;
    count: number;
    severity: string;
    description: string;
  }>;
  ai_insights: {
    executive_summary: string;
    key_patterns: string[];
  };
}

interface TrendData {
  trends: Array<{
    date: string;
    compliance_score: number;
    documents_analyzed: number;
    violations_found: number;
  }>;
  analysis: {
    direction: string;
    observation: string;
    prediction: string;
    recommendation: string;
    confidence: number;
  };
  prediction: {
    predicted_score: number;
    confidence: number;
    trend: string;
    rationale: string;
  };
}

interface Recommendation {
  title: string;
  description: string;
  priority: string;
  impact: string;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading analytics data...');

      // Load live analytics data from /api/dashboard/analytics (real GCS data)
      const liveAnalyticsRes = await fetch(`${API_URL}/api/dashboard/analytics`);
      if (!liveAnalyticsRes.ok) {
        throw new Error(`Analytics API returned ${liveAnalyticsRes.status}`);
      }
      const liveAnalyticsData = await liveAnalyticsRes.json();
      console.log('✅ Live analytics data loaded:', liveAnalyticsData);

      // Load overview for other metrics
      let overviewData = null;
      try {
        const overviewRes = await fetch(`${API_URL}/api/analytics/overview`);
        if (overviewRes.ok) {
          overviewData = await overviewRes.json();
          console.log('✅ Analytics overview data loaded:', overviewData);
        } else {
          console.warn('⚠️ Analytics overview endpoint returned:', overviewRes.status);
        }
      } catch (overviewError) {
        console.warn('⚠️ Failed to load analytics overview:', overviewError);
      }

      // Merge live risk distribution data with overview
      if (liveAnalyticsData.data?.riskDistribution && overviewData) {
        overviewData.risk_distribution = liveAnalyticsData.data.riskDistribution;
        console.log('✅ Using live risk distribution:', overviewData.risk_distribution);
      }

      // If overview not available, create from live analytics data
      if (!overviewData && liveAnalyticsData.data) {
        overviewData = {
          overview: {
            total_documents: liveAnalyticsData.data.processingStats?.totalProcessed || 0,
            total_clauses_analyzed: 0,
            average_compliance_score: 0,
            high_risk_documents: liveAnalyticsData.data.riskDistribution?.high || 0,
            medium_risk_documents: liveAnalyticsData.data.riskDistribution?.medium || 0,
            low_risk_documents: liveAnalyticsData.data.riskDistribution?.low || 0,
            total_violations: (liveAnalyticsData.data.riskDistribution?.high || 0) +
              (liveAnalyticsData.data.riskDistribution?.medium || 0),
            compliance_trend: 'stable'
          },
          risk_distribution: liveAnalyticsData.data.riskDistribution || { low: 0, medium: 0, high: 0, critical: 0 },
          top_violations: [],
          ai_insights: {
            executive_summary: 'Analytics data loaded from live GCS storage.',
            key_patterns: []
          }
        };
        console.log('✅ Created overview from live analytics data');
      }
      setOverview(overviewData);

      // Load trends
      try {
        const trendsRes = await fetch(`${API_URL}/api/analytics/trends?days=30`);
        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          setTrends(trendsData);
          console.log('✅ Trends data loaded');
        } else {
          // Use compliance trend from live analytics if available
          if (liveAnalyticsData.data?.complianceTrend) {
            setTrends({
              trends: liveAnalyticsData.data.complianceTrend.map((point: any) => ({
                date: point.date,
                compliance_score: point.score,
                documents_analyzed: 1,
                violations_found: 0
              })),
              analysis: {
                direction: 'stable',
                observation: 'Data from live analytics',
                prediction: 'Continuing current trend',
                recommendation: 'Monitor compliance scores',
                confidence: 0.8
              },
              prediction: {
                predicted_score: liveAnalyticsData.data.complianceTrend[liveAnalyticsData.data.complianceTrend.length - 1]?.score || 0,
                confidence: 0.7,
                trend: 'stable',
                rationale: 'Based on historical data from GCS'
              }
            });
            console.log('✅ Using compliance trend from live analytics');
          }
        }
      } catch (trendsError) {
        console.warn('⚠️ Failed to load trends:', trendsError);
      }

      // Load recommendations
      try {
        const recsRes = await fetch(`${API_URL}/api/analytics/recommendations`);
        if (recsRes.ok) {
          const recsData = await recsRes.json();
          setRecommendations(recsData.recommendations || []);
          console.log('✅ Recommendations loaded');
        }
      } catch (recsError) {
        console.warn('⚠️ Failed to load recommendations:', recsError);
      }

    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      // Set empty state but don't fail completely
      setOverview({
        overview: {
          total_documents: 0,
          total_clauses_analyzed: 0,
          average_compliance_score: 0,
          high_risk_documents: 0,
          medium_risk_documents: 0,
          low_risk_documents: 0,
          total_violations: 0,
          compliance_trend: 'unknown'
        },
        risk_distribution: { low: 0, medium: 0, high: 0, critical: 0 },
        top_violations: [],
        ai_insights: {
          executive_summary: 'Unable to load analytics data. Please try refreshing.',
          key_patterns: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading AI-Powered Analytics...</p>
        </div>
      </div>
    );
  }

  const riskData = overview ? [
    { name: 'Low Risk', value: overview.risk_distribution.low, color: '#10b981' },
    { name: 'Medium Risk', value: overview.risk_distribution.medium, color: '#f59e0b' },
    { name: 'High Risk', value: overview.risk_distribution.high, color: '#ef4444' },
    { name: 'Critical', value: overview.risk_distribution.critical, color: '#8b5cf6' },
  ] : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">AI-Powered Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Real-time compliance insights powered by Gemini AI & Google Cloud
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* AI Executive Summary */}
      {overview?.ai_insights && (
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Gemini AI Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{overview.ai_insights.executive_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview?.overview.total_documents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.overview.total_clauses_analyzed || 0} clauses analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {overview?.overview.average_compliance_score.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {overview?.overview.compliance_trend || 'stable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Docs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {overview?.overview.high_risk_documents || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {overview?.overview.total_violations || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all documents
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends & Prediction</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Document risk levels breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Key Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  AI-Detected Patterns
                </CardTitle>
                <CardDescription>Insights from Gemini AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {overview?.ai_insights.key_patterns.map((pattern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-purple-500 flex-shrink-0" />
                      <span className="text-sm">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {/* Compliance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Score Trend (30 Days)</CardTitle>
              <CardDescription>Historical compliance performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="compliance_score"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Compliance Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI Trend Analysis */}
          {trends?.analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    AI Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Direction</p>
                    <p className="text-lg font-semibold capitalize flex items-center gap-2">
                      {trends.analysis.direction}
                      {trends.analysis.direction === 'improving' && <TrendingUp className="h-5 w-5 text-green-500" />}
                      {trends.analysis.direction === 'declining' && <TrendingDown className="h-5 w-5 text-red-500" />}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observation</p>
                    <p className="text-sm">{trends.analysis.observation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
                    <p className="text-sm">{trends.analysis.recommendation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${trends.analysis.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{(trends.analysis.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    AI Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Next 7 Days Prediction</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {trends.prediction?.predicted_score.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trend</p>
                    <p className="text-lg font-semibold capitalize">{trends.prediction?.trend}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rationale</p>
                    <p className="text-sm">{trends.prediction?.rationale}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(trends.prediction?.confidence || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{((trends.prediction?.confidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Compliance Violations</CardTitle>
              <CardDescription>Most common regulation violations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overview?.top_violations || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="regulation" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" name="Violation Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {overview?.top_violations.map((violation, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{violation.regulation}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{violation.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">{violation.count}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${violation.severity === 'high' ? 'bg-red-100 text-red-700' :
                          violation.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                        {violation.severity}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                AI-Generated Recommendations
              </CardTitle>
              <CardDescription>Powered by Gemini AI analysis</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className={`border-l-4 ${rec.priority === 'high' ? 'border-l-red-500' :
                  rec.priority === 'medium' ? 'border-l-orange-500' :
                    'border-l-yellow-500'
                }`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-lg">{rec.title}</h4>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Expected Impact:</span>
                    <span>{rec.impact}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
