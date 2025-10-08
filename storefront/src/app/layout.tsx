import { getBaseURL } from "@/lib/util/env"
import { Toaster } from "@medusajs/ui"
import { Analytics } from "@vercel/analytics/next"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import { PWAProvider } from "@/components/PWAProvider"
import "@/styles/globals.css"
import { LeadQuoteProvider } from "@/modules/lead-quote/context"
import { AnalyticsProvider } from "@/modules/analytics/AnalyticsProvider"
import { PostHogProvider } from "@/providers/posthog-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "Yello Solar Hub - Energia Solar sob Medida",
  description: "Soluções completas em energia solar: painéis, inversores, kits prontos e dimensionamento personalizado para sua economia de energia.",
  keywords: "energia solar, painéis solares, inversores, kits solares, dimensionamento solar, Yello Solar Hub",
  authors: [{ name: "Yello Solar Hub" }],
  openGraph: {
    title: "Yello Solar Hub - Energia Solar sob Medida",
    description: "Soluções completas em energia solar: painéis, inversores, kits prontos e dimensionamento personalizado.",
    type: "website",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Yello Solar Hub" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
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
        <PostHogProvider>
          <AnalyticsProvider>
            <PWAProvider>
              <LeadQuoteProvider>
                <main className="relative">{props.children}</main>
              </LeadQuoteProvider>
              <Toaster className="z-[99999]" position="bottom-left" />
              <Analytics />
            </PWAProvider>
          </AnalyticsProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
