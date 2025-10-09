import { createStockLocationsWorkflow } from "@medusajs/core-flows";
import { IStockLocationService } from "@medusajs/framework/types";
import { ModuleRegistrationName } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export interface CreateVirtualWarehousesInput {
  company_id: string;
  company_name: string;
  company_code: string;
  abstract_warehouses: any[];
}

export const createVirtualWarehousesStep = createStep(
  "create-virtual-warehouses",
  async (input: CreateVirtualWarehousesInput, { container }) => {
    const { company_id, company_name, company_code, abstract_warehouses } =
      input;

    const createdWarehouseIds: string[] = [];
    const companyWarehouseMappings: any[] = [];

    try {
      for (const abstractWarehouse of abstract_warehouses) {
        // Extract location code from abstract warehouse name (e.g., "EU" from "EU-ABSTRACT")
        const locationCode = abstractWarehouse.name.replace("-ABSTRACT", "");
        const virtualWarehouseName = `${locationCode}-${company_code}`;

        // Create the virtual warehouse
        const {
          result: [virtualWarehouse],
        } = await createStockLocationsWorkflow(container).run({
          input: {
            locations: [
              {
                name: virtualWarehouseName,
                metadata: {
                  is_abstract: false,
                  parent_warehouse_id: abstractWarehouse.id,
                  company_id: company_id,
                  company_name: company_name,
                },
                address: {
                  ...abstractWarehouse.address,
                  id: undefined,
                },
              },
            ],
          },
        });

        createdWarehouseIds.push(virtualWarehouse.id);

        // Prepare company-warehouse link data
        companyWarehouseMappings.push({
          company_id,
          warehouse_id: virtualWarehouse.id,
          warehouse_name: virtualWarehouseName,
          parent_warehouse_id: abstractWarehouse.id,
        });
      }

      return new StepResponse(
        {
          warehouses: companyWarehouseMappings,
          warehouse_ids: createdWarehouseIds,
        },
        createdWarehouseIds
      );
    } catch (error) {
      // If there's an error, we need to clean up any created warehouses
      throw error;
    }
  },
  async (createdWarehouseIds: string[], { container }) => {
    if (!createdWarehouseIds || createdWarehouseIds.length === 0) {
      return;
    }

    const stockLocationService = container.resolve<IStockLocationService>(
      ModuleRegistrationName.STOCK_LOCATION
    );

    // Delete the created virtual warehouses in case of rollback
    await stockLocationService.deleteStockLocations(createdWarehouseIds);
  }
);
