import { listCartShippingMethods } from "@/lib/data/fulfillment"
import { listCartPaymentMethods } from "@/lib/data/payment"
import ApprovalStatusBanner from "@/modules/purchase/cart/components/approval-status-banner"
import SignInPrompt from "@/modules/purchase/cart/components/sign-in-prompt"
import BillingAddress from "../../components/billing-address"
import Company from "../../components/company"
import ContactDetails from "../../components/contact-details"
import Payment from "../../components/payment"
import Shipping from "../../components/shipping"
import ShippingAddress from "../../components/shipping-address"
import { YelloSolarButton } from "@ysh/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import UTurnArrowRight from "@/modules/common/icons/u-turn-arrow-right"
import { ErrorBoundaryResilient } from "@/components/error-boundary/error-boundary-resilient"
import { ApprovalStatusType, B2BCart, B2BCustomer } from "@/types"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: B2BCart | null
  customer: B2BCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")
  const requiresApproval =
    cart.company?.approval_settings?.requires_admin_approval ||
    cart.company?.approval_settings?.requires_sales_manager_approval

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  return (
    <ErrorBoundaryResilient
      context="checkout-form"
      fallbackMessage="Erro ao carregar o formulário de checkout. Tente recarregar a página."
      showRetry={true}
      maxRetries={3}
    >
      <div>
        <div className="w-full grid grid-cols-1 gap-y-2">
          <LocalizedClientLink
            className="flex items-baseline gap-2 text-sm text-neutral-400 hover:text-neutral-500"
            href="/cart"
          >
            <YelloSolarButton variant="stroke">
              <UTurnArrowRight />
              Voltar ao carrinho
            </YelloSolarButton>
          </LocalizedClientLink>

          {!customer ? <SignInPrompt /> : null}

          {cart.approval_status &&
            cart.approval_status.status !== ApprovalStatusType.APPROVED && (
              <ApprovalStatusBanner cart={cart} />
            )}

          {cart?.company && <Company cart={cart} />}

          <ShippingAddress cart={cart} customer={customer} />

          <BillingAddress cart={cart} />

          <Shipping cart={cart} availableShippingMethods={shippingMethods} />

          <ContactDetails cart={cart} customer={customer} />

          {(customer?.employee?.is_admin &&
            cart.approval_status?.status === ApprovalStatusType.APPROVED) ||
            !requiresApproval ? (
            <Payment cart={cart} availablePaymentMethods={paymentMethods} />
          ) : null}
        </div>
      </div>
    </ErrorBoundaryResilient>
  )
}
