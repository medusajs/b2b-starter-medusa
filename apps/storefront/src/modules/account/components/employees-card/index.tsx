import { Container } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import { StoreCompanyResponse } from "@starter/types"
import EmployeeWrapper from "./employee-wrapper"

const EmployeesCard = ({ company }: StoreCompanyResponse) => {
  const { employees } = company

  return (
    <Container className="p-0 overflow-hidden">
      <div className="flex flex-col">
        {employees.map((employee) => (
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
