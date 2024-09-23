import { Drawer, toast as toastType } from "@medusajs/ui";
import { CompanyCustomerDTO } from "src/modules/company/types/common";
import { UpdateCompanyCustomerDTO } from "src/modules/company/types/mutations";
import { useUpdateCompanyCustomer } from "../../hooks";
import { CompanyCustomersForm } from "./company-customers-form";

export function CompanyCustomerEditDrawer({
  companyCustomer,
  refetch,
  open,
  setOpen,
  toast,
}: {
  companyCustomer: CompanyCustomerDTO;
  refetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  toast: typeof toastType;
}) {
  const { mutate, loading, error } = useUpdateCompanyCustomer(
    companyCustomer.company_id,
    companyCustomer.id
  );

  const { created_at, updated_at, id, company, ...currentData } =
    companyCustomer;

  const handleSubmit = async (formData: UpdateCompanyCustomerDTO) => {
    await mutate(formData).then(() => {
      setOpen(false);
      toast.success("Company customer updated successfully");
      refetch();
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content className="z-50">
        <Drawer.Header>
          <Drawer.Title>Edit Company</Drawer.Title>
        </Drawer.Header>

        <CompanyCustomersForm
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          companyCustomer={currentData}
          companyId={companyCustomer.company_id}
        />
      </Drawer.Content>
    </Drawer>
  );
}
