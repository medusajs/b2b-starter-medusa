import { Avatar, Container, Heading, Table } from "@medusajs/ui";
import { useParams } from "react-router-dom";
import { CompanyCustomerDTO } from "../../../../modules/company/types/common";
import { CompanyActionsMenu } from "../../../components";
import { CompanyCustomerCreateDrawer } from "../../../components/company-customers/company-customers-create-drawer";
import { useCompanies, useCompanyCustomers } from "../../../hooks";
import { formatAmount } from "../../../utils";

const CompanyDetails = () => {
  const { companyId } = useParams();
  const { data, loading, refetch } = useCompanies({ id: companyId });
  const {
    data: companyCustomersData,
    loading: companyCustomersLoading,
    refetch: companyCustomersRefetch,
  } = useCompanyCustomers(companyId);

  const company = data?.companies[0];
  const companyCustomers = companyCustomersData?.companyCustomers;

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
              <CompanyActionsMenu
                company={company}
                refetch={companyCustomersRefetch}
              />
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
            </Table>
          </>
        )}
      </Container>
      <Container className="flex flex-col p-0 overflow-hidden">
        {!companyCustomersLoading && (
          <>
            <div className="flex items-center gap-2 px-6 py-4 justify-between">
              <div className="flex items-center gap-2">
                <Heading className="font-sans font-medium h1-core">
                  Company Customers
                </Heading>
              </div>
              <CompanyCustomerCreateDrawer
                companyId={companyId}
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
                  <Table.HeaderCell>Is Admin</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              {companyCustomers && (
                <Table.Body>
                  {companyCustomers.map(
                    ({
                      spending_limit,
                      is_admin,
                      customer,
                    }: CompanyCustomerDTO) => (
                      <Table.Row key={customer.id}>
                        <Table.Cell className="w-6 h-6 items-center justify-center">
                          <Avatar fallback={customer.first_name?.charAt(0)} />
                        </Table.Cell>
                        <Table.Cell>
                          {customer.first_name} {customer.last_name}
                        </Table.Cell>
                        <Table.Cell>{customer.email}</Table.Cell>
                        <Table.Cell>
                          {formatAmount(spending_limit / 100, "USD")}
                        </Table.Cell>
                        <Table.Cell>{is_admin ? "Yes" : "No"}</Table.Cell>
                      </Table.Row>
                    )
                  )}
                </Table.Body>
              )}
            </Table>
          </>
        )}
      </Container>
    </div>
  );
};

export default CompanyDetails;
