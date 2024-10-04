"use client"

import { CheckCircleSolid } from "@medusajs/icons"
import { clx, Container, Heading, Text, useToggleState } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import CheckboxWithLabel from "@modules/common/components/checkbox"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { useFormState } from "react-dom"
import BillingAddressForm from "../billing-address-form"
import ErrorMessage from "../error-message"
import ShippingAddressForm from "../shipping-address-form"
import { SubmitButton } from "../submit-button"

const BillingAddress = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "billingaddress"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=billingaddress")
  }

  const handleToggleSameAsBilling = () => {
    toggleSameAsBilling()
    sameAsBilling && handleEdit()
    !sameAsBilling && router.push(pathname + "?step=delivery")
  }

  const [message, formAction] = useFormState(setAddresses, null)

  return (
    <Container>
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-row items-center justify-between w-full">
          <Heading
            level="h2"
            className="flex flex-row text-xl gap-x-2 items-baseline"
          >
            Billing Address
          </Heading>
          <CheckboxWithLabel
            label="Same as shipping address"
            name="same_as_billing"
            checked={sameAsBilling}
            onChange={handleToggleSameAsBilling}
            data-testid="billing-address-checkbox"
          />
        </div>
        {isOpen && <Divider />}
        {!sameAsBilling && (
          <div className="flex flex-col gap-y-2">
            {isOpen ? (
              <form action={formAction}>
                <div className="pb-8">
                  <BillingAddressForm cart={cart} />
                </div>
                <div className="flex flex-row justify-end">
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
              </form>
            ) : (
              <div>
                <div className="text-small-regular">
                  {cart && cart.billing_address?.first_name && (
                    <div className="flex items-start gap-x-8">
                      <div className="flex items-start gap-x-1 w-1/3">
                        <div className="flex flex-col">
                          <Text className="txt-medium-plus text-ui-fg-base mb-1">
                            Billing Address
                          </Text>
                          <Text className="txt-medium text-ui-fg-subtle">
                            {cart.billing_address.first_name}{" "}
                            {cart.billing_address.last_name}
                          </Text>
                          <Text className="txt-medium text-ui-fg-subtle">
                            {cart.billing_address.address_1}{" "}
                            {cart.billing_address.address_2}
                          </Text>
                          <Text className="txt-medium text-ui-fg-subtle">
                            {cart.billing_address.postal_code}{" "}
                            {cart.billing_address.city}
                          </Text>
                          <Text className="txt-medium text-ui-fg-subtle">
                            {cart.billing_address.country_code?.toUpperCase()}
                          </Text>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}

export default BillingAddress
