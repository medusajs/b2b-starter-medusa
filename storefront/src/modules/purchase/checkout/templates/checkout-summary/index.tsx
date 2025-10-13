import { retrieveCustomer } from "@/lib/data/customer"
import ItemsPreviewTemplate from "@/modules/cart/templates/preview"
import CheckoutTotals from "@/modules/checkout/components/checkout-totals"
import PromotionCode from "@/modules/checkout/components/promotion-code"
import Review from "@/modules/checkout/components/review"
import Divider from "@/modules/common/components/divider"
import ErrorBoundaryResilient from "@/components/error-boundary/error-boundary-resilient"
import { B2BCart } from "@/types"
import { Container } from "@medusajs/ui"

const CheckoutSummary = async ({ cart }: { cart: B2BCart }) => {
  const customer = await retrieveCustomer()

  return (
    <ErrorBoundaryResilient
      context="checkout-summary"
      fallbackMessage="Erro ao carregar o resumo do checkout. Tente recarregar a página."
      showRetry={true}
      maxRetries={3}
    >
      <Container className="sticky top-2 h-fit w-full flex flex-col small:mt-10">
        <ItemsPreviewTemplate
          items={cart?.items}
          currencyCode={cart.currency_code}
        />
        <Divider className="my-2" />
        <CheckoutTotals cartOrOrder={cart} />
        <PromotionCode cart={cart} />
        <Divider className="my-2" />
        <Review cart={cart} customer={customer} />
      </Container>
    </ErrorBoundaryResilient>
  )
}

export default CheckoutSummary
