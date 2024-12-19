import { Drawer, toast as toastType } from "@medusajs/ui";
import { QueryCompany, QueryEmployee } from "@starter/types";
import { UpdateEmployeeDTO } from "src/modules/company/types/mutations";
import { EmployeesUpdateForm } from ".";
import { useUpdateEmployee } from "../../hooks";

export function EmployeesUpdateDrawer({
  company,
  employee,
  refetch,
  open,
  setOpen,
  toast,
}: {
  company: QueryCompany;
  employee: QueryEmployee;
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
