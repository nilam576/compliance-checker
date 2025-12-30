import { generateStructuredData } from '@/lib/seo'

interface StructuredDataProps {
  type: 'WebSite' | 'Organization' | 'WebApplication' | 'Article'
  name: string
  description: string
  url: string
  image?: string
  author?: string
  datePublished?: string
  dateModified?: string
}

export function StructuredData(props: StructuredDataProps) {
  const structuredData = generateStructuredData(props)
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

interface BreadcrumbProps {
  items: Array<{ name: string; url: string }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') 
        ? item.url 
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${item.url}`
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

// Common structured data components
export function WebSiteStructuredData() {
  return (
    <StructuredData
      type="WebSite"
      name="SEBI Compliance Verification System"
      description="AI-powered legal document compliance verification against SEBI regulations using multiple LLM providers and advanced vector search."
      url="/"
    />
  )
}

export function OrganizationStructuredData() {
  return (
    <StructuredData
      type="Organization"
      name="SEBI Compliance Team"
      description="Leading provider of AI-powered compliance verification solutions for SEBI regulations."
      url="/"
      image="/logo.png"
    />
  )
}

export function WebApplicationStructuredData() {
  return (
    <StructuredData
      type="WebApplication"
      name="SEBI Compliance Verification System"
      description="Professional-grade web application for automated SEBI compliance verification of legal documents."
      url="/"
      image="/og-image.jpg"
    />
  )
}
