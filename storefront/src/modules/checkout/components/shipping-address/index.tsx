"use client"

import { setShippingAddress } from "@/lib/data/cart"
import ErrorMessage from "@/modules/checkout/components/error-message"
import ShippingAddressForm from "@/modules/checkout/components/shipping-address-form"
import { SubmitButton } from "@/modules/checkout/components/submit-button"
import Divider from "@/modules/common/components/divider"
import Spinner from "@/modules/common/icons/spinner"
import { B2BCart, B2BCustomer } from "@/types"
import { ApprovalStatusType } from "@/types/approval"
import { CheckCircleSolid } from "@medusajs/icons"
import { Container, Heading, Text } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"

const ShippingAddress = ({
  cart,
  customer,
}: {
  cart: B2BCart | null
  customer: B2BCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [error, setError] = useState<string | null>(null)

  const isOpen = searchParams.get("step") === "shipping-address"

  const cartApprovalStatus = cart?.approval_status?.status

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )
  const handleEdit = () => {
    router.push(
      pathname + "?" + createQueryString("step", "shipping-address"),
      { scroll: false }
    )
  }

  const handleSubmit = async (formData: FormData) => {
    await setShippingAddress(formData).catch((e) => {
      setError(e.message)
      return
    })

    router.push(pathname + "?" + createQueryString("step", "billing-address"), {
      scroll: false,
    })
  }

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

          {!isOpen &&
            cart?.shipping_address &&
            cartApprovalStatus !== ApprovalStatusType.PENDING && (
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
          <form action={handleSubmit}>
            <div className="pb-8">
              <ShippingAddressForm customer={customer} cart={cart} />
              <div className="flex flex-col gap-y-2 items-end">
                <SubmitButton
                  className="mt-6"
                  data-testid="submit-address-button"
                >
                  Next step
                </SubmitButton>
                <ErrorMessage
                  error={error}
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
                  <div className="flex" data-testid="shipping-address-summary">
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address.first_name}{" "}
                      {cart.shipping_address.last_name},{" "}
                      {cart.shipping_address.address_1},{" "}
                      {cart.shipping_address.postal_code},{" "}
                      {cart.shipping_address.city},{" "}
                      {cart.shipping_address.country_code?.toUpperCase()}
                    </Text>
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
