import React, { useState, ChangeEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useCreateFulfillment,
  useGetOrder,
  useShippingOptions,
  useStockLocation,
} from "../../../hooks/api/order";
import {
  Container,
  Table,
  Text,
  Button,
  Select,
  Input,
  Label,
} from "@medusajs/ui";
import FulfilledItem from "../components/single-order/fulfilled-item";
import { HttpTypes } from "@medusajs/types";
import { currencySymbolMap } from "../../../utils/currency-symbol-map";

export const SingleOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const fields =
    "id,status,created_at,canceled_at,email,display_id,currency_code,metadata,total,item_total,shipping_subtotal,subtotal,discount_total,discount_subtotal,shipping_total,shipping_tax_total,tax_total,refundable_total,order_change,*customer,*items,*items.variant,*items.variant.product,*items.variant.options,+items.variant.manage_inventory,*items.variant.inventory_items.inventory,+items.variant.inventory_items.required_quantity,+summary,*shipping_address,*billing_address,*sales_channel,*promotion,*shipping_methods,*fulfillments,+fulfillments.shipping_option.service_zone.fulfillment_set.type,*fulfillments.items,*fulfillments.labels,*fulfillments.labels,*payment_collections,*payment_collections.payments,*payment_collections.payments.refunds,*payment_collections.payments.refunds.refund_reason,region.automatic_taxes";
  const {
    order,
    isLoading,
    refetch: refetchOrder,
  } = useGetOrder(id!, { fields });
  const { data: stockLocations } = useStockLocation();
  const { data: shippingOptions } = useShippingOptions();
  const {
    mutate: createFulfillment,
    isSuccess,
    isPending: isFulfilling,
  } = useCreateFulfillment();

  useEffect(() => {
    if (isSuccess) {
      refetchOrder();
      setIsSelecting(false);
      setSelectedMap({});
    }
  }, [isSuccess]);

  // console.log(fulfillmentResponse, "fulfillmentResponse");

  // console.log("stockLocations", stockLocations);
  // console.log("shippingOptions", shippingOptions);
  // console.log("order", order);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  // const [trackingNumber, setTrackingNumber] = useState<string>("");
  // const [trackingUrl, setTrackingUrl] = useState<string>("");
  // const [trackingLabel, setTrackingLabel] = useState<string>("");
  const [shippingAmount, setShippingAmount] = useState<number>(0);

  if (isLoading) {
    return (
      <Container className="py-8">
        <Text>Loading…</Text>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-8">
        <Text>No order found with ID: {id}</Text>
      </Container>
    );
  }

  // Unfulfilled items
  const unfulfilledItems =
    order?.items.filter((i) => i?.detail?.fulfilled_quantity < i.quantity) ||
    [];

  // Fulfillments array
  const fulfillments = order?.fulfillments || [];

  // When “Fulfill Items” is clicked, pre-populate selectedMap and enter selection mode
  const handleStartSelecting = () => {
    const initialMap: Record<string, number> = {};
    unfulfilledItems.forEach((item) => {
      initialMap[item.id] = item.quantity - item?.detail?.fulfilled_quantity;
    });
    setSelectedMap(initialMap);
    setIsSelecting(true);
  };

  // Cancel selection: clear map, leave selection mode
  const handleCancelSelecting = () => {
    setIsSelecting(false);
    setSelectedMap({});
  };

  // Toggle single row’s checkbox
  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setSelectedMap((prev) => {
      const newMap = { ...prev };
      if (!checked) {
        delete newMap[itemId];
      } else {
        // checked, default quantity = original quantity
        const orig = unfulfilledItems.find((i) => i.id === itemId);
        newMap[itemId] = orig
          ? orig.quantity - orig?.detail?.fulfilled_quantity
          : 1;
      }
      return newMap;
    });
  };

  // When edits quantity for a checked row
  const handleQuantityChange = (
    itemId: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value;
    const asNum = parseInt(raw, 10);
    if (!isNaN(asNum) && asNum > 0) {
      setSelectedMap((prev) => ({
        ...prev,
        [itemId]: asNum,
      }));
    }
  };

  const getLocationIdByName = (name: string) => {
    const location = stockLocations?.stock_locations?.find(
      (location) => location.name === name
    );
    return location?.id;
  };

  const getShippingIdByName = (name: string) => {
    const location = shippingOptions?.shipping_options?.find(
      (option) => option.name === name
    );
    return location?.id;
  };

  // handle fulfillment
  const handleFulfillSelected = () => {
    const location_id: any = getLocationIdByName(selectedLocationId) || null;
    const shipping_option_id = getShippingIdByName(selectedShippingId) || null;
    const items: any = Object.entries(selectedMap).map(([itemId, qty]) => ({
      id: itemId,
      quantity: qty,
    }));
    const payload: HttpTypes.AdminCreateFulfillment = {
      location_id,
      shipping_option_id,
      items,
      metadata: {
        shipping_amount: shippingAmount,
      },
    };
    createFulfillment({ id: order.id, data: payload });
  };

  return (
    <>
      <Container className="mb-8">
        <div className="flex justify-between items-start w-full mb-4">
          <Text size="large" weight="plus">
            Unfulfilled Items
          </Text>
          {unfulfilledItems.length === 0 || isSelecting ? null : (
            <Button size="small" onClick={handleStartSelecting}>
              Fulfill Items
            </Button>
          )}
        </div>

        {unfulfilledItems.length > 0 ? (
          <Table>
            <Table.Header>
              <Table.Row>
                {isSelecting && <Table.HeaderCell />} {/* for checkboxes */}
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>SKU</Table.HeaderCell>
                <Table.HeaderCell>Quantity</Table.HeaderCell>
                <Table.HeaderCell>Price</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {unfulfilledItems.map((item, index) => {
                const isChecked = item?.id in selectedMap;
                const currentQty = selectedMap[item?.id] || 1;

                return (
                  <Table.Row key={index}>
                    {isSelecting && (
                      <Table.Cell>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handleCheckboxChange(item?.id, e.target.checked)
                          }
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </Table.Cell>
                    )}

                    <Table.Cell>
                      <Text>{item?.title}</Text>
                    </Table.Cell>

                    <Table.Cell>
                      <Text>{item?.variant?.sku || "N/A"}</Text>
                    </Table.Cell>

                    <Table.Cell>
                      {isSelecting && isChecked ? (
                        <input
                          type="number"
                          min={1}
                          max={
                            item?.quantity - item?.detail?.fulfilled_quantity
                          }
                          value={currentQty}
                          onChange={(e) => handleQuantityChange(item.id, e)}
                          className="w-16 border border-gray-300 rounded px-1 py-0.5 text-sm"
                        />
                      ) : (
                        <Text>
                          {item?.quantity - item?.detail?.fulfilled_quantity}
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Text>
                        {currencySymbolMap[order?.currency_code] || "$"}
                        {item?.total}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        ) : (
          <div className="px-6 py-4 w-full justify-center items-center">
            <Text color="muted">No unfulfilled item.</Text>
          </div>
        )}

        {isSelecting && (
          <div className="grid grid-cols-2 gap-4">
            <div className=" py-4 flex flex-col gap-4">
              <Label className="flex flex-col gap-1">
                Shipping Location
                <span className="text-sm text-ui-fg-muted">
                  Choose which location you want to fulfill items from.
                </span>
                <Select
                  onValueChange={setSelectedLocationId}
                  value={selectedLocationId}
                >
                  <Select.Trigger className="w-60 h-8 border rounded px-2 flex items-center justify-between">
                    <Select.Value placeholder="Choose a Location" />
                  </Select.Trigger>

                  <Select.Content>
                    {stockLocations?.stock_locations.map((option) => (
                      <Select.Item key={option.id} value={option.name}>
                        {option.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Label>

              <Label className="flex flex-col gap-1">
                Shipping Method
                <span className="text-sm text-ui-fg-muted">
                  Choose a different shipping method from the one customer
                  selected.
                </span>
                <Select
                  onValueChange={setSelectedShippingId}
                  value={selectedShippingId}
                >
                  <Select.Trigger className="w-60 h-8 border rounded px-2 flex items-center justify-between">
                    <Select.Value placeholder="Select Shipping Method" />
                  </Select.Trigger>

                  <Select.Content>
                    {shippingOptions?.shipping_options.map((option) => (
                      <Select.Item key={option?.id} value={option?.name}>
                        {option?.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Label>
              <Label className="flex flex-col gap-1">
                Shipping Cost
                <span className="text-sm text-ui-fg-muted">
                  Enter a custom shipping cost.
                </span>
                <Input
                  type="number"
                  value={shippingAmount}
                  onChange={(e: any) => setShippingAmount(e.target.value)}
                  placeholder="Shipping Cost"
                  className="w-60"
                />
              </Label>
            </div>
            <div className=" py-4 flex flex-col justify-end gap-4">
              {/* <Label className="flex flex-col gap-1">
            Tracking number
              <span className="text-sm text-ui-fg-muted">
                Enter a tracking number.
              </span>
              <Input
                type="text"
                value={trackingNumber}
                onChange={(e: any) => setTrackingNumber(e.target.value)}
                placeholder="Tracking Number"
                className="w-60"
              />
            </Label>

            <Label className="flex flex-col gap-1">
            Tracking url
              <span className="text-sm text-ui-fg-muted">
                Enter a tracking url.
              </span>
             <Input
                type="text"
                value={trackingUrl}
                onChange={(e: any) => setTrackingUrl(e.target.value)}
                placeholder="Tracking Url"
                className="w-60"
              />
            </Label>
            <Label className="flex flex-col gap-1">
            Tracking Label
              <span className="text-sm text-ui-fg-muted">
                Enter a tracking label.
              </span>
             <Input
                type="text"
                value={trackingLabel}
                onChange={(e: any) => setTrackingLabel(e.target.value)}
                placeholder="Tracking Label"
                className="w-60"
              />
            </Label> */}

              <div className=" flex space-x-2">
                <Button
                  size="small"
                  variant="primary"
                  isLoading={isFulfilling}
                  onClick={handleFulfillSelected}
                  disabled={
                    Object.keys(selectedMap).length === 0 ||
                    isFulfilling ||
                    !selectedLocationId ||
                    !selectedShippingId
                  }
                >
                  Fulfill Selected
                </Button>
                <Button
                  size="small"
                  disabled={isFulfilling}
                  variant="secondary"
                  onClick={handleCancelSelecting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>

      {fulfillments ? (
        fulfillments.map((fulfillment, index) => (
          <FulfilledItem
            key={fulfillment.id}
            fulfillment={fulfillment}
            index={index}
          />
        ))
      ) : (
        <Text>No fulfilled items.</Text>
      )}
    </>
  );
};

export default SingleOrder;
