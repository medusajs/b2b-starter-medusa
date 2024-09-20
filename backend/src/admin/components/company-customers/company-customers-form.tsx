import { Button, Drawer, Input, Label, Text, Switch } from "@medusajs/ui";
import { useState } from "react";
import { CompanyCustomerDTO } from "src/modules/company/types/common";
import { CreateCompanyCustomerDTO } from "src/modules/company/types/mutations";

export function CompanyCustomersForm({
  companyCustomer,
  handleSubmit,
  loading,
  error,
  companyId,
}: {
  companyCustomer?: Partial<CompanyCustomerDTO>;
  handleSubmit: (data: CreateCompanyCustomerDTO) => Promise<void>;
  loading: boolean;
  error: Error | null;
  companyId: string;
}) {
  const [formData, setFormData] = useState<
    Partial<CreateCompanyCustomerDTO> & { company_id: string }
  >(
    companyCustomer
      ? { ...companyCustomer, company_id: companyId }
      : {
          company_id: companyId,
        }
  );

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

    const data = {
      ...formData,
      spending_limit: formData.spending_limit * 100,
    };

    handleSubmit(data);
  };

  return (
    <form onSubmit={onSubmit}>
      <Drawer.Body className="p-4">
        <div className="flex flex-col gap-2">
          <Label size="xsmall">First Name</Label>
          <Input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="John"
          />
          <Label size="xsmall">Last Name</Label>
          <Input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Doe"
          />
          <Label size="xsmall">Email</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john.doe@example.com"
          />
          <Label size="xsmall">Spending Limit</Label>
          <Input
            type="number"
            name="spending_limit"
            value={formData.spending_limit}
            onChange={handleChange}
            placeholder="1000"
          />
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
      </Drawer.Body>
      <Drawer.Footer>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Company Customer"}
        </Button>
        {error && <Text className="text-red-500">{error.message}</Text>}
      </Drawer.Footer>
    </form>
  );
}
