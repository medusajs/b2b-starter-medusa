"use client"

import { RadioGroup } from "@headlessui/react"
import { getCartApprovalStatus } from "@lib/util/get-cart-approval-status"
import { clx } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Radio from "@modules/common/components/radio"
import { ApprovalStatusType } from "@starter/types/approval"
import { useState } from "react"
import { B2BCart } from "types/global"

const CompanyForm = ({ cart }: { cart: B2BCart }) => {
  const [selectedOption, setSelectedOption] = useState("company")

  const { isPendingApproval } = getCartApprovalStatus(cart)

  if (!cart?.company) {
    return null
  }

  return (
    <div>
      <RadioGroup
        value={selectedOption}
        onChange={(value) => {
          !isPendingApproval && setSelectedOption(value)
        }}
        className="flex flex-col gap-y-2"
      >
        <RadioGroup.Option value="company">
          <div
            className={clx(
              "flex items-center gap-x-4 text-sm text-neutral-600 cursor-pointer",
              isPendingApproval && "opacity-50 cursor-default"
            )}
          >
            <Radio
              checked={selectedOption === "company"}
              data-testid="company-form-company-radio"
              disabled={isPendingApproval}
            />
            <span>Order on behalf of {cart?.company.name}</span>
          </div>
        </RadioGroup.Option>
        <Divider />
        <RadioGroup.Option value="custom">
          <div
            className={clx(
              "flex items-center gap-x-4 text-sm text-neutral-600 cursor-pointer",
              isPendingApproval && "opacity-50 cursor-default"
            )}
            onClick={() => {
              !isPendingApproval && setSelectedOption("custom")
            }}
          >
            <Radio
              checked={selectedOption === "custom"}
              data-testid="company-form-custom-radio"
              disabled={isPendingApproval}
            />
            <span>Custom checkout</span>
          </div>
        </RadioGroup.Option>
      </RadioGroup>
    </div>
  )
}

export default CompanyForm
