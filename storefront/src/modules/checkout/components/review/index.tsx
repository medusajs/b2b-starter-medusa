"use client"

import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PaymentButton from "../payment-button"

const Review = ({ cart }: { cart: any }) => {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-start gap-x-1 w-full mb-6">
        <Text className="txt-xsmall text-neutral-500 mb-1">
          By Completing this order, I agree to Medusa&apos;s{" "}
          <LocalizedClientLink
            href="/terms-of-sale"
            className="hover:text-neutral-800"
            target="_blank"
          >
            Terms of Sale ↗
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/privacy-policy"
            className="hover:text-neutral-800"
            target="_blank"
          >
            Privacy Policy ↗
          </LocalizedClientLink>
        </Text>
      </div>
      <PaymentButton cart={cart} data-testid="submit-order-button" />
    </div>
  )
}

export default Review
