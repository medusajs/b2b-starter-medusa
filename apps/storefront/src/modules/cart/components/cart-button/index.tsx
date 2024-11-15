import { CartProvider } from "@lib/context/cart-context"
import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartDrawer from "../cart-drawer"

export default async function CartButton() {
  const cart = await retrieveCart().catch(() => null)
  const customer = await retrieveCustomer()

  return (
    <CartProvider cart={cart}>
      <CartDrawer customer={customer} />
    </CartProvider>
  )
}
