// Configuration for different deployment environments
export const getApiUrl = (): string => {
  // Check for explicit API URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Auto-detect Vercel preview/production URLs
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // If on Vercel, construct backend URL
    if (hostname.includes('vercel.app')) {
      // Replace frontend subdomain with backend
      const backendUrl = hostname.replace('sebi-compliance-frontend', 'sebi-compliance-backend');
      return `https://${backendUrl}`;
    }
  }

  // Fallback to deployed backend (for production)
  return 'https://reglex-backend-127310351608.us-central1.run.app';
};

export const config = {
  apiUrl: getApiUrl(),
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
  enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
  apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '300000'),
  environment: process.env.NODE_ENV || 'development',
};

// Enhanced configuration with proper API structure
export const APP_CONFIG = {
  // API Configuration
  API_URL: getApiUrl(),
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '300000'),
  USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
  
  // Retry Configuration
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000,
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
  
  // Environment
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

// API Configuration helper
export const getApiConfig = () => ({
  baseURL: APP_CONFIG.API_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Offline mode detection
export const isOfflineMode = (): boolean => {
  return APP_CONFIG.USE_MOCK_API;
};
