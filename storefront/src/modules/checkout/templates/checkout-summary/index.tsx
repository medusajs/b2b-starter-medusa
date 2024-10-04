import { Container, Heading } from "@medusajs/ui"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <Container className="sticky top-2 h-fit w-full flex flex-col small:mt-10">
      <Heading level="h2" className="flex flex-row text-xl items-baseline">
        In your Cart
      </Heading>
      <Divider className="my-6" />
      <CartTotals totals={cart} />
      <ItemsPreviewTemplate items={cart?.items} />
      <div className="my-6">
        <DiscountCode cart={cart} />
      </div>
    </Container>
  )
}

export default CheckoutSummary
