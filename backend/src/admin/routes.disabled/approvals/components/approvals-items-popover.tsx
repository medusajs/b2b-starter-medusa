import { MagnifyingGlass } from "@medusajs/icons";
import { Popover, Table, Text } from "@medusajs/ui";
import { formatAmount } from "../../../utils/format-amount";

const ItemsPopover = ({
  items,
  currencyCode,
}: {
  items: Record<string, any>[];
  currencyCode: any;
}) => {
  return (
    <Popover>
      <Popover.Trigger className="flex text-right items-center gap-1 hover:cursor-pointer">
        <span className="underline underline-offset-4 min-w-14 ">
          {items?.length} item
          {items?.length !== 1 ? "s" : ""}
        </span>
        <MagnifyingGlass />
      </Popover.Trigger>
      <Popover.Content className="p-0 mr-10">
        <div className="max-h-1/3 overflow-y-auto">
          <Table>
            <Table.Body>
              {items?.map((item) => (
                <Table.Row key={item.id} className="py-2 hover:bg-transparent">
                  <Table.Cell>
                    <div className="w-10 h-10 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.thumbnail}
                        alt={item.product_title}
                        className="h-10 object-contain mr-4"
                      />
                    </div>
                  </Table.Cell>
                  <Table.Cell className="py-2">
                    <Text className="font-medium truncate max-w-60">
                      {item.product_title}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item.variant_title}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item.quantity} x{" "}
                      {formatAmount(item.unit_price, currencyCode)}
                      <br />
                      <Text className="font-medium">
                        Item total:{" "}
                        {formatAmount(
                          item.quantity * item.unit_price,
                          currencyCode
                        )}
                      </Text>
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Popover.Content>
    </Popover>
  );
};

export default ItemsPopover;
