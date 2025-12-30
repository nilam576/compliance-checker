import { Loader2, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export function ChartLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center h-[300px] bg-muted/20 rounded-lg", className)}>
      <div className="flex flex-col items-center gap-4">
        <Bot className="h-12 w-12 text-muted-foreground animate-pulse" />
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Analyzing compliance data...
          </p>
          <div className="flex space-x-1 justify-center">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
