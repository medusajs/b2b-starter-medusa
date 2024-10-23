"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheHeaders, getCacheTag } from "@lib/data/cookies"
import {
  StoreCompanyResponse,
  StoreCreateCompany,
  StoreCreateEmployee,
  StoreEmployeeResponse,
  StoreUpdateCompany,
  StoreUpdateEmployee,
} from "@starter/types"
import { revalidateTag } from "next/cache"

export const retrieveCompany = async (companyId: string) => {
  const company = await sdk.client.fetch<StoreCompanyResponse>(
    `/store/companies/${companyId}?fields=+spending_limit_reset_frequency,*employees.customer,+employees.customer.orders.id`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        ...getCacheHeaders("companies"),
      },
    }
  )

  return company
}

export const createCompany = async (data: StoreCreateCompany) => {
  const { company } = await sdk.client.fetch<StoreCompanyResponse>(
    `/store/companies`,
    {
      method: "POST",
      body: data,
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  revalidateTag(getCacheTag("companies"))

  return company
}

export const updateCompany = async (data: StoreUpdateCompany) => {
  const { id, ...companyData } = data
  const company = await sdk.client.fetch<StoreCompanyResponse>(
    `/store/companies/${id}`,
    {
      method: "POST",
      body: companyData,
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  revalidateTag(getCacheTag("companies"))

  return company
}

export const createEmployee = async (data: StoreCreateEmployee) => {
  const { company_id, ...employeeData } = data

  const employee = await sdk.client.fetch<StoreEmployeeResponse>(
    `/store/companies/${company_id}/employees`,
    {
      method: "POST",
      body: employeeData,
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  revalidateTag(getCacheTag("companies"))

  return employee
}

export const updateEmployee = async (data: StoreUpdateEmployee) => {
  const { id, company_id, ...employeeData } = data
  const employee = await sdk.client.fetch<StoreEmployeeResponse>(
    `/store/companies/${company_id}/employees/${id}`,
    {
      method: "POST",
      body: employeeData,
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  revalidateTag(getCacheTag("companies"))

  return employee
}

export const deleteEmployee = async (companyId: string, employeeId: string) => {
  await sdk.client.fetch(
    `/store/companies/${companyId}/employees/${employeeId}`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  revalidateTag(getCacheTag("companies"))
}
