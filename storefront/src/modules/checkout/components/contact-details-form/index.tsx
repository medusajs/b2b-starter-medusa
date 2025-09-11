import Input from "@/modules/common/components/input"
import { B2BCart, B2BCustomer } from "@/types"
import React, { useEffect, useMemo, useState } from "react"

const ContactDetailsForm = ({
  customer,
  cart,
}: {
  customer: B2BCustomer | null
  cart: B2BCart | null
}) => {
  // Get the email from customer first, then cart customer, then cart email, then empty string
  const getInitialEmail = () => {
    console.log("🔍 DEBUG - Customer object:", customer)
    console.log("🔍 DEBUG - Customer email:", customer?.email)
    console.log("🔍 DEBUG - Cart customer:", cart?.customer)
    console.log("🔍 DEBUG - Cart customer email:", cart?.customer?.email)
    console.log("🔍 DEBUG - Cart email:", cart?.email)
    
    const email = customer?.email || cart?.customer?.email || cart?.email || ""
    console.log("🔍 DEBUG - Final email:", email)
    return email
  }

  const [formData, setFormData] = useState<Record<string, string>>({
    email: getInitialEmail(),
    invoice_recipient: "",
    cost_center: "",
    requisition_number: "",
    door_code: "",
    notes: "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // Force update email when customer or cart changes
  useEffect(() => {
    const newEmail = customer?.email || cart?.customer?.email || cart?.email || ""
    console.log("🔄 DEBUG - Updating email to:", newEmail)
    setFormData((prevState) => ({
      ...prevState,
      email: newEmail,
      invoice_recipient: cart?.metadata?.invoice_recipient?.toString() || prevState.invoice_recipient || "",
      cost_center: cart?.metadata?.cost_center?.toString() || prevState.cost_center || "",
      requisition_number: cart?.metadata?.requisition_number?.toString() || prevState.requisition_number || "",
      door_code: cart?.metadata?.door_code?.toString() || prevState.door_code || "",
      notes: cart?.metadata?.notes?.toString() || prevState.notes || "",
    }))
  }, [customer?.email, cart?.customer?.email, cart?.email, cart?.metadata])

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

  return (
    <div className="flex flex-col small:grid small:grid-cols-2 gap-4">
      <Input
        key={`email-${customer?.email || 'no-customer'}`}
        label="Email"
        name="email"
        autoComplete="email"
        value={formData["email"]}
        onChange={handleChange}
        required
        data-testid="email-input"
        className="small:col-span-2"
      />
      <Input
        label="Invoice recipient"
        name="invoice_recipient"
        autoComplete="family-name"
        value={formData["invoice_recipient"]}
        onChange={handleChange}
        data-testid="invoice-recipient-input"
      />
      <Input
        label="Cost center"
        name="cost_center"
        value={formData["cost_center"]}
        onChange={handleChange}
        data-testid="cost-center-input"
      />
      <Input
        label="Requisition number"
        name="requisition_number"
        value={formData["requisition_number"]}
        onChange={handleChange}
        data-testid="requisition-number-input"
      />
      <Input
        label="Door code/goods mark"
        name="door_code"
        value={formData["door_code"]}
        onChange={handleChange}
        data-testid="door-code-input"
      />
      <div className="col-span-2">
        <Input
          label="Notes"
          name="notes"
          value={formData["notes"]}
          onChange={handleChange}
          data-testid="notes-input"
          className="small:col-span-2"
        />
        <label className="text-xs italic text-neutral-500">
          The note will only appear on the invoice and order confirmation and
          will not be read by the merchant.
        </label>
      </div>
    </div>
  )
}

export default ContactDetailsForm
