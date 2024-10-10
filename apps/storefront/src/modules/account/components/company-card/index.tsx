import { Container, Text } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import { StoreCompanyResponse } from "@starter/types"
import { currencySymbolMap } from "@lib/constants"

const CompanyCard = ({ company }: StoreCompanyResponse) => {
  return (
    <Container className="p-0 overflow-hidden">
      <div className="grid grid-cols-2 gap-4 p-4 border-b border-neutral-200">
        <div className="flex flex-col gap-y-2">
          <Text className="font-medium text-neutral-950">Company Name</Text>
          <Text className=" text-neutral-500">{company.name}</Text>
        </div>
        <div className="flex flex-col gap-y-2">
          <Text className="font-medium text-neutral-950">Email</Text>
          <Text className=" text-neutral-500">{company.email}</Text>
        </div>
        <div className="flex flex-col gap-y-2">
          <Text className="font-medium text-neutral-950">Phone</Text>
          <Text className=" text-neutral-500">{company.phone}</Text>
        </div>
        <div className="flex flex-col gap-y-2">
          <Text className="font-medium text-neutral-950">Address</Text>
          <Text className=" text-neutral-500">
            {company.address}, {company.city}, {company.state}, {company.zip},{" "}
            {company.country?.toUpperCase()}
          </Text>
        </div>
        <div className="flex flex-col gap-y-2">
          <Text className="font-medium text-neutral-950">Currency</Text>
          <Text className=" text-neutral-500">
            {company.currency_code?.toUpperCase()} (
            {currencySymbolMap[company.currency_code!]})
          </Text>
        </div>
        <div className="flex flex-col gap-y-2">
          <Text className="font-medium text-neutral-950">
            Spending Limit Reset Frequency
          </Text>
          <Text className=" text-neutral-500">
            {company.spending_limit_reset_frequency?.charAt(0).toUpperCase() +
              company.spending_limit_reset_frequency?.slice(1)}
          </Text>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
        <Button variant="secondary">Edit</Button>
      </div>
    </Container>
  )
}

export default CompanyCard
