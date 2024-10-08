import { Drawer, toast as toastType } from "@medusajs/ui";
import { EmployeeDTO, CompanyDTO } from "src/modules/company/types/common";
import { UpdateEmployeeDTO } from "src/modules/company/types/mutations";
import { useUpdateEmployee } from "../../hooks";
import { EmployeesUpdateForm } from ".";

export function EmployeesUpdateDrawer({
  company,
  employee,
  refetch,
  open,
  setOpen,
  toast,
}: {
  company: CompanyDTO;
  employee: EmployeeDTO;
  refetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  toast: typeof toastType;
}) {
  const { mutate, loading, error } = useUpdateEmployee(
    employee.company_id,
    employee.id
  );

  const handleSubmit = async (formData: UpdateEmployeeDTO) => {
    await mutate(formData).then(() => {
      setOpen(false);
      refetch();
      toast.success(
        `Employee ${employee?.customer?.email} updated successfully`
      );
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content className="z-50 overflow-auto">
        <Drawer.Header>
          <Drawer.Title>Edit Employee</Drawer.Title>
        </Drawer.Header>

        <EmployeesUpdateForm
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          employee={employee}
          company={company}
        />
      </Drawer.Content>
    </Drawer>
  );
}
