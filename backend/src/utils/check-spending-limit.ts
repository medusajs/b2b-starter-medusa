import { HttpTypes } from "@medusajs/types";
import {
  ModuleCompanySpendingLimitResetFrequency,
  QueryCompany,
  QueryEmployee,
} from "../types";

export function getSpendWindow(company: QueryCompany): {
  start: Date;
  end: Date;
} {
  if (!company) {
    return { start: new Date(0), end: new Date() };
  }

  const now = new Date();
  const resetFrequency = company.spending_limit_reset_frequency;

  switch (resetFrequency) {
    case ModuleCompanySpendingLimitResetFrequency.NEVER:
      return { start: new Date(0), end: now }; // Never resets
    case ModuleCompanySpendingLimitResetFrequency.DAILY:
      return { start: new Date(now.setHours(0, 0, 0, 0)), end: now }; // Window is the current day up to now
    case ModuleCompanySpendingLimitResetFrequency.WEEKLY:
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return { start: startOfWeek, end: now }; // Window is the current week up to now, starting on Sunday
    case ModuleCompanySpendingLimitResetFrequency.MONTHLY:
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      }; // Window is the current month up to now
    case ModuleCompanySpendingLimitResetFrequency.YEARLY:
      return { start: new Date(now.getFullYear(), 0, 1), end: now }; // Window is the current year up to now
    default:
      return { start: new Date(0), end: now }; // Default to never resetting
  }
}

export function getOrderTotalInSpendWindow(
  orders: HttpTypes.StoreOrder[],
  spendWindow: { start: Date; end: Date }
): number {
  return (
    orders.reduce((acc, order) => {
      const orderDate = new Date(order.created_at);
      if (orderDate >= spendWindow.start && orderDate <= spendWindow.end) {
        return acc + order.total;
      }
      return acc;
    }, 0) || 0
  );
}

export function checkSpendingLimit(
  cart: HttpTypes.StoreCart | null,
  customer:
    | (HttpTypes.StoreCustomer & {
        employee: QueryEmployee;
        orders: HttpTypes.StoreOrder[];
      })
    | null
) {
  if (!cart || !customer || !customer.employee) {
    return false;
  }

  if (
    !customer?.employee?.spending_limit ||
    customer?.employee?.spending_limit === 0
  ) {
    return false;
  }

  const spendingLimit = customer.employee.spending_limit;
  const spendWindow = getSpendWindow(customer.employee.company);
  const spent = getOrderTotalInSpendWindow(customer.orders || [], spendWindow);

  return spent + cart.total > spendingLimit;
}
