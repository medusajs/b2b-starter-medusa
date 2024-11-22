import {
  Avatar,
  Badge,
  Container,
  Heading,
  Table,
  Toaster,
  Text,
} from "@medusajs/ui";
import { ExclamationCircle } from "@medusajs/icons";
import { useParams } from "react-router-dom";
import { EmployeeDTO } from "../../../../modules/company/types/common";
import { CompanyActionsMenu, EmployeesActionsMenu } from "../../../components";
import { EmployeeCreateDrawer } from "../../../components/employees/employees-create-drawer";
import { useCompany } from "../../../hooks";
import { formatAmount } from "../../../utils";

const CompanyDetails = () => {
  const { companyId } = useParams();
  const { data, loading, refetch } = useCompany(companyId!, {
    fields: "*employees,*employees.customer,*employees.company",
  });

  const company = data?.company;

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Container className="flex flex-col p-0 overflow-hidden">
        {!loading && (
          <>
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 justify-between">
              <div className="flex items-center gap-2">
                <Avatar
                  src={company?.logo_url || undefined}
                  fallback={company?.name?.charAt(0)}
                />
                <Heading className="font-sans font-medium h1-core">
                  {company?.name}
                </Heading>
              </div>
              <CompanyActionsMenu company={company} refetch={refetch} />
            </div>
            <Table>
              <Table.Body>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Phone
                  </Table.Cell>
                  <Table.Cell>{company?.phone}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Email
                  </Table.Cell>
                  <Table.Cell>{company?.email}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Address
                  </Table.Cell>
                  <Table.Cell>{company?.address}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    City
                  </Table.Cell>
                  <Table.Cell>{company?.city}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    State
                  </Table.Cell>
                  <Table.Cell>{company?.state}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Currency
                  </Table.Cell>
                  <Table.Cell>
                    {company?.currency_code?.toUpperCase()}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </>
        )}
      </Container>
      <Container className="flex flex-col p-0 overflow-hidden">
        {!loading && (
          <>
            <div className="flex items-center gap-2 px-6 py-4 justify-between border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Heading className="font-sans font-medium h1-core">
                  Company Employees
                </Heading>
              </div>
              <EmployeeCreateDrawer company={company} refetch={refetch} />
            </div>
            {company?.employees && company?.employees.length > 0 ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                    <Table.HeaderCell>Spending Limit</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {company?.employees.map((employee: EmployeeDTO) => (
                    <Table.Row
                      key={employee.id}
                      onClick={() => {
                        window.location.href = `/app/customers/${
                          employee!.customer!.id
                        }`;
                      }}
                      className="cursor-pointer"
                    >
                      <Table.Cell className="w-6 h-6 items-center justify-center">
                        <Avatar
                          fallback={
                            employee.customer?.first_name?.charAt(0) || ""
                          }
                        />
                      </Table.Cell>
                      <Table.Cell className="flex w-fit gap-2 items-center">
                        {employee.customer?.first_name}{" "}
                        {employee.customer?.last_name}
                        {employee.is_admin && (
                          <Badge
                            size="2xsmall"
                            color={employee.is_admin ? "green" : "grey"}
                          >
                            Admin
                          </Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>{employee.customer?.email}</Table.Cell>
                      <Table.Cell>
                        {formatAmount(
                          employee.spending_limit,
                          company?.currency_code || "USD"
                        )}
                      </Table.Cell>
                      <Table.Cell onClick={(e) => e.stopPropagation()}>
                        <EmployeesActionsMenu
                          company={company}
                          employee={employee}
                          refetch={refetch}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <div className="flex h-[400px] w-full flex-col items-center justify-center gap-y-4">
                <div className="flex flex-col items-center gap-y-3">
                  <ExclamationCircle />
                  <div className="flex flex-col items-center gap-y-1">
                    <Text className="font-medium font-sans txt-compact-small">
                      No records
                    </Text>
                    <Text className="txt-small text-ui-fg-muted">
                      This company doesn't have any employees.
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Container>
      <Toaster />
    </div>
  );
};

export default CompanyDetails;
