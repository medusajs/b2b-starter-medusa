import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Thumbnail from "@/modules/products/components/thumbnail"
import { ArrowUturnLeft } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Text } from "@medusajs/ui"

const PreviouslyPurchasedProduct = ({
  variant,
}: {
  variant: HttpTypes.StoreOrderLineItem
}) => {
  const { thumbnail, product_title, product_handle, title } = variant

  return (
    <Container className="flex justify-between items-center">
      <div className="flex gap-2">
        <div className="w-14 h-14 rounded-md overflow-hidden bg-neutral-100">
          <Thumbnail thumbnail={thumbnail} size="square" />
        </div>
        <div className="flex flex-col justify-center">
          <Text className="text-lg text-neutral-950">{product_title}</Text>
          <Text className="text-sm text-neutral-500">{title}</Text>
        </div>
      </div>
      <LocalizedClientLink href={`/products/${product_handle}`}>
        <Button variant="secondary" className="h-8 px-4 text-neutral-600">
          Buy again
          <ArrowUturnLeft className="inline-block ml-1 " />
        </Button>
      </LocalizedClientLink>
    </Container>
  )
}

export default PreviouslyPurchasedProduct
