import { EllipsisHorizontal, PencilSquare, Trash } from "@medusajs/icons";
import { DropdownMenu, IconButton, toast } from "@medusajs/ui";
import { useState } from "react";
import {
  CompanyCustomerDTO,
  CompanyDTO,
} from "src/modules/company/types/common";
import { CompanyCustomerUpdateDrawer } from ".";
import { DeletePrompt } from "../";
import { useDeleteCompanyCustomer } from "../../hooks";

export const CompanyCustomersActionsMenu = ({
  company,
  companyCustomer,
  refetch,
}: {
  company: CompanyDTO;
  companyCustomer: CompanyCustomerDTO;
  refetch: () => void;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: mutateDelete, loading: loadingDelete } =
    useDeleteCompanyCustomer(companyCustomer.company_id, companyCustomer.id);

  const handleDelete = async () => {
    await mutateDelete();
    toast.success(
      `Employee ${companyCustomer.customer.email} deleted successfully`
    );
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
      <CompanyCustomerUpdateDrawer
        company={company}
        companyCustomer={companyCustomer}
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
