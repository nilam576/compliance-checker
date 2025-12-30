'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Brain, Sparkles, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface LLMProvider {
  id: string
  name: string
  description: string
  status: 'available' | 'unavailable' | 'limited'
  icon: React.ReactNode
  features: string[]
  responseTime: string
  accuracy: string
}

const llmProviders: LLMProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini 3 Pro Preview',
    description: 'Next-generation reasoning and multimodal capabilities',
    status: 'available',
    icon: <Sparkles className="h-5 w-5" />,
    features: ['Fast Processing', 'High Accuracy', 'Cost Effective'],
    responseTime: '~2.1s',
    accuracy: '94%'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Constitutional AI with strong reasoning',
    status: 'available',
    icon: <Brain className="h-5 w-5" />,
    features: ['Best Reasoning', 'Long Context', 'Safe Outputs'],
    responseTime: '~2.8s',
    accuracy: '96%'
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    description: 'General-purpose AI with broad knowledge',
    status: 'available',
    icon: <Bot className="h-5 w-5" />,
    features: ['Versatile', 'Well Tested', 'Creative'],
    responseTime: '~3.2s',
    accuracy: '93%'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Open-source focused European AI',
    status: 'limited',
    icon: <Zap className="h-5 w-5" />,
    features: ['Privacy Focus', 'European', 'Open Source'],
    responseTime: '~2.5s',
    accuracy: '91%'
  }
]

interface LLMProviderSelectorProps {
  selectedProvider?: string
  onProviderChange?: (provider: string) => void
  className?: string
}

export function LLMProviderSelector({
  selectedProvider = 'gemini',
  onProviderChange,
  className
}: LLMProviderSelectorProps) {
  const [currentProvider, setCurrentProvider] = useState(selectedProvider)

  const handleProviderChange = (providerId: string) => {
    setCurrentProvider(providerId)
    onProviderChange?.(providerId)
  }

  const selectedProviderData = llmProviders.find(p => p.id === currentProvider)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            LLM Provider Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Choose AI Model
            </label>
            <Select value={currentProvider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an LLM provider" />
              </SelectTrigger>
              <SelectContent>
                {llmProviders.map((provider) => (
                  <SelectItem
                    key={provider.id}
                    value={provider.id}
                    disabled={provider.status === 'unavailable'}
                  >
                    <div className="flex items-center gap-2">
                      {provider.icon}
                      <span>{provider.name}</span>
                      {provider.status === 'limited' && (
                        <Badge variant="warning" className="text-xs">Limited</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProviderData && (
            <motion.div
              key={currentProvider}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 pt-2 border-t"
            >
              <div className="flex items-center gap-2">
                {selectedProviderData.icon}
                <h3 className="font-semibold">{selectedProviderData.name}</h3>
                <Badge
                  variant={selectedProviderData.status === 'available' ? 'success' : 'warning'}
                  className="text-xs"
                >
                  {selectedProviderData.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {selectedProviderData.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Avg. Response:</span>
                  <div className="font-medium">{selectedProviderData.responseTime}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Accuracy:</span>
                  <div className="font-medium">{selectedProviderData.accuracy}</div>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground mb-2 block">Key Features:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProviderData.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Badge variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
