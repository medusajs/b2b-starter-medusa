import { Drawer, toast } from "@medusajs/ui";
import { AdminUpdateCompany, QueryCompany } from "@starter/types";
import { useCompany, useUpdateCompany } from "../../../hooks/api";
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
  const { mutate, isPending, error } = useUpdateCompany(company.id);

  const { refetch: refetchCompany } = useCompany(company.id, {
    fields:
      "*employees,*employees.customer,*employees.company,*customer_group,*approval_settings",
  });

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
    await mutate(formData, {
      onSuccess: async () => {
        setOpen(false);
        await refetchCompany();
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
