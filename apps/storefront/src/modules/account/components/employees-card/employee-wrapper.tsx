import { listOrders } from "@lib/data/orders"
import { HttpTypes } from "@medusajs/types"
import { QueryCompany, QueryEmployee } from "@starter/types"
import Employee from "./employee"
import { getCustomer } from "@lib/data/customer"

const EmployeeWrapper = async ({
  employee,
  company,
}: {
  employee: QueryEmployee
  company: QueryCompany
}) => {
  const customer = await getCustomer()
  // @ts-expect-error
  const orderIds = employee.customer.orders.map((order) => order.id)

  const orders =
    orderIds.length > 0
      ? await listOrders(0, 0, {
          id: orderIds,
        }).catch(() => [])
      : []

  return (
    <Employee
      employee={employee}
      company={company}
      orders={orders}
      customer={customer}
    />
  )
}

export default EmployeeWrapper
