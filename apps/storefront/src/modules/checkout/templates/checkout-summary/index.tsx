import { getCustomer } from "@lib/data/customer"
import { checkSpendingLimit } from "@lib/util/check-spending-limit"
import { Container } from "@medusajs/ui"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import Review from "@modules/checkout/components/review"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { B2BCart } from "types/global"

const CheckoutSummary = async ({ cart }: { cart: B2BCart }) => {
  const customer = await getCustomer()
  const spendLimitExceeded = checkSpendingLimit(cart, customer)

  return (
    <Container className="sticky top-2 h-fit w-full flex flex-col small:mt-10">
      <ItemsPreviewTemplate items={cart?.items} />
      <Divider className="my-2" />
      <CartTotals totals={cart} />
      {/* <DiscountCode cart={cart} /> */}
      <Review cart={cart} spendLimitExceeded={spendLimitExceeded} />
    </Container>
  )
}

export default CheckoutSummary
