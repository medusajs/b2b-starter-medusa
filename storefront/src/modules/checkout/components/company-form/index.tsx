"use client"

import { RadioGroup } from "@headlessui/react"
import Divider from "@modules/common/components/divider"
import Radio from "@modules/common/components/radio"
import { useState } from "react"
import { B2BCart } from "types/global"

const CompanyForm = ({ cart }: { cart: B2BCart }) => {
  const [selectedOption, setSelectedOption] = useState("company")

  if (!cart?.company) {
    return null
  }

  return (
    <div>
      <RadioGroup
        value={selectedOption}
        onChange={setSelectedOption}
        className="flex flex-col gap-y-2"
      >
        <RadioGroup.Option value="company">
          <div className="flex items-center gap-x-4 text-sm text-neutral-600 cursor-pointer">
            <Radio
              checked={selectedOption === "company"}
              data-testid="company-form-company-radio"
            />
            <span>Order on behalf of {cart?.company.name}</span>
          </div>
        </RadioGroup.Option>
        <Divider />
        <RadioGroup.Option value="custom">
          <div className="flex items-center gap-x-4 text-sm text-neutral-600 cursor-pointer">
            <Radio
              checked={selectedOption === "custom"}
              data-testid="company-form-custom-radio"
            />
            <span>Custom checkout</span>
          </div>
        </RadioGroup.Option>
      </RadioGroup>
    </div>
  )
}

export default CompanyForm
