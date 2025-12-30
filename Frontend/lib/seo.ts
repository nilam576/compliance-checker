import type { Metadata } from 'next'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

const defaultConfig = {
  siteName: 'SEBI Compliance Verification System',
  defaultTitle: 'SEBI Compliance Verification System',
  defaultDescription: 'AI-powered legal document compliance verification against SEBI regulations using multiple LLM providers and advanced vector search.',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://reglex-frontend-305534435339.us-central1.run.app',
  defaultImage: '/og-image.jpg', // We'll need to create this
  twitterHandle: '@sebi_compliance',
  locale: 'en_US',
  favicon: '/favicon.ico'
}

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title,
    description = defaultConfig.defaultDescription,
    keywords = [],
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = []
  } = config

  const fullTitle = title
    ? `${title} | ${defaultConfig.siteName}`
    : defaultConfig.defaultTitle

  const fullUrl = url
    ? `${defaultConfig.siteUrl}${url}`
    : defaultConfig.siteUrl

  const imageUrl = image
    ? `${defaultConfig.siteUrl}${image}`
    : `${defaultConfig.siteUrl}${defaultConfig.defaultImage}`

  const allKeywords = [
    'SEBI compliance',
    'legal document verification',
    'AI compliance',
    'regulatory compliance',
    'document analysis',
    'legal technology',
    ...keywords,
    ...tags
  ]

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: author ? [{ name: author }] : [{ name: 'SEBI Compliance Team' }],
    creator: 'SEBI Compliance Team',
    publisher: 'SEBI Compliance System',
    category: 'Legal Technology',

    metadataBase: new URL(defaultConfig.siteUrl),

    openGraph: {
      type: type as 'website' | 'article',
      locale: defaultConfig.locale,
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: defaultConfig.siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        }
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        section,
        authors: author ? [author] : undefined,
        tags: tags.length > 0 ? tags : undefined,
      })
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      site: defaultConfig.twitterHandle,
      creator: defaultConfig.twitterHandle,
      images: [imageUrl],
    },

    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: fullUrl,
    },

    other: {
      'msapplication-TileColor': '#ffffff',
      'theme-color': '#ffffff',
    }
  }
}

export function generateStructuredData(config: {
  type: 'WebSite' | 'Organization' | 'WebApplication' | 'Article'
  name: string
  description: string
  url: string
  image?: string
  author?: string
  datePublished?: string
  dateModified?: string
}) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': config.type,
    name: config.name,
    description: config.description,
    url: config.url,
    image: config.image ? `${defaultConfig.siteUrl}${config.image}` : undefined
  }

  switch (config.type) {
    case 'WebSite':
      return {
        ...baseData,
        publisher: {
          '@type': 'Organization',
          name: defaultConfig.siteName,
          url: defaultConfig.siteUrl
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${defaultConfig.siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }

    case 'Organization':
      return {
        ...baseData,
        logo: `${defaultConfig.siteUrl}/logo.png`,
        sameAs: [
          // Add social media URLs when available
        ]
      }

    case 'WebApplication':
      return {
        ...baseData,
        applicationCategory: 'Legal Technology',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      }

    case 'Article':
      return {
        ...baseData,
        author: {
          '@type': 'Person',
          name: config.author || 'SEBI Compliance Team'
        },
        datePublished: config.datePublished,
        dateModified: config.dateModified || config.datePublished,
        publisher: {
          '@type': 'Organization',
          name: defaultConfig.siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${defaultConfig.siteUrl}/logo.png`
          }
        }
      }

    default:
      return baseData
  }
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${defaultConfig.siteUrl}${item.url}`
    }))
  }
}

// Utility functions for SEO
export const seoUtils = {
  /**
   * Generate page title from segments
   */
  generateTitle: (segments: string[]): string => {
    return [...segments, defaultConfig.siteName].join(' | ')
  },

  /**
   * Truncate description to optimal length
   */
  truncateDescription: (text: string, maxLength = 160): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  },

  /**
   * Generate keywords from content
   */
  extractKeywords: (content: string, maxKeywords = 10): string[] => {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can'
    ])

    const wordCount = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .reduce((acc: { [key: string]: number }, word) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      }, {})

    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word)
  },

  /**
   * Validate meta description
   */
  validateDescription: (description: string): { valid: boolean; issues: string[] } => {
    const issues = []

    if (description.length < 120) {
      issues.push('Description is too short (recommended 120-160 characters)')
    }

    if (description.length > 160) {
      issues.push('Description is too long (recommended 120-160 characters)')
    }

    if (!description.includes('SEBI') && !description.includes('compliance')) {
      issues.push('Description should include key terms like "SEBI" or "compliance"')
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }
}
