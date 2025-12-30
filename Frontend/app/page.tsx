'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import {
  ShieldCheck,
  Brain,
  Search,
  BarChart3,
  Upload,
  Zap,
  ArrowRight,
  FileText,
  CheckCircle,
  Users,
  Globe,
  Lock,
  Cpu,
  Database,
  Layers,
  TrendingUp,
  Sparkles,
  Shield,
  Video,
  Mic
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <PageLoader message="Loading SEBI Compliance System..." />
  }

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "Multi-LLM Support",
      description: "Choose from Claude, Gemini, OpenAI, and Mistral for robust compliance verification with fallback capabilities. Our ensemble approach ensures comprehensive analysis even when individual models have limitations.",
      badge: "AI-Powered",
      details: [
        "Claude 3.5 Sonnet for nuanced legal interpretation",
        "Gemini Pro for contextual understanding",
        "GPT-4 for broad knowledge base",
        "Mistral Large for cost-effective processing"
      ]
    },
    {
      icon: <Video className="h-8 w-8 text-purple-600" />,
      title: "AI Video Intelligence",
      description: "Automatically transform dry compliance documents into engaging 'News Style' video briefings powered by Gemini and ElevenLabs Narrations.",
      badge: "Hackathon Win",
      details: [
        "Automated AI script writing by Gemini 1.5 Pro",
        "Professional voiceovers with ElevenLabs TTS",
        "Dynamic background generation with Pillow",
        "Automated MP4 synthesis using FFmpeg"
      ]
    },
    {
      icon: <Mic className="h-8 w-8 text-emerald-600" />,
      title: "Voice-First Interaction",
      description: "Talk to your compliance data. Our Interactive Voice Assistant uses ElevenLabs Scribe for ultra-low latency speech-to-compliance analysis.",
      badge: "Next-Gen",
      details: [
        "ElevenLabs Scribe for high-accuracy transcription",
        "Voice-to-Compliance conversational loop",
        "Interactive executive summary playback",
        "Hands-free regulatory consultation"
      ]
    },
    {
      icon: <Search className="h-8 w-8 text-green-600" />,
      title: "Legal-BERT Embeddings",
      description: "Specialized legal language model for accurate semantic understanding of complex regulatory language. Trained on extensive Indian legal corpus for superior domain-specific comprehension.",
      badge: "Advanced",
      details: [
        "Fine-tuned on SEBI regulations and case law",
        "Semantic similarity matching for clause identification",
        "Domain-specific terminology recognition",
        "Context-aware interpretation of legal jargon"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Risk Assessment",
      description: "Automated categorization and scoring of compliance risks with detailed mitigation strategies. Our system provides actionable insights ranked by severity and business impact.",
      badge: "Comprehensive",
      details: [
        "Three-tier risk classification (High/Medium/Low)",
        "Automated severity scoring algorithms",
        "Custom mitigation recommendations",
        "Business impact assessment"
      ]
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-orange-600" />,
      title: "SEBI Regulation Database",
      description: "Access to the most up-to-date SEBI regulations with vector similarity search for precise matching. Continuous updates ensure you're always working with current legal requirements.",
      badge: "Current",
      details: [
        "Real-time SEBI regulation updates",
        "Vector similarity search for precise matching",
        "Cross-reference with related regulations",
        "Historical change tracking"
      ]
    },
    {
      icon: <Database className="h-8 w-8 text-red-600" />,
      title: "BigQuery Integration",
      description: "Enterprise-grade data processing with Google BigQuery for scalable regulation retrieval. Leverages cosine similarity search for lightning-fast, accurate results.",
      badge: "Scalable",
      details: [
        "Petabyte-scale data processing",
        "Sub-second query response times",
        "Advanced vector similarity algorithms",
        "Secure cloud-native infrastructure"
      ]
    },
    {
      icon: <Lock className="h-8 w-8 text-indigo-600" />,
      title: "SEBI Compliant",
      description: "Built specifically for SEBI compliance with rigorous validation against regulatory requirements. Our system helps ensure your documents meet the highest standards of regulatory adherence.",
      badge: "Certified",
      details: [
        "SEBI regulation alignment verification",
        "Audit trail generation",
        "Compliance scoring methodology",
        "Regulatory change impact analysis"
      ]
    }
  ]

  const steps = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Upload Documents",
      description: "Drag and drop your legal documents for instant compliance analysis. Supports PDF, DOCX, and TXT formats with automatic clause extraction."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI Processing",
      description: "Advanced AI analyzes clauses against SEBI regulations using multi-LLM verification for comprehensive compliance checking."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Review Results",
      description: "Get detailed compliance reports with risk assessments, mitigation strategies, and regulatory references."
    }
  ]

  const benefits = [
    {
      icon: <TrendingUp className="h-10 w-10 text-blue-600" />,
      title: "Increase Efficiency",
      description: "Reduce compliance review time from hours to minutes with automated analysis.",
      statistic: "90% faster processing"
    },
    {
      icon: <Users className="h-10 w-10 text-green-600" />,
      title: "Enhance Accuracy",
      description: "Multi-LLM verification reduces human error and oversight in compliance checking.",
      statistic: "99.2% accuracy rate"
    },
    {
      icon: <Cpu className="h-10 w-10 text-purple-600" />,
      title: "Scalable Processing",
      description: "Handle large volumes of documents simultaneously with cloud-native infrastructure.",
      statistic: "1000+ docs/hour"
    },
    {
      icon: <Globe className="h-10 w-10 text-orange-600" />,
      title: "Stay Current",
      description: "Automatic updates ensure you're always working with the latest regulations.",
      statistic: "Real-time updates"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '-2s' }}></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '-4s' }}></div>
        </div>

        <motion.div
          className="max-w-6xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card inline-block p-3 mb-6"
          >
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SEBI Compliant • AI-Powered • Enterprise Ready
              </span>
              <Sparkles className="h-4 w-4 text-purple-500" />
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              AI-Powered Legal
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">
              Compliance Verification
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Transform your legal document verification process with our multi-LLM AI system.
            Get comprehensive SEBI compliance analysis in seconds, not hours.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/login">
              <Button size="lg" className="glass-button text-lg px-10 py-6 hover:shadow-2xl transition-all duration-300">
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="#features">
              <Button variant="outline" size="lg" className="glass-button text-lg px-10 py-6 hover:shadow-2xl transition-all duration-300">
                Explore Features
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="glass-card p-6 max-w-5xl mx-auto overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-4"></div>
              <div className="bg-gray-900 rounded-xl p-8 mt-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-gray-400 text-sm">SEBI Compliance Terminal</div>
                </div>
                <div className="text-left text-gray-300 font-mono text-sm space-y-2">
                  <div className="text-blue-400">$ sebi-verify --document contract.pdf --model multi-llm</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400">✓ Document processed: 1,247 clauses analyzed</span>
                  </div>
                  <div className="text-green-400 ml-4">✓ 1,089 fully compliant clauses</div>
                  <div className="text-yellow-400 ml-4">⚠ 142 medium-risk clauses identified</div>
                  <div className="text-red-400 ml-4">✗ 16 high-risk compliance issues detected</div>
                  <div className="text-purple-400 mt-4">📊 Compliance Score: 87.3% (Good)</div>
                  <div className="text-blue-400">⚡ Analysis completed in 3.2 seconds</div>
                  <div className="text-gray-400 mt-2"># Detailed report with mitigation strategies generated</div>
                  <div className="text-gray-400"># Cross-referenced with 2,847 SEBI regulations</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bento Grid Features Section */}
      <motion.div
        className="container mx-auto px-4 py-24 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Experience the future of legal compliance with our intelligent verification system
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20">
                  {benefit.icon}
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                  {benefit.statistic}
                </Badge>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {benefit.description}
                </p>
              </div>

              {index === 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Processing Speed</span>
                    <span className="font-semibold text-green-600">90% Faster</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-[90%] transition-all duration-1000"></div>
                  </div>
                </div>
              )}

              {index === 3 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="p-2 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">24/7</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Uptime</div>
                  </div>
                  <div className="p-2 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">99.9%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
                  </div>
                  <div className="p-2 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">1M+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Docs</div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Advanced Features Bento Grid */}
      <motion.div
        id="features"
        className="container mx-auto px-4 py-24 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
            Advanced AI Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Powered by cutting-edge AI models and legal expertise
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20">
                  {feature.icon}
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                  {feature.badge}
                </Badge>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {feature.description}
                </p>

                {index === 0 && (
                  <ul className="space-y-2 mt-4">
                    {feature.details.slice(0, 3).map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {index === 0 && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium dark:text-gray-300">AI Models Active</span>
                    <span className="text-sm text-green-600 font-semibold">4/4 Online</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="dark:text-gray-400">Claude</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="dark:text-gray-400">Gemini</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="dark:text-gray-400">GPT-4</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="dark:text-gray-400">Mistral</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Simple 3-step process to verify your documents
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white dark:bg-gray-700 p-3 rounded-full shadow">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Detailed Process Section */}
      <motion.div
        className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="max-w-6xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Comprehensive Analysis Process
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Our multi-stage verification ensures thorough compliance checking
          </p>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Document Ingestion</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Advanced OCR and NLP processing extracts clauses and identifies key legal terms. Smart segmentation separates relevant content from boilerplate text.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <Layers className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Multi-LLM Analysis</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Parallel processing across Claude, Gemini, OpenAI, and Mistral provides comprehensive verification with consensus-based confidence scoring.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                    <Database className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Regulation Matching</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Vector similarity search in our SEBI regulation database identifies relevant provisions with precise clause matching and cross-references.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Risk Assessment</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Automated categorization and scoring of compliance risks with detailed mitigation strategies tailored to your specific document context.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sample Risk Report</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Disclosure Requirement</span>
                    <Badge variant="destructive">High Risk</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Missing mandatory disclosure for material contracts under SEBI LODR Regulations, Chapter IV, Clause 4.2.1
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Compliance Timeline</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Submission deadline approaching for quarterly compliance certificate - 3 days remaining
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Governance Structure</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Low Risk</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Board composition meets minimum independence requirements with 3 independent directors out of 7 total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        id="team"
        className="container mx-auto px-4 py-24 bg-gray-50 dark:bg-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Legal experts and AI engineers working together to revolutionize compliance
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Aditya",
              role: "Frontend Developer & Team Leader",
              expertise: "Frontend Development",
              description: "Leading the frontend development and project management for RegLex AI",
              image: "👨‍💻"
            },
            {
              name: "Nilam",
              role: "Lead AI Engineer & Backend Dev",
              expertise: "Machine Learning & NLP",
              description: "Expert in legal-domain AI systems and language model fine-tuning",
              image: "👩‍⚖️"
            },
            {
              name: "Suriya",
              role: "AI/ML Developer",
              expertise: "Risk Assessment & Analysis",
              description: "Former SEBI officer with deep regulatory knowledge",
              image: "👩‍💼"
            },
            {
              name: "Ivan Nilesh",
              role: "AI/ML Developer",
              expertise: "Machine Learning",
              description: "Specialized in AI/ML algorithms and model development",
              image: "👨‍💻"
            },
            {
              name: "Vrithika",
              role: "AI/ML Developer",
              expertise: "Data Science",
              description: "Focused on data analysis and AI model optimization",
              image: "👩‍💻"
            }
          ].map((member, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {member.expertise}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {member.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="container mx-auto px-4 py-24 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="glass-card relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="relative z-10 p-12 md:p-16 text-center">
            <motion.div
              className="inline-block p-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-8 w-8 text-blue-500" />
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Ready to Transform Your Legal Workflow?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of legal professionals who've revolutionized their compliance process with our AI-powered platform.
              Start analyzing documents in seconds, not hours.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Link href="/login">
                <Button size="lg" className="glass-button bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-10 py-6 text-lg hover:shadow-2xl transition-all duration-300">
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/contact">
                <Button size="lg" variant="outline" className="glass-button px-10 py-6 text-lg hover:shadow-2xl transition-all duration-300">
                  Schedule Demo
                </Button>
              </Link>
            </motion.div>

            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <ShieldCheck className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold">SEBI Compliance</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                AI-powered legal document compliance verification against SEBI regulations.
                Transform your legal workflow with cutting-edge technology and expert insights.
              </p>
              <div className="flex space-x-4">
                {/* Social Links */}
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">Li</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">Tw</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm">Gh</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#team" className="text-gray-300 hover:text-white transition-colors">Team</a></li>
                <li><a href="/login" className="text-gray-300 hover:text-white transition-colors">Get Started</a></li>
                <li><a href="/help" className="text-gray-300 hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-300">
                <li>adi1423tya@gmail.com</li>
                <li>+91-9695882854</li>
                <li>Jaipur, India</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 RegLex AI - SEBI Compliance System. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="/security" className="text-gray-400 hover:text-white text-sm transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
