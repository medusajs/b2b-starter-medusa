"use client"

import { Container, Text, Toaster, toast } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import Button from "@modules/common/components/button"
import Select from "@modules/common/components/native-select"
import {
  ModuleCompanySpendingLimitResetFrequency,
  StoreCompanyResponse,
  StoreUpdateCompany,
} from "@starter/types"
import { currencySymbolMap } from "@lib/constants"
import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { updateCompany } from "@lib/data/companies"

const CompanyCard = ({
  company,
  regions,
}: StoreCompanyResponse & { regions: HttpTypes.StoreRegion[] }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { updated_at, created_at, employees, ...companyUpdateData } = company

  const [companyData, setCompanyData] = useState(
    companyUpdateData as StoreUpdateCompany
  )

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateCompany(companyData).catch(() => {
      toast.error("Error updating company")
    })
    setIsSaving(false)
    setIsEditing(false)

    toast.success("Company updated")
  }

  const currenciesInRegions = Array.from(
    new Set(regions.map((region) => region.currency_code))
  )

  const countriesInRegions = Array.from(
    new Set(
      regions.flatMap((region) => region.countries).map((country) => country)
    )
  )

  return (
    <div className="h-fit transition-all duration-300 ease-in-out">
      <Container className="p-0 overflow-hidden ">
        {isEditing ? (
          <form
            className="grid grid-cols-2 gap-4 p-4 border-b border-neutral-200"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSave()
              }
            }}
          >
            <div className="flex flex-col gap-y-2">
              <Text className="font-medium text-neutral-950">Company Name</Text>
              <Input
                label="Company Name"
                name="name"
                value={companyData.name}
                onChange={(e) =>
                  setCompanyData({ ...companyData, name: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Text className="font-medium text-neutral-950">Email</Text>
              <Input
                label="Email"
                name="email"
                value={companyData.email}
                onChange={(e) =>
                  setCompanyData({ ...companyData, email: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Text className="font-medium text-neutral-950">Phone</Text>
              <Input
                label="Phone"
                name="phone"
                value={companyData.phone}
                onChange={(e) =>
                  setCompanyData({ ...companyData, phone: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Text className="font-medium text-neutral-950">Address</Text>
              <Input
                label="Address"
                name="address"
                value={companyData.address || ""}
                onChange={(e) =>
                  setCompanyData({ ...companyData, address: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Text className="font-medium text-neutral-950">City</Text>
              <Input
                label="City"
                name="city"
                value={companyData.city || ""}
                onChange={(e) =>
                  setCompanyData({ ...companyData, city: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Text className="font-medium text-neutral-950">State</Text>
              <Input
                label="State"
                name="state"
                value={companyData.state || ""}
                onChange={(e) =>
                  setCompanyData({ ...companyData, state: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Text className="font-medium text-neutral-950">Zip</Text>
              <Input
                label="Zip"
                name="zip"
                value={companyData.zip || ""}
                onChange={(e) =>
                  setCompanyData({ ...companyData, zip: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Text className="font-medium text-neutral-950">Country</Text>
              <Select
                name="country"
                value={companyData.country || ""}
                onChange={(e) =>
                  setCompanyData({ ...companyData, country: e.target.value })
                }
              >
                {countriesInRegions.map(
                  (country) =>
                    country && (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    )
                )}
              </Select>
            </div>
            <div className="flex flex-col gap-y-2">
              <Text className="font-medium text-neutral-950">Currency</Text>
              <Select
                name="currency_code"
                value={companyData.currency_code || ""}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    currency_code: e.target.value as string,
                  })
                }
              >
                {currenciesInRegions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency.toUpperCase()} ({currencySymbolMap[currency]})
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-y-2">
              <Text className="font-medium text-neutral-950">
                Spending Limit Reset Frequency
              </Text>
              <Select
                name="spending_limit_reset_frequency"
                value={companyData.spending_limit_reset_frequency}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    spending_limit_reset_frequency: e.target
                      .value as ModuleCompanySpendingLimitResetFrequency,
                  })
                }
              >
                {Object.values(ModuleCompanySpendingLimitResetFrequency).map(
                  (value) => (
                    <option key={value} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  )
                )}
              </Select>
            </div>
          </form>
        ) : (
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
                {company.address}, {company.city}, {company.state},{" "}
                {company.zip}, {company.country?.toUpperCase()}
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
                {company.spending_limit_reset_frequency
                  ?.charAt(0)
                  .toUpperCase() +
                  company.spending_limit_reset_frequency?.slice(1)}
              </Text>
            </div>
          </div>
        )}
        <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
              >
                Save
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </Container>
      <Toaster />
    </div>
  )
}

export default CompanyCard
