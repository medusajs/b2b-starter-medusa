import { Container, Table, Text } from "@medusajs/ui";
import React from "react";
import { useStockLocations } from "../../../../hooks/api/order";

const FulfilledItem = ({ fulfillment, index }: any) => {
  const { data, isLoading } = useStockLocations(fulfillment.location_id);

  console.log({ fulfillment });

  return (
    <Container className="mb-2">
      <Text size="large" className="mb-4 font-bold tracking-wider">
        Fulfillment #{index + 1}
      </Text>
      <Table className="mb-4">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Title</Table.HeaderCell>
            <Table.HeaderCell>SKU</Table.HeaderCell>
            <Table.HeaderCell>Fulfilled Quantity</Table.HeaderCell>
            <Table.HeaderCell>Price</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {fulfillment.items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.title}</Table.Cell>
              <Table.Cell>{item.sku || "N/A"}</Table.Cell>
              <Table.Cell>{item.quantity}</Table.Cell>
              <Table.Cell>{item?.details?.unit_price}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <div className="text-sm flex flex-col gap-2 text-gray-300">
        <p>
          <strong>Provider:</strong> {fulfillment.provider_id}
        </p>
        <p>
          <strong>Tracking Number:</strong>{" "}
          {fulfillment?.tracking_numbers?.join(", ") || "N/A"}
        </p>
        <p>
          <strong>Shipping From:</strong> {data?.stock_location?.name || "N/A"}
        </p>
        <p>
          <strong>Shipping Amount:</strong>{" "}
          {fulfillment.data?.shipping_amount
            ? `$${(fulfillment?.data?.shipping_amount / 100).toFixed(2)}`
            : "N/A"}
        </p>
      </div>
    </Container>
  );
};

export default FulfilledItem;
