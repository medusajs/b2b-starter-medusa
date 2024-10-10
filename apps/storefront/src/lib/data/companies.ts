import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheHeaders, getCacheTag } from "@lib/data/cookies"
import {
  StoreCreateEmployee,
  StoreCompanyResponse,
  StoreCreateCompany,
  StoreUpdateCompany,
  StoreUpdateEmployee,
  StoreEmployeeResponse,
} from "@starter/types"
import { revalidateTag } from "next/cache"

export const retrieveCompany = async (companyId: string) => {
  const company = await sdk.client.fetch<StoreCompanyResponse>(
    `/store/companies/${companyId}?fields=+spending_limit_reset_frequency,+employees.customer.*,+employees.customer.orders.id`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        ...getCacheHeaders("companies"),
      },
    }
  )

  console.log("company", company)

  return company
}

export const createCompany = async (data: StoreCreateCompany) => {
  const company = await sdk.client.fetch<StoreCompanyResponse>(
    `/store/companies`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: getAuthHeaders(),
    }
  )

  revalidateTag(getCacheTag("companies"))

  return company
}

export const updateCompany = async (data: StoreUpdateCompany) => {
  const company = await sdk.client.fetch<StoreCompanyResponse>(
    `/store/companies/${data.id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
      headers: getAuthHeaders(),
    }
  )

  revalidateTag(getCacheTag("companies"))

  return company
}

export const createEmployee = async (data: StoreCreateEmployee) => {
  const employee = await sdk.client.fetch<StoreEmployeeResponse>(
    `/store/companies/${data.company_id}/employees`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: getAuthHeaders(),
    }
  )

  revalidateTag(getCacheTag("companies"))

  return employee
}

export const updateEmployee = async (data: StoreUpdateEmployee) => {
  const employee = await sdk.client.fetch<StoreEmployeeResponse>(
    `/store/companies/${data.company_id}/employees/${data.id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
      headers: getAuthHeaders(),
    }
  )

  revalidateTag(getCacheTag("companies"))

  return employee
}

export const deleteEmployee = async (companyId: string, employeeId: string) => {
  const response = await sdk.client.fetch<StoreEmployeeResponse>(
    `/store/companies/${companyId}/employees/${employeeId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  )

  revalidateTag(getCacheTag("companies"))

  return response
}
