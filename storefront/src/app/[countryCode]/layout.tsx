import { Metadata } from "next"
import { NavigationHeader } from "@/modules/layout/templates/nav"
import Footer from "@/modules/layout/templates/footer"
import { getBaseURL } from "@/lib/util/env"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  alternates: {
    canonical: getBaseURL(),
    languages: {
      'pt-BR': getBaseURL(),
    },
  },
}

export default function CountryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { countryCode: string }
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
      >
        Pular para o conteúdo principal
      </a>
      <NavigationHeader />
      <main id="main-content" className="flex-1" role="main">
        {children}
      </main>
      <Footer />
    </div>
  )
}
