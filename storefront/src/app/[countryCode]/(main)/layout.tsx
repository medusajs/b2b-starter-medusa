import { Metadata } from "next"
import { getBaseURL } from "@/lib/util/env"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

/**
 * MainLayout - Layout do grupo de rotas (main)
 * Hierarquia Medusa: RootLayout → CountryLayout → MainLayout → Pages
 * Fornece estrutura semântica para rotas públicas principais
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {children}
    </div>
  )
}
