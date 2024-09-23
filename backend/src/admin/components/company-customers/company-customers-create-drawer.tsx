import { Button, Drawer, toast } from "@medusajs/ui";
import { useState } from "react";
import { CreateCompanyCustomerDTO } from "src/modules/company/types/mutations";
import { useCreateCompanyCustomer } from "../../hooks";
import { CompanyCustomersForm } from "./company-customers-form";

export function CompanyCustomerCreateDrawer({
  companyId,
  refetch,
}: {
  companyId: string;
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);

  const { mutate, loading, error } = useCreateCompanyCustomer(companyId);

  const handleSubmit = async (formData: CreateCompanyCustomerDTO) => {
    await mutate({ ...formData, company_id: companyId }).then(() => {
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
        <CompanyCustomersForm
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          companyId={companyId}
        />
      </Drawer.Content>
    </Drawer>
  );
}
