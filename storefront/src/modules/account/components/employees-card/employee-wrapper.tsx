import { retrieveCustomer } from "@/lib/data/customer"
import { listOrders } from "@/lib/data/orders"
import Employee from "@/modules/account/components/employees-card/employee"
import { QueryCompany, QueryEmployee } from "@/types"

const EmployeeWrapper = async ({
  employee,
  company,
}: {
  employee: QueryEmployee
  company: QueryCompany
}) => {
  const customer = await retrieveCustomer()
  const customerOrders = await listOrders()
  const orderIds = customerOrders.map((order) => order.id)

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
