import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 - Página Não Encontrada | Yello Solar Hub",
  description: "Esta rota não existe no catálogo YSH. Explore produtos, dimensionamento ou fale com especialista.",
}

/**
 * NotFound - Página 404 com microcopy Hélio (cordial, prestativo, oferece soluções)
 * UX Strategy: sempre oferecer caminho alternativo, não deixar usuário preso
 */
export default function NotFound() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[calc(100vh-64px)] px-4">
      {/* Heading com número HTTP para SEO/acessibilidade */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-ui-fg-base">
          404 — Rota Não Encontrada
        </h1>
        <p className="text-base text-ui-fg-subtle max-w-md">
          Comandante, esta página não existe no nosso sistema. Vamos redirecionar você para onde precisa.
        </p>
      </div>

      {/* CTAs primários */}
      <div className="flex flex-wrap gap-3 justify-center">
        <LocalizedClientLink
          href="/"
          className="px-6 py-2.5 bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-colors"
        >
          Início
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/suporte"
          className="px-6 py-2.5 border border-brand-500 text-brand-600 rounded-md hover:bg-brand-50 transition-colors"
        >
          Falar com Especialista
        </LocalizedClientLink>
      </div>

      {/* Sugestões contextuais */}
      <nav className="text-sm text-ui-fg-subtle mt-4" aria-label="Sugestões de navegação">
        <p className="font-semibold mb-2 text-ui-fg-base">Atalhos Úteis:</p>
        <ul className="space-y-1.5">
          <li>
            <LocalizedClientLink href="/categories" className="hover:text-brand-600 underline-offset-2 hover:underline">
              📦 Catálogo de Produtos
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/dimensionamento" className="hover:text-brand-600 underline-offset-2 hover:underline">
              ⚙️ Calculadora de Dimensionamento
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/cotacao" className="hover:text-brand-600 underline-offset-2 hover:underline">
              📊 Solicitar Cotação
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/suporte" className="hover:text-brand-600 underline-offset-2 hover:underline">
              📞 Suporte Técnico
            </LocalizedClientLink>
          </li>
        </ul>
      </nav>
    </div>
  )
}
