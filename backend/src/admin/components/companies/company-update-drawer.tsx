import { Drawer, toast } from "@medusajs/ui";
import { AdminUpdateCompany, QueryCompany } from "@starter/types";
import { useUpdateCompany } from "../../hooks";
import { CompanyForm } from "./company-form";

export function CompanyUpdateDrawer({
  company,
  refetch,
  open,
  setOpen,
}: {
  company: QueryCompany;
  refetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { mutate, loading, error } = useUpdateCompany(company.id);

  const {
    created_at,
    updated_at,
    id,
    employees,
    customer_group,
    ...currentData
  } = company;

  const handleSubmit = async (formData: AdminUpdateCompany) => {
    await mutate(formData).then(() => {
      setOpen(false);
      refetch();
      toast.success(`Company ${formData.name} updated successfully`);
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
          loading={loading}
          error={error}
          company={currentData}
        />
      </Drawer.Content>
    </Drawer>
  );
}
