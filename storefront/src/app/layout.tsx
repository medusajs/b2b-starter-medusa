import { getBaseURL } from "@/lib/util/env"
import { Toaster } from "@medusajs/ui"
import { Analytics } from "@vercel/analytics/next"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import { PWAProvider } from "@/components/PWAProvider"
import "@/styles/globals.css"
import "@ysh/ui/styles/theme.css"
import "@ysh/ui/styles/gradients.css"
import { LeadQuoteProvider } from "@/modules/lead-quote/context"
import { AnalyticsProvider } from "@/modules/analytics/AnalyticsProvider"
import { PostHogProvider } from "@/providers/posthog-provider"
import SkipLinks from "@/components/common/SkipLinks"
import { ConsentBanner } from "@/components/ConsentBanner"
import { WebVitals } from "@/components/WebVitals"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Yello Solar Hub - Energia Solar sob Medida para Empresas",
    template: "%s | Yello Solar Hub",
  },
  description:
    "Plataforma B2B de energia solar: catálogo completo de painéis, inversores e kits fotovoltaicos. Cotações personalizadas, dimensionamento técnico e suporte especializado para integradores e empresas.",
  keywords: [
    "energia solar B2B",
    "painéis solares atacado",
    "inversores fotovoltaicos",
    "kits solares empresas",
    "dimensionamento solar",
    "integradores solares",
    "Yello Solar Hub",
    "catálogo fotovoltaico",
  ],
  authors: [{ name: "Yello Solar Hub", url: getBaseURL() }],
  creator: "Yello Solar Hub",
  publisher: "Yello Solar Hub",
  alternates: {
    canonical: getBaseURL(),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: getBaseURL(),
    siteName: "Yello Solar Hub",
    title: "Yello Solar Hub - Energia Solar sob Medida para Empresas",
    description:
      "Plataforma B2B de energia solar: catálogo completo, cotações personalizadas e suporte técnico especializado.",
    locale: "pt_BR",
    images: [
      {
        url: `${getBaseURL()}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Yello Solar Hub - Plataforma B2B de Energia Solar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@YelloSolarHub",
    creator: "@YelloSolarHub",
    title: "Yello Solar Hub - Energia Solar B2B",
    description: "Plataforma completa para integradores: catálogo, cotações e suporte técnico.",
    images: [`${getBaseURL()}/twitter-image.jpg`],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* PWA & Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />

        {/* Preload critical logo assets */}
        <link rel="preload" href="/yello-black_logomark.png" as="image" type="image/png" fetchPriority="high" />
        <link rel="preload" href="/yello-white_logomark.png" as="image" type="image/png" />

        {/* Performance: Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL} />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL} />
          </>
        )}

        {/* Theme colors for light/dark (zinc-950) */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />

        {/* Initialize color scheme early to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const storageKey = 'theme';
    const stored = window.localStorage.getItem(storageKey);
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : systemDark;
    const html = document.documentElement;
    if (dark) { html.classList.add('dark'); html.setAttribute('data-mode','dark'); }
    else { html.classList.remove('dark'); html.setAttribute('data-mode','light'); }
  } catch {}
})();`,
          }}
        />

        {/* PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Yello Solar Hub" />
        <meta name="format-detection" content="telephone=no" />

        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Yello Solar Hub",
              url: getBaseURL(),
              logo: `${getBaseURL()}/logo.png`,
              description:
                "Plataforma B2B de energia solar para integradores: catálogo completo, cotações personalizadas e suporte técnico.",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Sales",
                availableLanguage: ["Portuguese"],
              },
              sameAs: [
                "https://www.linkedin.com/company/yellosolar",
                "https://twitter.com/YelloSolarHub",
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans">
        {/* Brand gradients for stroke/fill (global) */}
        <svg width="0" height="0" className="absolute pointer-events-none select-none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="ysh-brand-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#F59E0B" offset="0%" />
              <stop stopColor="#F97316" offset="50%" />
              <stop stopColor="#FDE047" offset="100%" />
            </linearGradient>
            <linearGradient id="ysh-brand-fill" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#F59E0B" offset="0%" />
              <stop stopColor="#F97316" offset="50%" />
              <stop stopColor="#FDE047" offset="100%" />
            </linearGradient>
          </defs>
        </svg>
        <SkipLinks />
        <PostHogProvider>
          <AnalyticsProvider>
            <PWAProvider>
              <LeadQuoteProvider>
                <main id="main-content" className="relative">{props.children}</main>
              </LeadQuoteProvider>
              <Toaster className="z-[99999]" position="bottom-left" aria-live="polite" aria-atomic="true" />
              {/* Screen reader live region for critical announcements */}
              <div
                role="status"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
                id="sr-announcements"
              />
              <ConsentBanner />
              <WebVitals />
              <Analytics />
            </PWAProvider>
          </AnalyticsProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
