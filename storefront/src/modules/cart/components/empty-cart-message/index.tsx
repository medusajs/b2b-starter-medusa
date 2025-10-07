import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Heading, Text } from "@medusajs/ui"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-48 px-2 flex flex-col justify-center items-start"
      data-testid="empty-cart-message"
    >
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        Carrinho
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        Você não tem itens no carrinho. Use o link abaixo para explorar nossos produtos.
      </Text>
      <div>
        <LocalizedClientLink href="/produtos" className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
          Explorar produtos
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
