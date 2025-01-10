import { Drawer, toast as toastType } from "@medusajs/ui";
import {
  AdminUpdateEmployee,
  QueryCompany,
  QueryEmployee,
} from "@starter/types";
import { EmployeesUpdateForm } from ".";
import { useUpdateEmployee } from "../../../../hooks/api";

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
  const { mutateAsync, isPending, error } = useUpdateEmployee(
    employee.company_id,
    employee.id
  );

  const handleSubmit = async (formData: AdminUpdateEmployee) => {
    await mutateAsync(formData, {
      onSuccess: () => {
        setOpen(false);
        refetch();
        toast.success(
          `Employee ${employee?.customer?.email} updated successfully`
        );
      },
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
          loading={isPending}
          error={error}
          employee={employee}
          company={company}
        />
      </Drawer.Content>
    </Drawer>
  );
}
