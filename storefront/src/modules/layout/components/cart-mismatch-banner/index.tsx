"use client"

import { transferCart } from "@/lib/data/customer"
import { ExclamationCircleSolid } from "@medusajs/icons"
import { Button } from "@medusajs/ui"
import { useState } from "react"
import { B2BCart, B2BCustomer } from "types/global"

function CartMismatchBanner(props: { customer: B2BCustomer; cart: B2BCart }) {
  const { customer, cart } = props
  const [isPending, setIsPending] = useState(false)
  const [actionText, setActionText] = useState("Connect cart")

  if (!customer || !!cart.customer_id) {
    return
  }

  const handleSubmit = async () => {
    try {
      setIsPending(true)
      setActionText("Connecting..")

      await transferCart()
    } catch {
      setActionText("Connect cart")
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center justify-center small:p-4 p-2 text-center bg-orange-300 small:gap-2 gap-1 text-sm mt-2 text-orange-800">
      <div className="flex flex-col small:flex-row small:gap-2 gap-1 items-center">
        <span className="flex items-center gap-1">
          <ExclamationCircleSolid className="inline" />
          Cart is not connected to your account
        </span>

        <span>·</span>

        <Button
          variant="transparent"
          className="hover:bg-transparent active:bg-transparent focus:bg-transparent disabled:text-orange-500 text-orange-950 p-0 bg-transparent"
          size="small"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {actionText}
        </Button>
      </div>
    </div>
  )
}

export default CartMismatchBanner
