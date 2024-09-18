import {
  EllipsisHorizontal,
  Spinner,
  Trash,
  PencilSquare,
} from "@medusajs/icons";
import { DropdownMenu, IconButton, useToggleState } from "@medusajs/ui";
import { CompanyDTO } from "src/modules/company/types/common";
import { useDeleteCompany } from "../hooks/companies";
import { CompanyEditDrawer } from "./";
import { useState } from "react";

export const CompanyActionsMenu = ({
  company,
  refetch,
}: {
  company: CompanyDTO;
  refetch: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const { mutate: mutateDelete, loading: loadingDelete } = useDeleteCompany(
    company.id
  );
  const handleDelete = async () => {
    await mutateDelete();
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
          <DropdownMenu.Item className="gap-x-2" onClick={() => setOpen(true)}>
            <PencilSquare />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            className="gap-x-2"
            onClick={async () => await handleDelete()}
          >
            {loadingDelete ? (
              <Spinner className="text-ui-fg-subtle animate-spin" />
            ) : (
              <Trash className="text-ui-fg-subtle" />
            )}
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <CompanyEditDrawer
        company={company}
        refetch={refetch}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
};
