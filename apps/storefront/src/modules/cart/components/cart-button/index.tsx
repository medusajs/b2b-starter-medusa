import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import CartDrawer from "../cart-drawer"
import { getCustomer } from "@lib/data/customer"
import { CartProvider } from "@lib/context/cart-context"

const fetchCart = async () => {
  const cart = await retrieveCart()

  if (!cart) {
    return null
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart.items, cart.region_id!)
    cart.items = enrichedItems
  }

  return cart
}

export default async function CartButton() {
  const cart = await fetchCart()
  const customer = await getCustomer()

  return (
    <CartProvider cart={cart}>
      <CartDrawer customer={customer} />
    </CartProvider>
  )
}
