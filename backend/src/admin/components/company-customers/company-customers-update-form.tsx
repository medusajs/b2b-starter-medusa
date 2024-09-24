import {
  Button,
  Container,
  Drawer,
  Input,
  Label,
  Switch,
  Table,
  Text,
} from "@medusajs/ui";
import { useState } from "react";
import { CompanyCustomerDTO } from "src/modules/company/types/common";
import { UpdateCompanyCustomerDTO } from "src/modules/company/types/mutations";

export function CompanyCustomerUpdateForm({
  companyCustomer,
  handleSubmit,
  loading,
  error,
}: {
  companyCustomer?: CompanyCustomerDTO;
  handleSubmit: (data: UpdateCompanyCustomerDTO) => Promise<void>;
  loading: boolean;
  error: Error | null;
}) {
  const [formData, setFormData] = useState<{
    spending_limit: number;
    is_admin: boolean;
  }>({
    spending_limit: companyCustomer?.spending_limit / 100 || 0,
    is_admin: companyCustomer?.is_admin || false,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const spendingLimit = formData.spending_limit
      ? formData.spending_limit * 100
      : undefined;

    const data = {
      ...formData,
      id: companyCustomer?.id,
      spending_limit: spendingLimit,
      raw_spending_limit: {
        value: spendingLimit,
      },
    };

    handleSubmit(data);
  };

  return (
    <form onSubmit={onSubmit}>
      <Drawer.Body className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 mb-4">
            <Container className="p-0 overflow-hidden">
              <Table>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Name
                  </Table.Cell>
                  <Table.Cell>
                    {companyCustomer?.customer.first_name}{" "}
                    {companyCustomer?.customer.last_name}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Email
                  </Table.Cell>
                  <Table.Cell>{companyCustomer?.customer.email}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Phone
                  </Table.Cell>
                  <Table.Cell>{companyCustomer?.customer.phone}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="font-medium font-sans txt-compact-small">
                    Company
                  </Table.Cell>
                  <Table.Cell>{companyCustomer?.company.name}</Table.Cell>
                </Table.Row>
              </Table>
            </Container>
            <a
              href={`/app/customers/${companyCustomer?.customer.id}/edit`}
              className="txt-compact-small text-ui-fg-interactive hover:text-ui-fg-interactive-hover self-end"
            >
              Edit customer details
            </a>
          </div>
          <div className="flex gap-8 w-full justify-between">
            <div className="flex flex-col gap-3 w-1/2 justify-center">
              <Label size="xsmall" className="txt-compact-small font-medium">
                Spending Limit (
                {companyCustomer?.company.currency_code.toUpperCase()})
              </Label>
              <Input
                type="number"
                name="spending_limit"
                value={formData.spending_limit ? formData.spending_limit : ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    spending_limit: parseInt(e.target.value),
                  })
                }
                placeholder="1000"
              />
            </div>
            <div className="flex flex-col gap-3 w-1/2">
              <Label size="xsmall" className="txt-compact-small font-medium">
                Enable to grant admin access
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  name="is_admin"
                  checked={formData.is_admin}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_admin: checked })
                  }
                />
                <Label size="xsmall">Is Admin</Label>
              </div>
            </div>
          </div>
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button variant="secondary">Cancel</Button>
        </Drawer.Close>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
        {error && <Text className="text-red-500">{error.message}</Text>}
      </Drawer.Footer>
    </form>
  );
}
