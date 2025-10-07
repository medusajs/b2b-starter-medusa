const checkEnvVariables = require('./check-env-variables')

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  // Configurações de performance otimizadas para nível Vercel
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Output standalone para Edge Runtime
  output: 'standalone',

  // Experimental features para máxima performance
  experimental: {
    optimizeCss: true,
    gzipSize: true,
    optimizePackageImports: [
      '@medusajs/ui',
      'lucide-react',
      '@headlessui/react',
      '@radix-ui/react-dialog'
    ],
    // Webpack build worker
    webpackBuildWorker: true,
  },

  // Turbopack para produção também
  turbopack: {},

  // Configurações de imagem ultra-otimizadas
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 ano
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: 'default-src \'self\'; script-src \'none\'; sandbox;',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'medusa-server-testing.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'medusa-server-testing.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  // Webpack optimizations com Workbox para PWA
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Otimização de bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\\/]node_modules[\\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          medusa: {
            test: /[\\\/]node_modules[\\\/]@medusajs[\\\/]/,
            name: 'medusa-vendor',
            chunks: 'all',
            priority: 20,
          },
          ui: {
            test: /[\\\/]node_modules[\\\/]@radix-ui[\\\/]|[\\\/]node_modules[\\\/]@headlessui[\\\/]/,
            name: 'ui-vendor',
            chunks: 'all',
            priority: 15,
          },
        },
      },
    }

    // Workbox para PWA - só em produção
    if (!dev && !isServer) {
      const { GenerateSW } = require('workbox-webpack-plugin')

      config.plugins.push(
        new GenerateSW({
          swDest: 'sw.js',
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https?.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'offlineCache',
                expiration: {
                  maxEntries: 200,
                },
              },
            },
          ],
        })
      )
    }

    // Análise de bundle em desenvolvimento
    if (!dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          openAnalyzer: false,
        })
      )
    }

    return config
  },

  // Headers de segurança e performance otimizados
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Performance headers
          {
            key: 'X-Accel-Buffering',
            value: 'no',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=0, stale-while-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*\\.(?:css|js|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Páginas específicas com ISR
      {
        source: '/:countryCode/produtos',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:countryCode',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=1800, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },

  // Rewrites para API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://your-backend-domain.com/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
