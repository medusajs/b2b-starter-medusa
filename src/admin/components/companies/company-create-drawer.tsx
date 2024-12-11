import { Button, Drawer } from "@medusajs/ui";
import { useState } from "react";
import { CreateCompanyDTO } from "src/modules/company/types/mutations";
import { useCreateCompany } from "../../hooks";
import { CompanyForm } from "./company-form";

export function CompanyCreateDrawer({ refetch }: { refetch: () => void }) {
  const [open, setOpen] = useState(false);

  const { mutate, loading, error } = useCreateCompany();

  const handleSubmit = async (formData: CreateCompanyDTO) => {
    await mutate(formData).then(() => setOpen(false));
    refetch();
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary" size="small">
          Create
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Create Company</Drawer.Title>
        </Drawer.Header>
        <CompanyForm
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </Drawer.Content>
    </Drawer>
  );
}
