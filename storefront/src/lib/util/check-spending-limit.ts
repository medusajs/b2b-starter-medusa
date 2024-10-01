import { HttpTypes } from "@medusajs/types"
import { Customer, Company, SpendingLimitResetFrequency } from "types/global"

function getSpendWindow(company: Company): { start: Date; end: Date } {
  const now = new Date()
  const resetFrequency = company.spending_limit_reset_frequency

  switch (resetFrequency) {
    case SpendingLimitResetFrequency.never:
      return { start: new Date(0), end: now }
    case SpendingLimitResetFrequency.daily:
      return { start: new Date(now.setHours(0, 0, 0, 0)), end: now }
    case SpendingLimitResetFrequency.weekly:
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // Set to Sunday
      startOfWeek.setHours(0, 0, 0, 0) // Set to beginning of the day
      return { start: startOfWeek, end: now }
    case SpendingLimitResetFrequency.monthly:
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now }
    case SpendingLimitResetFrequency.yearly:
      return { start: new Date(now.getFullYear(), 0, 1), end: now }
    default:
      return { start: new Date(0), end: now }
  }
}

function getOrderTotalInSpendWindow(
  customer: Customer,
  spendWindow: { start: Date; end: Date }
): number {
  return customer.orders.reduce((acc, order) => {
    const orderDate = new Date(order.created_at)
    if (orderDate >= spendWindow.start && orderDate <= spendWindow.end) {
      return acc + order.total
    }
    return acc
  }, 0)
}

export function checkSpendingLimit(
  cart: HttpTypes.StoreCart | null,
  customer: Customer | null
) {
  if (
    !cart ||
    !customer ||
    !customer.employee?.spending_limit ||
    !customer.employee?.company
  ) {
    return false
  }
  const spendingLimit = customer?.employee?.spending_limit / 100
  const spendWindow = getSpendWindow(customer.employee?.company)
  const spent = getOrderTotalInSpendWindow(customer, spendWindow)

  return spent > spendingLimit
}
