import { retrieveCart } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import { listCartFreeShippingPrices } from "@/lib/data/fulfillment"
import { getBaseURL } from "@/lib/util/env"
import Footer from "@/modules/layout/templates/footer"
import { NavigationHeader } from "@/modules/layout/templates/nav"
import CartMismatchBannerClient from "@/components/client/CartMismatchBannerClient"
import FreeShippingPriceNudgeClient from "@/components/client/FreeShippingPriceNudgeClient"
import { StoreFreeShippingPrice } from "@/types/shipping-option/http"
import { ArrowUpRightMini, ExclamationCircleSolid } from "@medusajs/icons"
import { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  // Otimização: executar operações em paralelo
  const [customer, cart] = await Promise.all([
    retrieveCustomer().catch(() => null),
    retrieveCart().catch(() => null)
  ])

  let freeShippingPrices: StoreFreeShippingPrice[] = []

  if (cart) {
    freeShippingPrices = await listCartFreeShippingPrices(cart.id)
  }

  return (
    <>
      <NavigationHeader />
      <div className="flex items-center text-neutral-50 justify-center small:p-4 p-2 text-center bg-neutral-900 small:gap-2 gap-1 text-sm">
        <div className="flex flex-col small:flex-row small:gap-2 gap-1 items-center">
          <span className="flex items-center gap-1">
            <ExclamationCircleSolid className="inline" color="#A1A1AA" />
            Build your own B2B store with this starter:
          </span>

          <a
            className="group hover:text-ui-fg-interactive-hover text-ui-fg-interactive self-end small:self-auto"
            href="https://git.new/b2b-starter-repo"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repo
            <ArrowUpRightMini className="group-hover:text-ui-fg-interactive-hover inline text-ui-fg-interactive" />
          </a>
        </div>
      </div>

      {customer && cart && (
        <CartMismatchBannerClient customer={customer} cart={cart} />
      )}

      {props.children}

      <Footer />

      {cart && freeShippingPrices && freeShippingPrices.length > 0 && (
        <FreeShippingPriceNudgeClient
          variant="popup"
          cart={cart as any}
          freeShippingPrices={freeShippingPrices}
        />
      )}
    </>
  )
}
