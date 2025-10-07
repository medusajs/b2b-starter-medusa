import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import { Metadata } from "next"
import Link from "next/link"

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
        <Link
          className="flex gap-x-1 items-center group"
          href="/"
        >
          <Text className="text-ui-fg-interactive">Voltar para a loja</Text>
          <ArrowUpRightMini
            className="group-hover:rotate-45 ease-in-out duration-150"
            color="var(--fg-interactive)"
          />
        </Link>
        <Link
          className="flex gap-x-1 items-center group"
          href="/suporte"
        >
          <Text className="text-ui-fg-interactive">Falar com especialista</Text>
          <ArrowUpRightMini
            className="group-hover:rotate-45 ease-in-out duration-150"
            color="var(--fg-interactive)"
          />
        </Link>
      </div>
      <div className="text-small-regular text-ui-fg-subtle mt-4">
        <p>Sugestões:</p>
        <ul className="list-disc list-inside">
          <li><Link href="/produtos" className="text-ui-fg-interactive hover:underline">Explorar produtos</Link></li>
          <li><Link href="/dimensionamento" className="text-ui-fg-interactive hover:underline">Usar calculadora solar</Link></li>
          <li><Link href="/suporte" className="text-ui-fg-interactive hover:underline">Contato suporte</Link></li>
        </ul>
      </div>
    </div>
  )
}
