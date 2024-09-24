import { Button, Drawer, toast } from "@medusajs/ui";
import { useState } from "react";
import { CreateCompanyCustomerDTO } from "src/modules/company/types/mutations";
import { useCreateCompanyCustomer } from "../../hooks";
import { CompanyCustomersCreateForm } from "./company-customers-create-form";
import { CompanyDTO } from "src/modules/company/types/common";

export function CompanyCustomerCreateDrawer({
  company,
  refetch,
}: {
  company: CompanyDTO;
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);

  const { mutate, loading, error } = useCreateCompanyCustomer(company.id);

  const handleSubmit = async (formData: CreateCompanyCustomerDTO) => {
    await mutate({ ...formData, company_id: company.id }).then(() => {
      setOpen(false);
      refetch();
      toast.success("Company customer created successfully");
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary" size="small">
          Add
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Add Company Customer</Drawer.Title>
        </Drawer.Header>
        <CompanyCustomersCreateForm
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          company={company}
        />
      </Drawer.Content>
    </Drawer>
  );
}
