import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import LogoIcon from "@/modules/common/icons/logo"
import MedusaCTA from "@/modules/layout/components/medusa-cta"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mb-2 w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink className="hover:text-ui-fg-base" href="/">
            <h1 className="text-base font-medium flex items-center">
              <LogoIcon className="inline mr-2" />
              Yello Solar Hub
              <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">Marketplace Solar</span>
            </h1>
          </LocalizedClientLink>
        </nav>
      </div>
      <div className="bg-white py-2 border-b">
        <div className="content-container">
          <div className="flex justify-center space-x-4 text-sm">
            <span className="text-gray-500">1. Carrinho</span>
            <span className="text-gray-500">→</span>
            <span className="text-gray-500">2. Dados & Entrega</span>
            <span className="text-gray-500">→</span>
            <span className="font-semibold text-amber-600">3. Pagamento & Financiamento</span>
            <span className="text-gray-500">→</span>
            <span className="text-gray-500">4. Confirmação</span>
          </div>
        </div>
      </div>
      <div className="relative bg-neutral-100" data-testid="checkout-container">
        {children}
      </div>
      <div className="py-4 w-full flex items-center justify-center bg-white border-t">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4">
            <LocalizedClientLink href="/ferramentas/financiamento" className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
              Simular financiamento
            </LocalizedClientLink>
            <LocalizedClientLink href="/suporte" className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
              Falar com especialista
            </LocalizedClientLink>
          </div>
          <div className="text-xs text-gray-500 text-center">
            <p>Pagamento seguro • Dados protegidos (LGPD)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
