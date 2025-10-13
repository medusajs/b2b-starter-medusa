import { CartProvider } from "@/lib/context/cart-context"
import { retrieveCart } from "@/lib/data/cart-resilient"
import { retrieveCustomer } from "@/lib/data/customer"
import CartTemplate from "@/modules/cart/templates"
import { CartStatusDisplay } from "@/components/cart/cart-status-display"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Veja seu carrinho de compras",
}

export default async function Cart() {
  const cart = await retrieveCart().catch(() => null)
  const customer = await retrieveCustomer()

  return (
    <CartProvider cart={cart}>
      <CartStatusDisplay className="mb-4" />
      <CartTemplate customer={customer} />
    </CartProvider>
  )
}
