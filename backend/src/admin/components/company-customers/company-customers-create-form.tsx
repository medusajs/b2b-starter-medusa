import { Button, Drawer, Input, Label, Text, Switch } from "@medusajs/ui";
import { useState } from "react";
import {
  CompanyCustomerDTO,
  CompanyDTO,
} from "src/modules/company/types/common";
import {
  CreateCompanyCustomerDTO,
  UpdateCompanyCustomerDTO,
} from "src/modules/company/types/mutations";

export function CompanyCustomersCreateForm({
  handleSubmit,
  loading,
  error,
  company,
}: {
  companyCustomer?: Partial<CompanyCustomerDTO>;
  handleSubmit: (
    data: CreateCompanyCustomerDTO | UpdateCompanyCustomerDTO
  ) => Promise<void>;
  loading: boolean;
  error: Error | null;
  company: CompanyDTO;
}) {
  const [formData, setFormData] = useState<
    Partial<CreateCompanyCustomerDTO> & { company_id: string }
  >({
    company_id: company.id,
    company_name: company.name,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setFormData({ ...formData, [e.target.name]: value });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const spendingLimit = formData.spending_limit
      ? formData.spending_limit * 100
      : undefined;

    const data = {
      ...formData,
      spending_limit: spendingLimit,
      raw_spending_limit: {
        value: spendingLimit,
        precision: 20,
      },
    };

    console.log({ data });

    handleSubmit(data);
  };

  return (
    <form onSubmit={onSubmit}>
      <Drawer.Body className="p-4">
        <div className="flex flex-col gap-3">
          <Label size="xsmall" className="txt-compact-small font-medium">
            First Name
          </Label>
          <Input
            type="text"
            name="first_name"
            value={formData.customer?.first_name}
            onChange={handleChange}
            placeholder="John"
          />
          <Label size="xsmall" className="txt-compact-small font-medium">
            Last Name
          </Label>
          <Input
            type="text"
            name="last_name"
            value={formData.customer?.last_name}
            onChange={handleChange}
            placeholder="Doe"
          />
          <Label size="xsmall" className="txt-compact-small font-medium">
            Email
          </Label>
          <Input
            type="email"
            name="email"
            value={formData.customer?.email}
            onChange={handleChange}
            placeholder="john.doe@example.com"
          />
          <Label size="xsmall" className="txt-compact-small font-medium">
            Phone
          </Label>
          <Input
            type="text"
            name="phone"
            value={formData.customer?.phone}
            onChange={handleChange}
            placeholder="0612345678"
          />
          <div className="flex gap-8 w-full justify-between">
            <div className="flex flex-col gap-2 w-1/2 justify-center">
              <Label size="xsmall" className="txt-compact-small font-medium">
                Spending Limit ({company?.currency_code.toUpperCase()})
              </Label>
              <Input
                type="number"
                name="spending_limit"
                value={formData.spending_limit ? formData.spending_limit : ""}
                onChange={handleChange}
                placeholder="1000"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
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
