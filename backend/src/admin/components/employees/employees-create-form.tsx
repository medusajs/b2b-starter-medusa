import {
  Button,
  CurrencyInput,
  Drawer,
  Input,
  Label,
  Text,
} from "@medusajs/ui";
import { useState } from "react";
import { currencySymbolMap } from "../../utils";
import { CompanyDTO } from "src/modules/company/types/common";
import {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
} from "src/modules/company/types/mutations";
import { CoolSwitch } from "../common";

export function EmployeesCreateForm({
  handleSubmit,
  loading,
  error,
  company,
}: {
  handleSubmit: (data: CreateEmployeeDTO | UpdateEmployeeDTO) => Promise<void>;
  loading: boolean;
  error: Error | null;
  company: CompanyDTO;
}) {
  const [formData, setFormData] = useState<
    Partial<CreateEmployeeDTO> & { company_id: string }
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
      <Drawer.Body className="flex flex-col p-4 gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="h2-core">Details</h2>
          <div className="flex flex-col gap-2">
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
          </div>
          <div className="flex flex-col gap-2">
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
          </div>
          <div className="flex flex-col gap-2">
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
          </div>
          <div className="flex flex-col gap-2">
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
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="h2-core">Permissions</h2>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Spending Limit ({company.currency_code.toUpperCase()})
            </Label>
            <CurrencyInput
              symbol={currencySymbolMap[company.currency_code]}
              code={company.currency_code}
              type="text"
              name="spending_limit"
              value={formData.spending_limit ? formData.spending_limit : ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  spending_limit: parseInt(e.target.value) || 0,
                })
              }
              placeholder="1000"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Admin Access
            </Label>
            <CoolSwitch
              fieldName="is_admin"
              label="Is Admin"
              description="Enable to grant admin access"
              checked={formData.is_admin}
              onChange={(checked) =>
                setFormData({ ...formData, is_admin: checked })
              }
              tooltip="Admins can manage the company's details and employee permissions."
            />
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
