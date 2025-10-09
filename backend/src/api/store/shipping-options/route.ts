import { listShippingOptionsForCartWorkflow } from "@medusajs/core-flows";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RemoteQueryFunction } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { HttpTypes } from "@medusajs/types";

export const GET = async (
  req: MedusaRequest<{}, { cart_id: string }>,
  res: MedusaResponse<HttpTypes.StoreShippingOptionListResponse>
) => {
  const { cart_id } = req.filterableFields;

  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  );

  // Get cart with company information
  const {
    data: [cart],
  } = await query.graph(
    {
      entity: "cart",
      fields: ["id", "company.id"],
      filters: { id: cart_id },
    },
    { throwIfKeyNotFound: true }
  );

  // Get all shipping options for the cart
  const { result: allShippingOptions } =
    await listShippingOptionsForCartWorkflow(req.scope).run({
      input: { cart_id, is_return: false },
    });

  // If no company is associated with the cart, return all shipping options
  if (!cart.company?.id) {
    return res.json({ shipping_options: allShippingOptions });
  }

  // Extract service zone IDs from shipping options
  const serviceZoneIds = allShippingOptions
    .map((option: any) => option.service_zone_id)
    .filter(Boolean);

  if (serviceZoneIds.length === 0) {
    return res.json({ shipping_options: [] });
  }

  // Query service zones with their stock locations in a single query
  const { data: serviceZones } = await query.graph({
    entity: "service_zone",
    fields: [
      "id",
      "fulfillment_set.location.*",
      // "fulfillment_set.stock_locations.metadata",
    ],
    filters: {
      id: serviceZoneIds,
    },
  });

  // Create a map of service_zone_id to stock location metadata
  const serviceZoneToStockLocation = new Map();
  serviceZones.forEach((zone) => {
    serviceZoneToStockLocation.set(zone.id, zone.fulfillment_set.location);
  });

  // Filter shipping options based on stock location criteria
  const filteredShippingOptions = allShippingOptions.filter((option) => {
    const stockLocation = serviceZoneToStockLocation.get(
      option.service_zone_id
    );
    if (!stockLocation) return false;

    const metadata = stockLocation.metadata || {};

    // Filter out abstract warehouses and only include company's warehouses
    return (
      metadata.is_abstract !== true && metadata.company_id === cart.company?.id
    );
  });

  res.json({ shipping_options: filteredShippingOptions });
};
