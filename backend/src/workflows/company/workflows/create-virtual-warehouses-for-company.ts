import { createLinksWorkflow } from "@medusajs/core-flows";
import { Modules } from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import { createVirtualWarehousesStep } from "../steps/create-virtual-warehouses";
import { generateCompanyCodeStep } from "../steps/generate-company-code";
import { inheritWarehouseLinksStep } from "../steps/inherit-warehouse-links";
import { listAbstractWarehousesStep } from "../steps/list-abstract-warehouses";

export interface CreateVirtualWarehousesForCompanyInput {
  company_id: string;
  company_name: string;
}

export const createVirtualWarehousesForCompanyWorkflow = createWorkflow(
  "create-virtual-warehouses-for-company",
  function (input: CreateVirtualWarehousesForCompanyInput) {
    // Step 1: List all abstract warehouses
    const abstractWarehouses = listAbstractWarehousesStep();

    // Step 2: Generate company code
    const companyCode = generateCompanyCodeStep({
      company_name: input.company_name,
    });

    // Step 3: Create virtual warehouses
    const virtualWarehousesData = createVirtualWarehousesStep({
      company_id: input.company_id,
      company_name: input.company_name,
      company_code: companyCode,
      abstract_warehouses: abstractWarehouses,
    });

    // Step 4: Prepare link inheritance data
    const inheritanceData = transform(
      { abstractWarehouses, virtualWarehousesData },
      (data) => {
        const { abstractWarehouses, virtualWarehousesData } = data;
        const { warehouses } = virtualWarehousesData;

        return warehouses.map((warehouse: any) => ({
          parent_warehouse_id: warehouse.parent_warehouse_id,
          virtual_warehouse_id: warehouse.warehouse_id,
        }));
      }
    );

    // Step 5: Inherit links from abstract warehouses
    inheritWarehouseLinksStep(inheritanceData);

    // Step 6: Create company-stock location links
    const companyWarehouseLinks = transform(virtualWarehousesData, (data) => {
      const { warehouse_ids } = data;

      return warehouse_ids.map((warehouse_id: any) => ({
        [COMPANY_MODULE]: {
          company_id: (input.company_id as any).__id,
        },
        [Modules.STOCK_LOCATION]: {
          stock_location_id: warehouse_id,
        },
      }));
    });

    createLinksWorkflow.runAsStep({
      input: companyWarehouseLinks,
    });

    return new WorkflowResponse(virtualWarehousesData);
  }
);
