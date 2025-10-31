"use client"

import { isPaypal, isStripeLike } from "@/lib/constants"
import { B2BCart } from "@/types"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { loadStripe } from "@stripe/stripe-js"
import React, { createContext } from "react"
import StripeWrapper from "./stripe-wrapper"

type WrapperProps = {
  cart: B2BCart
  children: React.ReactNode
}

export const StripeContext = createContext(false)

const stripeKey =
  process.env.NEXT_PUBLIC_STRIPE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY

const medusaAccountId = process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID
const stripePromise = stripeKey
  ? loadStripe(
      stripeKey,
      medusaAccountId ? { stripeAccount: medusaAccountId } : undefined
    )
  : null

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

const Wrapper: React.FC<WrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  if (
    isStripeLike(paymentSession?.provider_id) &&
    paymentSession &&
    stripePromise
  ) {
    return (
      <StripeContext.Provider value={true}>
        <StripeWrapper
          paymentSession={paymentSession}
          stripeKey={stripeKey}
          stripePromise={stripePromise}
        >
          {children}
        </StripeWrapper>
      </StripeContext.Provider>
    )
  }

  if (
    isPaypal(paymentSession?.provider_id) &&
    paypalClientId !== undefined &&
    cart
  ) {
    return (
      <PayPalScriptProvider
        options={{
          "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
          currency: cart?.currency_code.toUpperCase(),
          intent: "authorize",
          components: "buttons",
        }}
      >
        {children}
      </PayPalScriptProvider>
    )
  }

  return <div>{children}</div>
}

export default Wrapper
