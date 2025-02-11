import { Drawer, toast as toastType } from "@medusajs/ui";
import { EmployeesUpdateForm } from ".";
import {
  AdminUpdateEmployee,
  QueryCompany,
  QueryEmployee,
} from "../../../../../types";
import { useUpdateEmployee } from "../../../../hooks/api";

export function EmployeesUpdateDrawer({
  company,
  employee,
  open,
  setOpen,
  toast,
}: {
  company: QueryCompany;
  employee: QueryEmployee;
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
