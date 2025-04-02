import { retrieveCustomer } from "@/lib/data/customer"
import EmployeeWrapper from "@/modules/account/components/employees-card/employee-wrapper"
import { QueryCompany } from "@/types"
import { Container } from "@medusajs/ui"

const EmployeesCard = async ({ company }: { company: QueryCompany }) => {
  const { employees } = company
  const customer = await retrieveCustomer()

  return (
    <Container className="p-0 overflow-hidden">
      <div className="flex flex-col">
        {employees &&
          employees
            .sort((a) => (a.customer.email === customer?.email ? -1 : 1))
            .map((employee) => (
              <EmployeeWrapper
                key={employee.id}
                employee={employee}
                company={company}
              />
            ))}
      </div>
    </Container>
  )
}

export default EmployeesCard
