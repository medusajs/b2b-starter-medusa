import {
  createShippingOptionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/core-flows";
import { IFulfillmentModuleService } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export interface InheritWarehouseLinksInput {
  parent_warehouse_id: string;
  virtual_warehouse_id: string;
}

export const inheritWarehouseLinksStep = createStep(
  "inherit-warehouse-links",
  async (input: InheritWarehouseLinksInput[], { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const remoteQuery = container.resolve(
      ContainerRegistrationKeys.REMOTE_QUERY
    );
    const logger = container.resolve("logger");
    const fulfillmentModuleService =
      container.resolve<IFulfillmentModuleService>(
        ModuleRegistrationName.FULFILLMENT
      );

    const createdLinks: any[] = [];
    const createdFulfillmentSets: any[] = [];

    for (const { parent_warehouse_id, virtual_warehouse_id } of input) {
      logger.info(
        `Inheriting links from ${parent_warehouse_id} to ${virtual_warehouse_id}`
      );

      try {
        // Query parent warehouse with its relationships using remoteQuery
        const [parentData] = await remoteQuery({
          entryPoint: "stock_location",
          fields: [
            "id",
            "name",
            "fulfillment_providers.id",
            "fulfillment_sets.id",
            "sales_channels.id",
          ],
          variables: {
            filters: { id: parent_warehouse_id },
          },
        });

        if (!parentData) {
          logger.warn(`Parent warehouse ${parent_warehouse_id} not found`);
          continue;
        }

        // Get virtual warehouse name for fulfillment set naming
        const [virtualWarehouseData] = await remoteQuery({
          entryPoint: "stock_location",
          fields: ["id", "name"],
          variables: {
            filters: { id: virtual_warehouse_id },
          },
        });

        const virtualWarehouseName =
          virtualWarehouseData?.name || "Virtual Warehouse";

        // Copy fulfillment provider links
        if (parentData.fulfillment_providers?.length > 0) {
          for (const provider of parentData.fulfillment_providers) {
            const newLink = await link.create({
              [Modules.STOCK_LOCATION]: {
                stock_location_id: virtual_warehouse_id,
              },
              [Modules.FULFILLMENT]: {
                fulfillment_provider_id: provider.id,
              },
            });
            createdLinks.push(newLink);
          }
        }

        // Clone fulfillment sets (cannot be shared, must create new ones)
        if (parentData.fulfillment_sets?.length > 0) {
          for (const { id: fulfillmentSetId } of parentData.fulfillment_sets) {
            const fulfillmentSet =
              await fulfillmentModuleService.retrieveFulfillmentSet(
                fulfillmentSetId,
                {
                  relations: [
                    "service_zones",
                    "service_zones.shipping_options",
                    "service_zones.shipping_options.rules",
                    "service_zones.shipping_options.type",
                    "service_zones.geo_zones",
                  ],
                }
              );

            // Create a new fulfillment set for the virtual warehouse
            const newFulfillmentSet =
              await fulfillmentModuleService.createFulfillmentSets({
                name: `${fulfillmentSet.name} - ${virtualWarehouseName}`,
                type: fulfillmentSet.type,
                service_zones: fulfillmentSet.service_zones.map((s) => ({
                  ...s,
                  id: undefined,
                  fulfillment_set_id: undefined,
                  name: `${s.name} - ${virtualWarehouseName}`,
                  shipping_options: undefined,
                  geo_zones: s.geo_zones.map(({ type, country_code }) => ({
                    type,
                    country_code,
                  })),
                })) as any,
              });

            await link.create({
              [Modules.STOCK_LOCATION]: {
                stock_location_id: virtual_warehouse_id,
              },
              [Modules.FULFILLMENT]: {
                fulfillment_set_id: newFulfillmentSet.id,
              },
            });

            await createShippingOptionsWorkflow(container).run({
              input: newFulfillmentSet.service_zones.flatMap((s) =>
                fulfillmentSet.service_zones[0].shipping_options.map((so) => ({
                  name: so.name,
                  service_zone_id: s.id,
                  shipping_profile_id: so.shipping_profile_id,
                  provider_id: so.provider_id,
                  type: {
                    label: so.type.label,
                    code: so.type.code,
                    description: so.type.description,
                  },
                  rules: so.rules.map(({ attribute, operator, value }) => ({
                    attribute,
                    operator,
                    value,
                  })) as any[],

                  price_type: so.price_type,
                  prices: [
                    {
                      currency_code: "gbp",
                      amount: 0,
                    },
                  ],
                }))
              ),
            });

            createdFulfillmentSets.push(newFulfillmentSet);

            // Link the new fulfillment set to the virtual warehouse
            const newLink = await link.create({
              [Modules.STOCK_LOCATION]: {
                stock_location_id: virtual_warehouse_id,
              },
              [Modules.FULFILLMENT]: {
                fulfillment_set_id: newFulfillmentSet.id,
              },
            });
            createdLinks.push(newLink);
          }
        }

        // Copy sales channel links using the dedicated workflow
        if (parentData.sales_channels?.length > 0) {
          const salesChannelIds = parentData.sales_channels.map(
            (sc: any) => sc.id
          );

          await linkSalesChannelsToStockLocationWorkflow(container).run({
            input: {
              id: virtual_warehouse_id,
              add: salesChannelIds,
            },
          });

          logger.info(
            `Linked ${salesChannelIds.length} sales channels to virtual warehouse`
          );
        }

        logger.info(
          `Successfully inherited links for virtual warehouse ${virtual_warehouse_id}`
        );
      } catch (error) {
        logger.error(
          `Failed to inherit links for ${virtual_warehouse_id}:`,
          error
        );
        throw error;
      }
    }

    return new StepResponse(
      { links: createdLinks, fulfillmentSets: createdFulfillmentSets },
      { links: createdLinks, fulfillmentSets: createdFulfillmentSets }
    );
  },
  async (
    rollbackData: { links: any[]; fulfillmentSets: any[] },
    { container }
  ) => {
    if (!rollbackData) {
      return;
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const fulfillmentModuleService =
      container.resolve<IFulfillmentModuleService>(
        ModuleRegistrationName.FULFILLMENT
      );

    // Delete created fulfillment sets
    if (rollbackData.fulfillmentSets?.length > 0) {
      const fulfillmentSetIds = rollbackData.fulfillmentSets.map((fs) => fs.id);
      await fulfillmentModuleService.deleteFulfillmentSets(fulfillmentSetIds);
    }

    // Remove created links
    if (rollbackData.links?.length > 0) {
      for (const createdLink of rollbackData.links) {
        await link.delete(createdLink);
      }
    }
  }
);
