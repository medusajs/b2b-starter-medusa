import { getBaseURL } from "@/lib/util/env"
import { Toaster } from "@medusajs/ui"
import { Analytics } from "@vercel/analytics/next"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import { PWAProvider } from "@/components/PWAProvider"
import "@/styles/globals.css"
import { LeadQuoteProvider } from "@/modules/lead-quote/context"
import { AnalyticsProvider } from "@/modules/analytics/AnalyticsProvider"

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
    <html lang="pt-BR" data-mode="light" className={inter.variable}>
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
        <AnalyticsProvider>
          <PWAProvider>
            <LeadQuoteProvider>
              <main className="relative">{props.children}</main>
            </LeadQuoteProvider>
            <Toaster className="z-[99999]" position="bottom-left" />
            <Analytics />
          </PWAProvider>
        </AnalyticsProvider>
      </body>
    </html>
  )
}
