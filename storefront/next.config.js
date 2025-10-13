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

  // Output standalone para Edge Runtime - REMOVIDO para evitar problemas com eval
  output: 'standalone',

  // Configurações de imagem otimizadas para performance
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 ano
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        protocol: 'https',
        hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'yellosolarhub.com',
      },
      {
        protocol: 'https',
        hostname: 'api.yellosolarhub.com',
      },
      ...(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        ? (() => {
          try {
            const u = new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)
            return [
              {
                protocol: u.protocol.replace(':', ''),
                hostname: u.hostname,
                ...(u.port && { port: u.port }),
              },
            ]
          } catch {
            return []
          }
        })()
        : []),
    ],
  },

  // Webpack optimizations básicas
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Removendo configuração customizada de splitChunks para evitar conflitos
    // O Next.js já tem otimizações próprias de bundle splitting

    return config
  },

  // Headers de segurança e performance
  async headers() {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://api.yellosolarhub.com'
    const backendDomain = backendUrl.replace(/https?:\/\//, '')

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
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Production: strict CSP without unsafe-inline (use nonce for inline scripts)
              ...(process.env.NODE_ENV === 'production'
                ? ["script-src 'self' https://vercel.live https://*.vercel-scripts.com https://va.vercel-scripts.com https://app.posthog.com"]
                : ["script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com https://va.vercel-scripts.com https://app.posthog.com"]
              ),
              // Production: use nonce for inline styles or extract to CSS files
              ...(process.env.NODE_ENV === 'production'
                ? ["style-src 'self' https://fonts.googleapis.com"]
                : ["style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"]
              ),
              "img-src 'self' data: blob: https://medusa-public-images.s3.eu-west-1.amazonaws.com https://yellosolarhub.com https://api.yellosolarhub.com https://${backendDomain}",
              "font-src 'self' data: https://fonts.gstatic.com",
              `connect-src 'self' https://${backendDomain} https://vitals.vercel-insights.com https://app.posthog.com wss://*.pusher.com`,
              "frame-src 'self' https://vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
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
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*.{jpg,jpeg,png,webp,avif,gif,svg,ico}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },

}

module.exports = nextConfig
