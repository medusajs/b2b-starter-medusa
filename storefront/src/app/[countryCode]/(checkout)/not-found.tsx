import InteractiveLink from "@/modules/common/components/interactive-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout indisponível - Yello Solar Hub",
  description: "O checkout não está disponível para esta região.",
}

export default async function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Checkout indisponível</h1>
      <p className="text-small-regular text-ui-fg-base">
        O checkout não está disponível para esta região.
      </p>
      <InteractiveLink href="/cart">Voltar ao carrinho</InteractiveLink>
    </div>
  )
}
