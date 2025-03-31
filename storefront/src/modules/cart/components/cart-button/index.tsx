import { CartProvider } from "@/lib/context/cart-context"
import { retrieveCart } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import { listCartFreeShippingPrices } from "@/lib/data/fulfillment"
import CartDrawer from "@/modules/cart/components/cart-drawer"
import { StoreFreeShippingPrice } from "@/types/shipping-option/http"

export default async function CartButton() {
  const cart = await retrieveCart().catch(() => null)
  const customer = await retrieveCustomer()

  let freeShippingPrices: StoreFreeShippingPrice[] = []

  if (cart) {
    freeShippingPrices = await listCartFreeShippingPrices(cart.id)
  }

  return (
    <CartProvider cart={cart}>
      <CartDrawer customer={customer} freeShippingPrices={freeShippingPrices} />
    </CartProvider>
  )
}
