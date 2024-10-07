"use client"

import { CheckCircleSolid } from "@medusajs/icons"
import { Container, Heading, Text, useToggleState } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { useCallback } from "react"
import { useFormState } from "react-dom"
import ErrorMessage from "../error-message"
import ShippingAddressForm from "../shipping-address-form"
import { SubmitButton } from "../submit-button"

const ShippingAddress = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "shipping-address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )
  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "shipping-address"))
  }

  const [message, formAction] = useFormState(setAddresses, null)

  return (
    <Container>
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-row items-center justify-between w-full">
          <Heading
            level="h2"
            className="flex flex-row text-xl gap-x-2 items-center"
          >
            Shipping Address
            {!isOpen && <CheckCircleSolid />}
          </Heading>

          {!isOpen && cart?.shipping_address && (
            <Text>
              <button
                onClick={handleEdit}
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="edit-address-button"
              >
                Edit
              </button>
            </Text>
          )}
        </div>
        <Divider />
        {isOpen ? (
          <form action={formAction}>
            <div className="pb-8">
              <ShippingAddressForm
                customer={customer}
                checked={sameAsBilling}
                onChange={toggleSameAsBilling}
                cart={cart}
              />
              <div className="flex flex-col gap-y-2 items-end">
                <SubmitButton
                  className="mt-6"
                  data-testid="submit-address-button"
                >
                  Next step
                </SubmitButton>
                <ErrorMessage
                  error={message}
                  data-testid="address-error-message"
                />
              </div>
            </div>
          </form>
        ) : (
          <div>
            <div className="text-small-regular">
              {cart && cart.shipping_address ? (
                <div className="flex items-start gap-x-8">
                  <div className="flex items-start gap-x-1 w-full">
                    <div
                      className="flex flex-col w-1/3"
                      data-testid="shipping-address-summary"
                    >
                      <Text className="txt-medium-plus text-ui-fg-base mb-1">
                        Shipping Address
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.shipping_address.first_name}{" "}
                        {cart.shipping_address.last_name}
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.shipping_address.address_1}{" "}
                        {cart.shipping_address.address_2}
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.shipping_address.postal_code},{" "}
                        {cart.shipping_address.city}
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.shipping_address.country_code?.toUpperCase()}
                      </Text>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Spinner />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default ShippingAddress
