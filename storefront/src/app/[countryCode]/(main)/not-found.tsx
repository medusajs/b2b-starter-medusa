import InteractiveLink from "@/modules/common/components/interactive-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 - Yello Solar Hub",
  description: "Página não encontrada no Marketplace Solar Yello Solar Hub",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Página não encontrada</h1>
      <p className="text-small-regular text-ui-fg-base">
        A página que você tentou acessar não existe.
      </p>
      <div className="flex gap-4">
        <InteractiveLink href="/">Voltar para a loja</InteractiveLink>
        <InteractiveLink href="/suporte">Falar com especialista</InteractiveLink>
      </div>
      <div className="text-small-regular text-ui-fg-subtle mt-4">
        <p>Sugestões:</p>
        <ul className="list-disc list-inside">
          <li><InteractiveLink href="/categories">Explorar produtos</InteractiveLink></li>
          <li><InteractiveLink href="/dimensionamento">Usar calculadora solar</InteractiveLink></li>
          <li><InteractiveLink href="/suporte">Contato suporte</InteractiveLink></li>
        </ul>
      </div>
    </div>
  )
}
