import { getBaseURL } from "@/lib/util/env"
import { Toaster } from "@medusajs/ui"
import { Analytics } from "@vercel/analytics/next"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import "@/styles/globals.css"

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
      <body className="font-sans">
        <main className="relative">{props.children}</main>
        <Toaster className="z-[99999]" position="bottom-left" />
        <Analytics />
      </body>
    </html>
  )
}
