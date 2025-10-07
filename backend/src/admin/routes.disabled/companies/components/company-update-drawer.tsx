import { Drawer, toast } from "@medusajs/ui";
import { AdminUpdateCompany, QueryCompany } from "../../../../types";
import { useUpdateCompany } from "../../../hooks/api";
import { CompanyForm } from "./company-form";

export function CompanyUpdateDrawer({
  company,
  open,
  setOpen,
}: {
  company: QueryCompany;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { mutateAsync, isPending, error } = useUpdateCompany(company.id);

  const {
    created_at,
    updated_at,
    id,
    employees,
    customer_group,
    approval_settings,
    ...currentData
  } = company;

  const handleSubmit = async (formData: AdminUpdateCompany) => {
    await mutateAsync(formData, {
      onSuccess: async () => {
        setOpen(false);
        toast.success(`Company ${formData.name} updated successfully`);
      },
      onError: (error) => {
        toast.error("Failed to update company");
      },
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content className="z-50">
        <Drawer.Header>
          <Drawer.Title>Edit Company</Drawer.Title>
        </Drawer.Header>

        <CompanyForm
          handleSubmit={handleSubmit}
          loading={isPending}
          error={error}
          company={currentData}
        />
      </Drawer.Content>
    </Drawer>
  );
}
