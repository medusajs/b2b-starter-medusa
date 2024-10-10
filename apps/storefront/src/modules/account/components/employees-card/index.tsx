import { listOrders } from "@lib/data/orders"
import {
  getOrderTotalInSpendWindow,
  getSpendWindow,
} from "@lib/util/check-spending-limit"
import { Container, Text } from "@medusajs/ui"
import { formatAmount } from "@modules/common/components/amount-cell"
import Button from "@modules/common/components/button"
import {
  QueryCompany,
  QueryEmployee,
  StoreCompanyResponse,
} from "@starter/types"

const EmployeeCard = async ({
  employee,
  company,
}: {
  employee: QueryEmployee
  company: QueryCompany
}) => {
  const orders = await listOrders(0, 0, {
    // @ts-expect-error
    id: employee.customer.orders.map((order) => order.id),
  })

  const spent = getOrderTotalInSpendWindow(orders, getSpendWindow(company)) || 0
  const amountSpent = formatAmount(spent, company.currency_code!)

  return (
    <div className="flex justify-between">
      <div className="flex flex-col">
        <Text className=" text-neutral-950 font-medium">
          {employee.customer.first_name} {employee.customer.last_name}{" "}
          {employee.is_admin && <span className="text-blue-500">(Admin)</span>}
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
        <Button variant="secondary">Edit</Button>
        <Button variant="secondary">Delete</Button>
      </div>
    </div>
  )
}

const EmployeesCard = ({ company }: StoreCompanyResponse) => {
  const { employees } = company

  return (
    <Container className="p-0 overflow-hidden">
      <div className="flex flex-col gap-y-4 p-4 border-b border-neutral-200">
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            company={company}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
        <Button variant="secondary">Edit</Button>
      </div>
    </Container>
  )
}

export default EmployeesCard
