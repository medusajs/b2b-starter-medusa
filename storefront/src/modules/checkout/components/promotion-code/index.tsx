"use client"

import { applyPromotions, submitPromotionForm } from "@/lib/data/cart"
import { getCartApprovalStatus } from "@/lib/util/get-cart-approval-status"
import { convertToLocale } from "@/lib/util/money"
import Trash from "@/modules/common/icons/trash"
import { B2BCart } from "@/types"
import { ChevronDownMini, ChevronUpMini } from "@medusajs/icons"
import { Badge, Heading, Input, Text } from "@medusajs/ui"
import { usePathname } from "next/navigation"
import React, { useActionState } from "react"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"

type PromotionCodeProps = {
  cart: B2BCart
}

const PromotionCode: React.FC<PromotionCodeProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  const isCheckout = pathname.includes("/checkout")

  const { promotions = [] } = cart

  const { isPendingAdminApproval, isPendingSalesManagerApproval } =
    getCartApprovalStatus(cart)

  const isPendingApproval =
    isPendingAdminApproval || isPendingSalesManagerApproval

  const removePromotionCode = async (code: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code
    )

    await applyPromotions(
      validPromotions.filter((p) => p.code === undefined).map((p) => p.code!)
    )
  }

  const addPromotionCode = async (formData: FormData) => {
    const code = formData.get("code")
    if (!code) {
      return
    }
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codes = promotions
      .filter((p) => p.code === undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    await applyPromotions(codes)

    if (input) {
      input.value = ""
    }
  }

  const [message, formAction] = useActionState(submitPromotionForm, null)

  return (
    <div className="w-full bg-white flex flex-col">
      <div className="txt-medium">
        {!isCheckout && !isPendingApproval && (
          <form action={(a) => addPromotionCode(a)} className="w-full mb-5">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="flex gap-x-1 my-2 items-center txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="add-discount-button"
            >
              Enter Promotion Code{" "}
              {isOpen ? <ChevronUpMini /> : <ChevronDownMini />}
            </button>

            {isOpen && (
              <>
                <div className="grid grid-cols-[1fr_auto] w-full gap-x-2">
                  <Input
                    className="w-full"
                    id="promotion-input"
                    name="code"
                    type="text"
                    autoFocus={false}
                    data-testid="discount-input"
                  />
                  <SubmitButton
                    className="w-fit h-8"
                    variant="secondary"
                    data-testid="discount-apply-button"
                  >
                    Apply
                  </SubmitButton>
                </div>

                <ErrorMessage
                  error={message}
                  data-testid="discount-error-message"
                />
              </>
            )}
          </form>
        )}

        {promotions.length > 0 && (
          <div className="w-full flex items-center">
            <div className="flex flex-col w-full">
              <Heading className="txt-medium mb-2">
                Promotion{promotions.length > 1 ? "s" : ""} applied:
              </Heading>

              {promotions.map((promotion) => {
                return (
                  <div
                    key={promotion.id}
                    className="flex items-center justify-between w-full max-w-full mb-2"
                    data-testid="discount-row"
                  >
                    <Text className="flex gap-x-1 items-baseline txt-small-plus w-4/5 pr-1">
                      <span className="truncate" data-testid="discount-code">
                        <Badge
                          color={promotion.is_automatic ? "green" : "blue"}
                          size="small"
                        >
                          {promotion.code}
                        </Badge>{" "}
                        (
                        {promotion.application_method?.value !== undefined &&
                          promotion.application_method.currency_code !==
                            undefined && (
                            <>
                              {promotion.application_method.type ===
                              "percentage"
                                ? `${promotion.application_method.value}%`
                                : convertToLocale({
                                    amount: promotion.application_method.value,
                                    currency_code:
                                      promotion.application_method
                                        .currency_code,
                                  })}
                            </>
                          )}
                        )
                      </span>
                    </Text>
                    {!promotion.is_automatic && !isCheckout && (
                      <button
                        className="flex items-center"
                        onClick={() => {
                          if (!promotion.code) {
                            return
                          }

                          removePromotionCode(promotion.code)
                        }}
                        data-testid="remove-discount-button"
                      >
                        <Trash size={14} />
                        <span className="sr-only">
                          Remove discount code from order
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromotionCode
