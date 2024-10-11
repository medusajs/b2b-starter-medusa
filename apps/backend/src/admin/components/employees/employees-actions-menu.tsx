import { EllipsisHorizontal, PencilSquare, Trash } from "@medusajs/icons";
import { DropdownMenu, IconButton, toast } from "@medusajs/ui";
import { useState } from "react";
import { CompanyDTO, EmployeeDTO } from "src/modules/company/types/common";
import { EmployeesUpdateDrawer } from ".";
import { DeletePrompt } from "..";
import { useDeleteEmployee } from "../../hooks";

export const EmployeesActionsMenu = ({
  company,
  employee,
  refetch,
}: {
  company: CompanyDTO;
  employee: EmployeeDTO;
  refetch: () => void;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: mutateDelete, loading: loadingDelete } = useDeleteEmployee(
    employee.company_id,
    employee.id
  );

  const handleDelete = async () => {
    await mutateDelete();
    toast.success(`Employee deleted successfully`);
    refetch();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton variant="transparent">
            <EllipsisHorizontal />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            className="gap-x-2"
            onClick={() => setEditOpen(true)}
          >
            <PencilSquare />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            className="gap-x-2"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <EmployeesUpdateDrawer
        company={company}
        employee={employee}
        refetch={refetch}
        open={editOpen}
        setOpen={setEditOpen}
        toast={toast}
      />
      <DeletePrompt
        handleDelete={handleDelete}
        loading={loadingDelete}
        open={deleteOpen}
        setOpen={setDeleteOpen}
      />
    </>
  );
};
