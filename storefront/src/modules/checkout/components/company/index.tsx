"use client"

import CompanyForm from "@/modules/checkout/components/company-form"
import Divider from "@/modules/common/components/divider"
import { B2BCart } from "@/types"
import { Container, Heading } from "@medusajs/ui"

const Company = ({ cart }: { cart: B2BCart }) => {
  return (
    <Container>
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-row items-center justify-between w-full">
          <Heading level="h2" className="text-xl">
            Company
          </Heading>
        </div>
        <Divider />
        <div className="flex flex-col gap-y-2">
          <form>
            <CompanyForm cart={cart} />
          </form>
        </div>
      </div>
    </Container>
  )
}

export default Company
