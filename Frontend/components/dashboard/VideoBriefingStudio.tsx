'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, Play, Loader2, Sparkles, Download, Share2, FileVideo } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VideoBriefingStudioProps {
    documents: any[]
}

export function VideoBriefingStudio({ documents }: VideoBriefingStudioProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
    const { toast } = useToast()

    const handleGenerateVideo = async () => {
        if (!selectedDocId) {
            toast({
                title: 'Select a document',
                description: 'Please select a document to generate a video briefing for.',
                variant: 'destructive',
            })
            return
        }

        setIsGenerating(true)
        setVideoUrl(null)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app'
            const response = await fetch(`${apiUrl}/api/video/briefing/${selectedDocId}`)

            if (!response.ok) throw new Error('Video generation failed')

            const data = await response.json()
            setVideoUrl(data.video_url)

            toast({
                title: 'Video generated!',
                description: 'Your AI compliance briefing is ready to watch.',
            })
        } catch (err) {
            console.error('Video generation error', err)
            toast({
                title: 'Generation Failed',
                description: 'Could not create the video briefing. Try again later.',
                variant: 'destructive',
            })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Card className="h-full bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI Video Briefing Studio
                    <Badge variant="outline" className="ml-2 text-[10px] uppercase tracking-wider text-purple-400 border-purple-800">Gemini 3 Pro</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Choose Document Analysis</label>
                            <select
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={selectedDocId || ''}
                                onChange={(e) => setSelectedDocId(e.target.value)}
                            >
                                <option value="" disabled>Select a document...</option>
                                {documents?.filter(d => d.status === 'completed').map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.fileName} ({doc.overallScore?.toFixed(0)}%)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium mb-2 flex items-center gap-1">
                                <Video className="h-3 w-3" /> How it works:
                            </p>
                            <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1.5 list-disc pl-4">
                                <li>Gemini writes an executive news script from your PDF data.</li>
                                <li>ElevenLabs generates a professional audio narrative.</li>
                                <li>FFmpeg renders a 720p HD video briefing automatically.</li>
                            </ul>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 shadow-lg"
                            onClick={handleGenerateVideo}
                            disabled={isGenerating || !selectedDocId}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Synthesizing Briefing...
                                </>
                            ) : (
                                <>
                                    <FileVideo className="h-4 w-4 mr-2" />
                                    Generate AI Video Report
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Player / Placeholder */}
                    <div className="relative aspect-video bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center group">
                        <AnimatePresence mode="wait">
                            {videoUrl ? (
                                <motion.video
                                    key="player"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    src={videoUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                    autoPlay
                                />
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center p-8"
                                >
                                    <div className={`w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 ${isGenerating ? 'animate-pulse' : ''}`}>
                                        <Video className="h-8 w-8 text-slate-600" />
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {isGenerating ? 'Rending HD video frames...' : 'Generate a report to see it here'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {videoUrl && (
                            <div className="absolute top-4 right-4 flex gap-2">
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white border-0" asChild>
                                    <a href={videoUrl} download target="_blank">
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
