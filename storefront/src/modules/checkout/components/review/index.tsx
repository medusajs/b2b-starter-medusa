"use client"

import { Container, Heading, Text, clx } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <Container>
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-row items-center justify-between w-full">
          <Heading
            level="h2"
            className={clx("flex flex-row text-xl gap-x-2 items-baseline", {
              "opacity-50 pointer-events-none select-none": !isOpen,
            })}
          >
            Contact Information
          </Heading>
        </div>
        {isOpen && previousStepsCompleted && (
          <>
            <div className="flex items-start gap-x-1 w-full mb-6">
              <div className="w-full">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  By clicking the Place Order button, you confirm that you have
                  read, understand and accept our Terms of Use, Terms of Sale
                  and Returns Policy and acknowledge that you have read Medusa
                  Store&apos;s Privacy Policy.
                </Text>
              </div>
            </div>
            <PaymentButton cart={cart} data-testid="submit-order-button" />
          </>
        )}
      </div>
    </Container>
  )
}

export default Review
