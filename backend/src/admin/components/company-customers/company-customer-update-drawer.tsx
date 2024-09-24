import { Drawer, toast as toastType } from "@medusajs/ui";
import { CompanyCustomerDTO } from "src/modules/company/types/common";
import { UpdateCompanyCustomerDTO } from "src/modules/company/types/mutations";
import { useUpdateCompanyCustomer } from "../../hooks";
import { CompanyCustomerUpdateForm } from "./";

export function CompanyCustomerUpdateDrawer({
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

  const handleSubmit = async (formData: UpdateCompanyCustomerDTO) => {
    await mutate(formData).then(() => {
      setOpen(false);
      refetch();
      toast.success(`Employee ${formData.customer.email} updated successfully`);
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content className="z-50">
        <Drawer.Header>
          <Drawer.Title>Edit Employee</Drawer.Title>
        </Drawer.Header>

        <CompanyCustomerUpdateForm
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          companyCustomer={companyCustomer}
        />
      </Drawer.Content>
    </Drawer>
  );
}
