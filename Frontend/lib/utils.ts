import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { tv, type VariantProps } from "tailwind-variants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export tailwind-variants for modern variant handling
export { tv, type VariantProps }

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

/**
 * Safe localStorage operations to prevent JSON parsing errors
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(key)
    } catch (error) {
      console.warn(`Failed to get localStorage item '${key}':`, error)
      return null
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`Failed to set localStorage item '${key}':`, error)
      return false
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Failed to remove localStorage item '${key}':`, error)
      return false
    }
  },

  getParsedItem: <T>(key: string, fallback: T): T => {
    try {
      const item = safeLocalStorage.getItem(key)
      if (!item) return fallback

      // Handle both string and object formats
      if (typeof item === 'string') {
        if (item.trim().startsWith('{') || item.trim().startsWith('[')) {
          return JSON.parse(item)
        } else {
          console.warn(`Invalid JSON format for key '${key}':`, item.substring(0, 100) + '...')
          return fallback
        }
      } else if (typeof item === 'object') {
        return item as T
      }

      return fallback
    } catch (error) {
      console.warn(`Failed to parse localStorage item '${key}':`, error)
      // Clean up corrupted data
      safeLocalStorage.removeItem(key)
      return fallback
    }
  },

  setParsedItem: <T>(key: string, value: T): boolean => {
    try {
      const jsonString = JSON.stringify(value)
      return safeLocalStorage.setItem(key, jsonString)
    } catch (error) {
      console.warn(`Failed to stringify and store item '${key}':`, error)
      return false
    }
  }
}
