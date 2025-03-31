"use client"

import { setShippingMethod } from "@/lib/data/cart"
import { convertToLocale } from "@/lib/util/money"
import ErrorMessage from "@/modules/checkout/components/error-message"
import Button from "@/modules/common/components/button"
import Divider from "@/modules/common/components/divider"
import Radio from "@/modules/common/components/radio"
import { ApprovalStatusType, B2BCart } from "@/types"
import { RadioGroup, Radio as RadioGroupOption } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Heading, Text, clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type ShippingProps = {
  cart: B2BCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const cartApprovalStatus = cart?.approval_status?.status

  const selectedShippingMethod = availableShippingMethods?.find(
    (method) => method.id === cart.shipping_methods?.at(-1)?.shipping_option_id
  )

  const selectedMethodId = selectedShippingMethod?.id || ""

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=contact-details", { scroll: false })
  }

  const set = async (id: string) => {
    setIsLoading(true)
    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <Container>
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-row items-center justify-between w-full">
          <Heading
            level="h2"
            className={clx("flex flex-row text-xl gap-x-2 items-center", {
              "opacity-50 pointer-events-none select-none":
                !isOpen && cart.shipping_methods?.length === 0,
            })}
          >
            Delivery Method
            {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
              <CheckCircleSolid />
            )}
          </Heading>
          {!isOpen &&
            cart?.shipping_address &&
            cart?.billing_address &&
            cart?.email &&
            cartApprovalStatus !== ApprovalStatusType.PENDING && (
              <Text>
                <button
                  onClick={handleEdit}
                  className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  data-testid="edit-delivery-button"
                >
                  Edit
                </button>
              </Text>
            )}
        </div>
        {(isOpen || (cart && (cart.shipping_methods?.length ?? 0) > 0)) && (
          <Divider />
        )}
      </div>
      {isOpen ? (
        <div data-testid="delivery-options-container">
          <div className="">
            <RadioGroup value={selectedMethodId} onChange={set}>
              {availableShippingMethods?.map((option) => (
                <div key={option.id}>
                  <RadioGroupOption
                    value={option.id}
                    data-testid="delivery-option-radio"
                    className={clx(
                      "flex items-center justify-between text-small-regular cursor-pointer py-2",
                      {
                        "border-ui-border-interactive":
                          option.id === selectedShippingMethod?.id,
                      }
                    )}
                  >
                    <div className="flex items-center gap-x-4">
                      <Radio
                        checked={option.id === selectedShippingMethod?.id}
                      />
                      <span className="text-base-regular">{option.name}</span>
                    </div>
                    <span className="justify-self-end text-ui-fg-base">
                      {convertToLocale({
                        amount: option.amount!,
                        currency_code: cart?.currency_code,
                      })}
                    </span>
                  </RadioGroupOption>
                  <Divider />
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-y-2 items-end">
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />

            <Button
              size="large"
              className="mt-4"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!cart.shipping_methods?.[0]}
              data-testid="submit-delivery-option-button"
            >
              Next step
            </Button>
          </div>
        </div>
      ) : (
        cart.shipping_methods &&
        cart.shipping_methods?.length > 0 && (
          <div className="text-small-regular pt-2">
            <div className="flex flex-col w-full">
              <Text className="txt-medium text-ui-fg-subtle">
                {selectedShippingMethod?.name}{" "}
                {convertToLocale({
                  amount: selectedShippingMethod?.amount!,
                  currency_code: cart?.currency_code,
                })}
              </Text>
            </div>
          </div>
        )
      )}
    </Container>
  )
}

export default Shipping
