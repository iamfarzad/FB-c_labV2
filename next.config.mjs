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
  },
}

export default nextConfig
