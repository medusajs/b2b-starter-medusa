import { EllipsisHorizontal, PencilSquare } from "@medusajs/icons";
import { DropdownMenu, IconButton } from "@medusajs/ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuoteDTO } from "src/modules/quote/types/common";

export const QuoteDetailsActionsMenu = ({
  quote,
  refetch,
}: {
  quote: QuoteDTO;
  refetch: () => void;
}) => {
  const [editOpen, setEditOpen] = useState(false);

  const navigate = useNavigate();

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
            onClick={() => navigate(`manage`)}
          >
            <PencilSquare />
            Manage
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
};