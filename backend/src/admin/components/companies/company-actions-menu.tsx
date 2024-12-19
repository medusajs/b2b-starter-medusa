import { EllipsisHorizontal, Link, PencilSquare, Trash } from "@medusajs/icons";
import { DropdownMenu, IconButton, toast } from "@medusajs/ui";
import { QueryCompany } from "@starter/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteCompany } from "../../hooks/companies";
import { DeletePrompt } from "../common/delete-prompt";
import { CompanyUpdateDrawer } from "./";
import { CompanyCustomerGroupDrawer } from "./company-customer-group-drawer";
import { HttpTypes } from "@medusajs/framework/types";

export const CompanyActionsMenu = ({
  company,
  refetch,
  customerGroups,
}: {
  company: QueryCompany;
  refetch: () => void;
  customerGroups: HttpTypes.AdminCustomerGroup[];
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [customerGroupOpen, setCustomerGroupOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: mutateDelete, loading: loadingDelete } = useDeleteCompany(
    company.id
  );

  const navigate = useNavigate();
  const handleDelete = async () => {
    await mutateDelete();
    navigate("/companies");
    refetch();
    toast.success(`Company ${company.name} deleted successfully`);
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
            Edit details
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="gap-x-2"
            onClick={() => setCustomerGroupOpen(true)}
          >
            <Link />
            Manage customer group
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
      <CompanyUpdateDrawer
        company={company}
        refetch={refetch}
        open={editOpen}
        setOpen={setEditOpen}
      />
      <CompanyCustomerGroupDrawer
        company={company}
        customerGroups={customerGroups}
        refetch={refetch}
        open={customerGroupOpen}
        setOpen={setCustomerGroupOpen}
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
