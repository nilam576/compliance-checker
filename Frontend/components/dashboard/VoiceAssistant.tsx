'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Play, Square, Loader2, Volume2, MessageSquare, ShieldCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VoiceAssistantProps {
    documentId?: string
}

export function VoiceAssistant({ documentId }: VoiceAssistantProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [aiResponse, setAiResponse] = useState('')
    const { toast } = useToast()

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                handleVoiceInteraction(audioBlob)
            }

            mediaRecorder.start()
            setIsRecording(true)
            setTranscript('')
            setAiResponse('')
        } catch (err) {
            console.error('Failed to start recording', err)
            toast({
                title: 'Microphone Error',
                description: 'Please ensure you have granted microphone permissions.',
                variant: 'destructive',
            })
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
    }

    const handleVoiceInteraction = async (audioBlob: Blob) => {
        setIsProcessing(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
            const formData = new FormData()
            formData.append('file', audioBlob, 'recording.webm')
            if (documentId) {
                formData.append('document_id', documentId)
            }

            const response = await fetch(`${apiUrl}/api/voice/interact`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error('Interaction failed')

            const data = await response.json()
            setTranscript(data.user_text)
            setAiResponse(data.ai_text)

            if (data.audio_hex) {
                playAudioFromHex(data.audio_hex)
            }
        } catch (err) {
            console.error('Voice interaction error', err)
            toast({
                title: 'Processing Error',
                description: 'Failed to process your voice request.',
                variant: 'destructive',
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const playAudioFromHex = (hex: string) => {
        try {
            const match = hex.match(/.{1,2}/g)
            if (!match) return

            const u8 = new Uint8Array(match.map((byte) => parseInt(byte, 16)))
            const blob = new Blob([u8], { type: 'audio/mpeg' })
            const url = URL.createObjectURL(blob)

            if (audioRef.current) {
                audioRef.current.pause()
            }

            const audio = new Audio(url)
            audioRef.current = audio

            audio.onplay = () => setIsPlaying(true)
            audio.onended = () => {
                setIsPlaying(false)
                URL.revokeObjectURL(url)
            }

            audio.play()
        } catch (err) {
            console.error('Playback error', err)
        }
    }

    return (
        <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500 h-6 w-6" />
                        RegLex Voice Assistant
                        {isPlaying && <Volume2 className="h-5 w-5 text-emerald-500 animate-pulse ml-2" />}
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-slate-400 border-slate-700">
                        Gemini 3 Pro
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center space-y-6">
                    {/* Recording Visualization */}
                    <div className="relative h-32 w-32 flex items-center justify-center">
                        <AnimatePresence>
                            {isRecording && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 2, opacity: 0 }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute inset-0 bg-red-500/30 rounded-full"
                                    />
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                                        className="absolute inset-0 bg-red-500/20 rounded-full"
                                    />
                                </>
                            )}
                        </AnimatePresence>

                        <Button
                            size="lg"
                            variant={isRecording ? 'destructive' : 'default'}
                            className={`h-24 w-24 rounded-full shadow-2xl transition-all duration-300 ${isRecording ? 'scale-110' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="h-10 w-10 animate-spin" />
                            ) : isRecording ? (
                                <MicOff className="h-10 w-10" />
                            ) : (
                                <Mic className="h-10 w-10" />
                            )}
                        </Button>
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="font-semibold text-lg">
                            {isRecording ? 'Listening...' : isProcessing ? 'Thinking...' : 'Tap to Speak'}
                        </h3>
                        <p className="text-slate-400 text-sm max-w-sm">
                            Ask about compliance rules, document results, or general SEBI regulations.
                        </p>
                    </div>

                    {/* Transcript & AI Response */}
                    <div className="w-full space-y-4 pt-4">
                        <AnimatePresence>
                            {transcript && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-800/50 p-4 rounded-lg border border-slate-700"
                                >
                                    <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                                        <MessageSquare className="h-3 w-3" /> You Said
                                    </p>
                                    <p className="text-sm italic text-slate-200">"{transcript}"</p>
                                </motion.div>
                            )}

                            {aiResponse && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-900/50"
                                >
                                    <p className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1 mb-1">
                                        <ShieldCheck className="h-3 w-3" /> RegLex Response
                                    </p>
                                    <p className="text-sm text-emerald-50">{aiResponse}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
