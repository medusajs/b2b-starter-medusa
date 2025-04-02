import { retrieveCart } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import Wrapper from "@/modules/checkout/components/payment-wrapper"
import CheckoutForm from "@/modules/checkout/templates/checkout-form"
import CheckoutSummary from "@/modules/checkout/templates/checkout-summary"
import { B2BCart } from "@/types/global"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const cartId = searchParams?.cartId as string
  const cart = (await retrieveCart(cartId)) as B2BCart

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <Wrapper cart={cart}>
      <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-2 py-24 h-full">
        <CheckoutForm cart={cart} customer={customer} />
        <div className="relative">
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </Wrapper>
  )
}
