const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export const createCompany = async (company: Record<string, unknown>) => {
  const headers = {
    "Content-Type": "application/json",
  } as Record<string, string>

  if (PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] = PUBLISHABLE_KEY as string
  }

  const response = await fetch(BACKEND_URL + "/store/companies", {
    method: "POST",
    headers,
    body: JSON.stringify(company),
  })

  if (!response.ok) {
    throw new Error("Failed to create company")
  }

  return response.json()
}

export const createEmployee = async (
  companyId: string,
  employee: Record<string, unknown>
) => {
  const headers = {
    "Content-Type": "application/json",
  } as Record<string, string>

  if (PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] = PUBLISHABLE_KEY as string
  }

  employee.spending_limit = employee.spending_limit || 0
  employee.raw_spending_limit = employee.raw_spending_limit || {
    value: employee.spending_limit,
    precision: 2,
  }

  const response = await fetch(
    BACKEND_URL + "/store/companies/" + companyId + "/employees",
    {
      method: "POST",
      headers,
      body: JSON.stringify(employee),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to create employee")
  }

  return response.json()
}
