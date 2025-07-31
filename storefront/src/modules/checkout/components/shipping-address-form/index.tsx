import { listCompanyAddresses } from "@/lib/data/companies"
import AddressSelect from "@/modules/checkout/components/address-select"
import CountrySelect from "@/modules/checkout/components/country-select"
import GoogleAddressAutocomplete from "@/modules/common/components/google-address-autocomplete"
import Input from "@/modules/common/components/input"
import { B2BCart, B2BCustomer, CompanyAddress } from "@/types"
import { HttpTypes } from "@medusajs/types"
import { Checkbox, Container, Label } from "@medusajs/ui"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"

const ShippingAddressForm = ({
  customer,
  cart,
}: {
  customer: B2BCustomer | null
  cart: B2BCart | null
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": "",
    "shipping_address.last_name": "",
    "shipping_address.address_1": "",
    "shipping_address.company": cart?.company?.name || "",
    "shipping_address.postal_code": "",
    "shipping_address.city": "",
    "shipping_address.country_code": "",
    "shipping_address.province": "",
    "shipping_address.phone": "",
    "shipping_address.label": "",
    email: "",
  })

  const [companyAddresses, setCompanyAddresses] = useState<CompanyAddress[]>([])
  const [saveToCompany, setSaveToCompany] = useState(false)

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if company has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      companyAddresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [companyAddresses, countriesInRegion]
  )

  // Load company addresses
  useEffect(() => {
    const loadCompanyAddresses = async () => {
      if (customer?.employee?.company_id) {
        try {
          const addresses = await listCompanyAddresses()
          setCompanyAddresses(addresses)

          // Auto-select default address
          const defaultAddress = addresses.find((a) => a.is_default)
          if (
            defaultAddress &&
            (!cart?.shipping_address || !cart.shipping_address.address_1)
          ) {
            setFormAddress(defaultAddress as any)
          }
        } catch (error) {
          console.error("Failed to load company addresses:", error)
        }
      }
    }

    loadCompanyAddresses()
  }, [customer?.employee?.company_id, cart?.shipping_address])

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name?.toString() || 
          (address as any)?.firstName?.toString() || "",
        "shipping_address.last_name": address?.last_name?.toString() || 
          (address as any)?.lastName?.toString() || "",
        "shipping_address.address_1": address?.address_1?.toString() || "",
        "shipping_address.company": address?.company?.toString() || 
          (address as any)?.companyName?.toString() || "",
        "shipping_address.postal_code": address?.postal_code?.toString() || "",
        "shipping_address.city": address?.city?.toString() || "",
        "shipping_address.country_code":
          address?.country_code?.toString() || "",
        "shipping_address.province": address?.province?.toString() || "",
        "shipping_address.phone": address?.phone?.toString() || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email.toString() || "",
      }))
  }

  useEffect(() => {
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address)
    }
  }, [cart])

  useEffect(() => {
    if (!saveToCompany) {
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.label": "",
      }))
    }
  }, [saveToCompany])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleGoogleAddressSelect = (address: {
    address_1: string
    address_2: string
    city: string
    postal_code: string
    country_code: string
    province: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      "shipping_address.address_1": address.address_1 || "",
      "shipping_address.city": address.city || "",
      "shipping_address.postal_code": address.postal_code || "",
      "shipping_address.country_code": address.country_code || "",
      "shipping_address.province": address.province || "",
    }))
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            Do you want to use one of your company&apos;s saved addresses?
          </p>
          <AddressSelect
            addresses={addressesInRegion}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <Input
          label="Phone"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          required
          data-testid="shipping-phone-input"
        />
        <Input
          label="Company name"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
          colSpan={2}
        />
        <div className="col-span-2">
          <GoogleAddressAutocomplete
            label="Address"
            name="address_search"
            required
            value={formData["shipping_address.address_1"]}
            onAddressSelect={handleGoogleAddressSelect}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                "shipping_address.address_1": e.target.value,
              }))
            }}
            data-testid="shipping-address-input"
            regions={
              cart?.region?.countries
                ?.map((c) => c.iso_2)
                .filter(Boolean) as string[]
            }
          />
          <input
            type="hidden"
            name="shipping_address.address_1"
            value={formData["shipping_address.address_1"]}
          />
        </div>
        <Input
          label="Postal code"
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-postal-code-input"
          colSpan={2}
        />
        <div className="grid small:grid-cols-3 grid-cols-2 gap-4 col-span-2">
          <Input
            label="City"
            name="shipping_address.city"
            autoComplete="address-level2"
            value={formData["shipping_address.city"]}
            onChange={handleChange}
            required
            data-testid="shipping-city-input"
          />
          <Input
            label="Province"
            name="shipping_address.province"
            autoComplete="address-level1"
            value={formData["shipping_address.province"]}
            onChange={handleChange}
            data-testid="shipping-province-input"
          />
          <CountrySelect
            className="col-span-2"
            name="shipping_address.country_code"
            autoComplete="country"
            region={cart?.region}
            value={formData["shipping_address.country_code"]}
            onChange={handleChange}
            required
            data-testid="shipping-country-select"
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-x-3 mb-4">
            <Checkbox
              id="save-to-company"
              checked={saveToCompany}
              onCheckedChange={() => setSaveToCompany(!saveToCompany)}
              aria-placeholder=" "
            />
            <Label htmlFor="save-to-company">Save this address</Label>
          </div>
          {saveToCompany && (
            <Input
              label="Address Label"
              name="shipping_address.label"
              value={formData["shipping_address.label"]}
              onChange={handleChange}
              data-testid="shipping-label-input"
              required={saveToCompany}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default ShippingAddressForm
