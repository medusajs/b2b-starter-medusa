import {
  Avatar,
  Badge,
  Container,
  Heading,
  Table,
  Toaster,
} from "@medusajs/ui";
import { useParams } from "react-router-dom";
import { CompanyCustomerDTO } from "../../../../modules/company/types/common";
import {
  CompanyActionsMenu,
  CompanyCustomersActionsMenu,
} from "../../../components";
import { CompanyCustomerCreateDrawer } from "../../../components/company-customers/company-customers-create-drawer";
import { useCompany } from "../../../hooks";
import { formatAmount } from "../../../utils";

const CompanyDetails = () => {
  const { companyId } = useParams();
  const { data, loading, refetch } = useCompany(companyId, {
    fields:
      "id, name, phone, email, address, city, state, zip, country, currency_code, logo_url, customers.*, customers.customer.*, customers.company.*",
  });

  const company = data?.company;

  return (
    <div className="flex flex-col gap-4">
      <Container className="flex flex-col p-0 overflow-hidden">
        {!loading && (
          <>
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 justify-between">
              <div className="flex items-center gap-2">
                <Avatar
                  src={company?.logo_url}
                  fallback={company?.name?.charAt(0)}
                />
                <Heading className="font-sans font-medium h1-core">
                  {company?.name}
                </Heading>
              </div>
              <CompanyActionsMenu company={company} refetch={refetch} />
            </div>
            <Table>
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
                <Table.Cell>{company?.currency_code?.toUpperCase()}</Table.Cell>
              </Table.Row>
            </Table>
          </>
        )}
      </Container>
      <Container className="flex flex-col p-0 overflow-hidden">
        {!loading && (
          <>
            <div className="flex items-center gap-2 px-6 py-4 justify-between">
              <div className="flex items-center gap-2">
                <Heading className="font-sans font-medium h1-core">
                  Company Employees
                </Heading>
              </div>
              <CompanyCustomerCreateDrawer
                company={company}
                refetch={refetch}
              />
            </div>
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
              {company?.customers && (
                <Table.Body>
                  {company?.customers.map(
                    (companyCustomer: CompanyCustomerDTO) => (
                      <Table.Row
                        key={companyCustomer.id}
                        onClick={() => {
                          window.location.href = `/app/customers/${companyCustomer.customer.id}`;
                        }}
                        className="cursor-pointer"
                      >
                        <Table.Cell className="w-6 h-6 items-center justify-center">
                          <Avatar
                            fallback={companyCustomer.customer.first_name?.charAt(
                              0
                            )}
                          />
                        </Table.Cell>
                        <Table.Cell className="flex w-fit gap-2 items-center">
                          {companyCustomer.customer.first_name}{" "}
                          {companyCustomer.customer.last_name}
                          {companyCustomer.is_admin && (
                            <Badge
                              size="2xsmall"
                              color={
                                companyCustomer.is_admin ? "green" : "grey"
                              }
                            >
                              Admin
                            </Badge>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {companyCustomer.customer.email}
                        </Table.Cell>
                        <Table.Cell>
                          {formatAmount(
                            companyCustomer.spending_limit / 100,
                            company?.currency_code || "USD"
                          )}
                        </Table.Cell>
                        <Table.Cell onClick={(e) => e.stopPropagation()}>
                          <CompanyCustomersActionsMenu
                            company={company}
                            companyCustomer={companyCustomer}
                            refetch={refetch}
                          />
                        </Table.Cell>
                      </Table.Row>
                    )
                  )}
                </Table.Body>
              )}
            </Table>
          </>
        )}
      </Container>
      <Toaster />
    </div>
  );
};

export default CompanyDetails;
