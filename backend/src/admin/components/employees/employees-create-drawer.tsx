import { Button, Drawer, toast } from "@medusajs/ui";
import { useState } from "react";
import { CreateEmployeeDTO } from "src/modules/company/types/mutations";
import { useCreateEmployee } from "../../hooks";
import { EmployeesCreateForm } from "./employees-create-form";
import { CompanyDTO } from "src/modules/company/types/common";

export function EmployeeCreateDrawer({
  company,
  refetch,
}: {
  company: CompanyDTO;
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);

  const { mutate, loading, error } = useCreateEmployee(company.id);

  const handleSubmit = async (formData: CreateEmployeeDTO) => {
    await mutate({ ...formData, company_id: company.id }).then(() => {
      setOpen(false);
      refetch();
      toast.success(`Employee ${formData.customer.email} created successfully`);
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
        <EmployeesCreateForm
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          company={company}
        />
      </Drawer.Content>
    </Drawer>
  );
}
