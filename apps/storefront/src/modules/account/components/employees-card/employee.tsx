"use client"

import { currencySymbolMap } from "@lib/constants"
import { updateEmployee } from "@lib/data/companies"
import {
  getOrderTotalInSpendWindow,
  getSpendWindow,
} from "@lib/util/check-spending-limit"
import { HttpTypes } from "@medusajs/types"
import { CurrencyInput, Text, Toaster, toast } from "@medusajs/ui"
import { formatAmount } from "@modules/common/components/amount-cell"
import Button from "@modules/common/components/button"
import NativeSelect from "@modules/common/components/native-select"
import {
  QueryCompany,
  QueryEmployee,
  StoreUpdateEmployee,
} from "@starter/types"
import { useState } from "react"

const Employee = ({
  employee,
  company,
  orders,
}: {
  employee: QueryEmployee
  company: QueryCompany
  orders: HttpTypes.StoreOrder[]
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [employeeData, setEmployeeData] = useState({
    id: employee.id,
    company_id: employee.company_id,
    spending_limit: (employee.spending_limit / 100).toString(),
    is_admin: employee.is_admin,
  })

  const handleSubmit = async () => {
    const updateData = {
      ...employeeData,
      spending_limit: parseFloat(employeeData.spending_limit) * 100,
    }

    setIsSaving(true)
    await updateEmployee(updateData as StoreUpdateEmployee).catch(() => {
      toast.error("Error updating employee")
    })

    setIsSaving(false)
    setIsEditing(false)

    toast.success("Employee updated")
  }

  const spent = getOrderTotalInSpendWindow(orders, getSpendWindow(company)) || 0
  const amountSpent = formatAmount(spent, company.currency_code!)

  return (
    <div className="flex flex-col">
      <div className="flex justify-between p-4 border-b border-neutral-200">
        <div className="flex flex-col">
          <Text className=" text-neutral-950 font-medium">
            {employee.customer.first_name} {employee.customer.last_name}{" "}
            {employee.is_admin && (
              <span className="text-blue-500">(Admin)</span>
            )}
          </Text>
          <div className="flex gap-x-2">
            <Text className=" text-neutral-500">{employee.customer.email}</Text>
            <Text className=" text-neutral-500">{" • "}</Text>
            <Text className=" text-neutral-500">{employee.customer.phone}</Text>
            <Text className=" text-neutral-500">{" • "}</Text>
            <Text className=" text-neutral-500">
              {amountSpent} /{" "}
              {employee.spending_limit > 0
                ? formatAmount(employee.spending_limit, company.currency_code!)
                : "No limit"}{" "}
              spent
            </Text>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
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
                onClick={handleSubmit}
                isLoading={isSaving}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary">Remove</Button>
              <Button
                variant="secondary"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
      {isEditing && (
        <form
          className="bg-neutral-50 p-4 grid grid-cols-2 gap-4 border-b border-neutral-200"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSubmit()
            }
          }}
        >
          <div className="flex flex-col gap-y-2">
            <Text className=" text-neutral-950 font-medium">
              Spending Limit
            </Text>
            <CurrencyInput
              symbol={currencySymbolMap[company.currency_code!]}
              code={company.currency_code!}
              className="bg-white rounded-full"
              name="spending_limit"
              value={employeeData.spending_limit}
              onChange={(e) => {
                setEmployeeData({
                  ...employeeData,
                  spending_limit: e.target.value.replace(/[^0-9.]/g, ""),
                })
              }}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Text className=" text-neutral-950 font-medium">Permissions</Text>
            <NativeSelect
              className="bg-white"
              name="permissions"
              value={employeeData.is_admin ? "true" : "false"}
              onChange={(e) => {
                setEmployeeData({
                  ...employeeData,
                  is_admin: e.target.value === "true",
                })
              }}
            >
              <option value="true">Admin</option>
              <option value="false">Employee</option>
            </NativeSelect>
          </div>
        </form>
      )}
      <Toaster />
    </div>
  )
}

export default Employee
