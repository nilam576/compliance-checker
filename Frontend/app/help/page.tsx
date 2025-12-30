'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  HelpCircle,
  Search,
  BookOpen,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Info,
  Lightbulb,
  PlayCircle,
  Download
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

interface Guide {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  steps: string[]
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I upload a document for compliance verification?',
      answer: 'To upload a document: 1) Go to the Dashboard, 2) Click on the &quot;Upload Documents&quot; section, 3) Drag and drop your file or click to browse, 4) Select your preferred LLM provider, 5) Click &quot;Upload&quot; to start the analysis. Supported formats include PDF, DOCX, and TXT files up to 10MB.',
      category: 'Getting Started',
      tags: ['upload', 'document', 'verification']
    },
    {
      id: '2',
      question: 'Which LLM providers are supported and which should I choose?',
      answer: 'We support Claude 3.5 Sonnet (best for legal nuance), Gemini Pro (balanced performance), GPT-4 (broad knowledge), and Mistral Large (cost-effective). For SEBI compliance, we recommend Claude or Gemini Pro for the most accurate results.',
      category: 'LLM Providers',
      tags: ['llm', 'providers', 'claude', 'gemini', 'openai', 'mistral']
    },
    {
      id: '3',
      question: 'How long does document analysis take?',
      answer: 'Analysis time depends on document size and complexity. Typically: Small documents (1-5 pages): 30-60 seconds, Medium documents (6-20 pages): 1-3 minutes, Large documents (21+ pages): 3-10 minutes. You can track progress in real-time on the dashboard.',
      category: 'Processing',
      tags: ['time', 'analysis', 'processing', 'duration']
    },
    {
      id: '4',
      question: 'What do the risk levels mean?',
      answer: 'Risk levels indicate compliance status: HIGH RISK (red) - Immediate attention required, likely non-compliant; MEDIUM RISK (yellow) - Review recommended, minor issues; LOW RISK (blue) - Minor concerns, mostly compliant; COMPLIANT (green) - Meets SEBI requirements fully.',
      category: 'Risk Assessment',
      tags: ['risk', 'levels', 'compliance', 'scoring']
    },
    {
      id: '5',
      question: 'Can I export analysis results?',
      answer: 'Yes, you can export results in multiple formats: PDF reports for executive summaries, Excel spreadsheets for detailed clause analysis, JSON data for API integration. Go to any analysis result page and click the &quot;Export&quot; button to choose your format.',
      category: 'Export',
      tags: ['export', 'download', 'pdf', 'excel', 'json']
    },
    {
      id: '6',
      question: 'How accurate are the compliance assessments?',
      answer: 'Our multi-LLM approach achieves 99.2% accuracy in identifying compliance issues. The system uses Legal-BERT embeddings trained on SEBI regulations and cross-validates results across multiple AI models to ensure reliability.',
      category: 'Accuracy',
      tags: ['accuracy', 'reliability', 'bert', 'legal']
    },
    {
      id: '7',
      question: 'Is my data secure and confidential?',
      answer: 'Yes, we implement enterprise-grade security: End-to-end encryption for all documents, SOC 2 compliant infrastructure, No data retention beyond analysis period, Secure API endpoints with authentication, Regular security audits and penetration testing.',
      category: 'Security',
      tags: ['security', 'privacy', 'encryption', 'confidential']
    },
    {
      id: '8',
      question: 'What file formats are supported?',
      answer: 'Supported formats: PDF (including scanned documents with OCR), Microsoft Word (.docx), Plain text (.txt). Maximum file size is 10MB. For larger documents, consider splitting them into smaller sections for analysis.',
      category: 'File Formats',
      tags: ['formats', 'pdf', 'docx', 'txt', 'size']
    }
  ]

  const guides: Guide[] = [
    {
      id: '1',
      title: 'Getting Started with SEBI Compliance Verification',
      description: 'Learn the basics of uploading and analyzing your first document',
      duration: '5 minutes',
      difficulty: 'Beginner',
      steps: [
        'Create your account and log in',
        'Navigate to the Dashboard',
        'Upload your first document',
        'Select an LLM provider',
        'Review the analysis results',
        'Export your compliance report'
      ]
    },
    {
      id: '2',
      title: 'Understanding Risk Levels and Recommendations',
      description: 'Deep dive into how risk assessment works and how to interpret results',
      duration: '8 minutes',
      difficulty: 'Intermediate',
      steps: [
        'Understanding the risk scoring system',
        'Reading clause-by-clause analysis',
        'Interpreting regulatory references',
        'Implementing mitigation strategies',
        'Tracking compliance improvements over time'
      ]
    },
    {
      id: '3',
      title: 'Advanced Features and API Integration',
      description: 'Explore advanced features, bulk processing, and API usage',
      duration: '12 minutes',
      difficulty: 'Advanced',
      steps: [
        'Setting up API access',
        'Bulk document processing',
        'Custom compliance workflows',
        'Integrating with existing systems',
        'Automating compliance monitoring'
      ]
    }
  ]

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <HelpCircle className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold">Help Center</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get help with using the SEBI Compliance Verification System. Find answers, guides, and contact support.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <PlayCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Watch step-by-step video guides
              </p>
              <Button variant="outline" size="sm">
                Watch Now
              </Button>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Download className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">User Manual</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download comprehensive documentation
              </p>
              <Button variant="outline" size="sm">
                Download PDF
              </Button>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant help from our support team
              </p>
              <Button variant="outline" size="sm">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="api">API Docs</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            
            <TabsContent value="faq" className="space-y-6">
              {/* Search */}
              <Card>
                <CardContent className="p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search frequently asked questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-lg py-6"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Categories */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {['Getting Started', 'LLM Providers', 'Risk Assessment', 'Security'].map((category) => (
                  <Card key={category} className="text-center cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <p className="font-medium">{category}</p>
                      <p className="text-sm text-muted-foreground">
                        {faqs.filter(faq => faq.category === category).length} articles
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* FAQ List */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredFAQs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        className="p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <button
                          className="w-full text-left"
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">{faq.question}</h3>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{faq.category}</Badge>
                                {faq.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {expandedFAQ === faq.id ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                        </button>
                        {expandedFAQ === faq.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                          >
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="guides" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Step-by-Step Guides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {guides.map((guide, index) => (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold mb-2">{guide.title}</h3>
                                <p className="text-muted-foreground">{guide.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getDifficultyColor(guide.difficulty)}>
                                  {guide.difficulty}
                                </Badge>
                                <Badge variant="outline">{guide.duration}</Badge>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">What you&apos;ll learn:</h4>
                              <ul className="space-y-1">
                                {guide.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <Button>
                              Start Guide
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    API Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-400">API Access</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Get your API key from Profile Settings to integrate with our compliance verification endpoints.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Quick Start</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm">
                              curl -X POST https://api.sebi-compliance.com/v1/verify \<br/>
                              &nbsp;&nbsp;-H &quot;Authorization: Bearer YOUR_API_KEY&quot; \<br/>
                              &nbsp;&nbsp;-F &quot;document=@contract.pdf&quot;
                            </div>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Full Docs
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Endpoints</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <code className="text-sm">POST /v1/verify</code>
                              <Badge variant="outline">Upload & Analyze</Badge>
                            </div>
                            <div className="flex justify-between">
                              <code className="text-sm">GET /v1/results/:id</code>
                              <Badge variant="outline">Get Results</Badge>
                            </div>
                            <div className="flex justify-between">
                              <code className="text-sm">GET /v1/documents</code>
                              <Badge variant="outline">List Documents</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Get Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email Support</p>
                        <p className="text-sm text-muted-foreground">support@sebi-compliance.com</p>
                        <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Phone Support</p>
                        <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                        <p className="text-xs text-muted-foreground">Mon-Fri, 9 AM - 6 PM IST</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Live Chat</p>
                        <p className="text-sm text-muted-foreground">Available 24/7</p>
                        <Button size="sm" className="mt-2">Start Chat</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Feature Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Have an idea for improving our platform? We&apos;d love to hear from you!
                    </p>
                    <div className="space-y-3">
                      <Input placeholder="Your email" />
                      <Input placeholder="Feature title" />
                      <textarea 
                        className="w-full p-3 border rounded-lg resize-none" 
                        rows={4} 
                        placeholder="Describe your feature request..."
                      />
                      <Button className="w-full">Submit Request</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}
