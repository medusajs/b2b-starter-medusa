"use client"

import { HttpTypes } from "@medusajs/types"
import { Container, Heading, Text } from "@medusajs/ui"
import Radio from "@modules/common/components/radio"
import { Company as CompanyType } from "types/global"
import CompanyForm from "../company-form"
import Divider from "@modules/common/components/divider"

const Company = ({
  cart,
}: {
  cart: HttpTypes.StoreCart & { company: CompanyType }
}) => {
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
