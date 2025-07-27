/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable image optimization for better caching
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  // API configuration for security
  serverExternalPackages: [],
  // Webpack configuration for better module resolution
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle potential module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }

    // Optimize chunks for better loading
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          default: false,
          vendors: false,
          // Bundle common vendor libraries
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
        },
      }
    }

    return config
  },
  // Environment variables that should be available at build time
  env: {
    CUSTOM_BUILD_TIME: new Date().toISOString(),
    // Supabase configuration for build-time access
    SUPABASE_URL: 'https://ksmxqswuzrmdgckwxkvn.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhxc3d1enJtZGdja3d4a3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODUyNjIsImV4cCI6MjA1NzM2MTI2Mn0.YKz7fKPbl7pbvEMN08lFOPm1SSg59R4lu8tzV8Kkz2E',
    NEXT_PUBLIC_SUPABASE_URL: 'https://ksmxqswuzrmdgckwxkvn.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhxc3d1enJtZGdja3d4a3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODUyNjIsImV4cCI6MjA1NzM2MTI2Mn0.YKz7fKPbl7pbvEMN08lFOPm1SSg59R4lu8tzV8Kkz2E',
  },
}

export default nextConfig