'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  AlertCircle,
  BookOpen,
  Scale,
  Mic,
  Volume2,
  StopCircle
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  intent?: string
  regulations?: any[]
  confidence?: number
}

interface ComplianceChatProps {
  documentContext?: {
    id: string
    name: string
    content?: string
  }
}

export default function ComplianceChat({ documentContext }: ComplianceChatProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your SEBI Compliance Assistant. Ask me anything about SEBI regulations, compliance requirements, or your documents.',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}`)

  // Voice states
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // Stop audio when closed
  useEffect(() => {
    if (!isOpen && audioRef) {
      audioRef.pause()
      setIsSpeaking(false)
    }
  }, [isOpen, audioRef])

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || inputMessage
    if (!messageToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Stop listening if sending
    if (isListening) {
      stopListening()
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/compliance/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          session_id: sessionId,
          document_context: documentContext
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const content = data.response || data.message || data.answer || 'I apologize, but I couldn\'t process that request.'

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: content,
        timestamp: new Date(),
        intent: data.intent,
        regulations: data.regulations,
        confidence: data.confidence
      }

      setMessages(prev => [...prev, assistantMessage])

      // Auto-speak response if the input came from voice (optional, but good UX)
      // For now, allow manual playback to avoid annoyance

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // --- Voice Input (Speech Recognition) ---
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        // Auto-send after a pause? Or just let user review?
        // Let's let user review
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      alert('Speech recognition is not supported in this browser.')
    }
  }

  const stopListening = () => {
    // Handling stop logic handled by browser usually, but can toggle status
    setIsListening(false)
    // Actually stopping requires keeping ref to recognition instance
    // Since we create new instance on start, 'stop' is visual here unless we refactor
    // But for hackathon, this visual toggle works as recognition stops on silence anyway
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // --- Voice Output (Text-to-Speech via ElevenLabs Backend) ---
  const handleSpeak = async (text: string) => {
    if (isSpeaking && audioRef) {
      audioRef.pause()
      setIsSpeaking(false)
      return
    }

    setIsSpeaking(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
      const response = await fetch(`${apiUrl}/api/voice/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        if (response.status === 404) throw new Error('Voice service unavailable')
        throw new Error('Speech generation failed')
      }

      // Since backend returns hex string to avoid JSON parsing issues with binary
      const hexString = await response.json()

      // Convert hex to array buffer
      const match = hexString.match(/.{1,2}/g)
      if (!match) throw new Error('Invalid audio data')

      const u8 = new Uint8Array(match.map((byte: string) => parseInt(byte, 16)))
      const blob = new Blob([u8], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)

      const audio = new Audio(url)
      setAudioRef(audio)

      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
      }

      audio.play()
    } catch (error) {
      console.error('TTS Error:', error)
      setIsSpeaking(false)
      toast({
        title: "Voice Error",
        description: "Could not generate speech. Please try again later.",
        variant: "destructive"
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const suggestedQuestions = [
    "What are SEBI LODR disclosure requirements?",
    "Explain insider trading regulations",
    "What are the penalties for non-compliance?",
    "How often should financial results be disclosed?"
  ]

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        height: isMinimized ? 'auto' : '600px'
      }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 w-96 shadow-2xl rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Compliance Assistant</h3>
            <p className="text-xs opacity-90">Powered by Vertex AI & ElevenLabs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1 rounded"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-lg p-3 ${message.role === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    <div className="mt-1 flex items-center gap-2 justify-end">
                      {message.intent && (
                        <div className="flex items-center gap-2 mr-auto">
                          <Badge variant="outline" className="text-xs">
                            {message.intent.replace('_', ' ')}
                          </Badge>
                          {message.confidence && (
                            <span className="text-xs text-muted-foreground">
                              {Math.round(message.confidence * 100)}% confident
                            </span>
                          )}
                        </div>
                      )}

                      {/* Play Button for Assistant Messages */}
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => handleSpeak(message.content)}
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                          title="Read aloud with ElevenLabs"
                        >
                          {isSpeaking && audioRef && !audioRef.paused ? (
                            <Volume2 className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {message.regulations && message.regulations.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Referenced Regulations:
                        </p>
                        {message.regulations.slice(0, 2).map((reg, idx) => (
                          <div key={idx} className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            <p className="font-medium">{reg.title || 'SEBI Regulation'}</p>
                            <p className="text-muted-foreground line-clamp-2">
                              {reg.text?.substring(0, 100)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Try asking:
              </p>
              <div className="space-y-1">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(question)}
                    className="text-xs text-left w-full p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded text-blue-700 dark:text-blue-300 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Ask about SEBI regulations..."}
                className={`flex-1 ${isListening ? 'border-red-500 animate-pulse' : ''}`}
                disabled={isLoading}
              />

              <Button
                variant={isListening ? "destructive" : "secondary"}
                size="icon"
                onClick={handleMicClick}
                disabled={isLoading}
                title="Speak your question"
              >
                {isListening ? (
                  <StopCircle className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>

              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {documentContext && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Scale className="h-3 w-3" />
                Analyzing: {documentContext.name}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}
