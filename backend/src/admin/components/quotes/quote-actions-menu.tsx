import { EllipsisHorizontal, PencilSquare } from "@medusajs/icons";
import { DropdownMenu, IconButton } from "@medusajs/ui";
import { QuoteDTO } from "src/modules/quote/types/common";

export const QuoteActionsMenu = ({ quote }: { quote: QuoteDTO }) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton variant="transparent">
            <EllipsisHorizontal />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item className="gap-x-2" onClick={() => {}}>
            <PencilSquare />
            Manage
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
};
