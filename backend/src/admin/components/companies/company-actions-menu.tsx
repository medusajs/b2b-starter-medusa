import { EllipsisHorizontal, PencilSquare, Trash } from "@medusajs/icons";
import { DropdownMenu, IconButton, toast } from "@medusajs/ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyDTO } from "src/modules/company/types/common";
import { useDeleteCompany } from "../../hooks/companies";
import { DeletePrompt } from "../common/delete-prompt";
import { CompanyUpdateDrawer } from "./";

export const CompanyActionsMenu = ({
  company,
  refetch,
}: {
  company: CompanyDTO;
  refetch: () => void;
}) => {
  const [editOpen, setEditOpen] = useState(false);
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
      <CompanyUpdateDrawer
        company={company}
        refetch={refetch}
        open={editOpen}
        setOpen={setEditOpen}
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
