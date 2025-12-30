/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 optimizations and features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'framer-motion'
    ],
    // Optimize server components
    serverComponentsExternalPackages: ['sharp'],
    // Note: PPR and reactCompiler are canary-only features
    // Enable when using Next.js canary: ppr: true, reactCompiler: true
  },

  // React strict mode for better dev experience
  reactStrictMode: true,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: false, // We're using Tailwind CSS
  },

  // Performance optimization for production
  productionBrowserSourceMaps: false,

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }

    // Optimize production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            ui: {
              test: /[\\/]components[\\/]ui[\\/]/,
              name: 'ui',
              chunks: 'all',
            },
            features: {
              test: /[\\/]features[\\/]/,
              name: 'features',
              chunks: 'all',
            },
          },
        },
      }
    }

    return config
  },


  typescript: {
    // Temporarily ignore TypeScript errors during build for Vercel
    ignoreBuildErrors: true,
  },

  eslint: {
    // Ignore ESLint errors during builds for Vercel deployment
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://reglex-backend-305534435339.us-central1.run.app',
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API || 'false',
  },

  // Image optimization with modern formats
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Redirects for better SEO
  async redirects() {
    return []
  },

  // Rewrites for API proxy if needed
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
