import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { createVirtualWarehousesForCompanyWorkflow } from "../workflows/company/workflows";

export default async function companyCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; name: string }>) {
  const logger = container.resolve("logger");
  
  logger.info(`Company created event received for: ${data.name} (${data.id})`);
  
  try {
    // Execute virtual warehouse creation workflow
    await createVirtualWarehousesForCompanyWorkflow(container).run({
      input: {
        company_id: data.id,
        company_name: data.name,
      },
    });
    
    logger.info(`Virtual warehouses created successfully for company: ${data.name}`);
  } catch (error) {
    logger.error(`Failed to create virtual warehouses for company ${data.name}:`, error);
    throw error;
  }
}

export const config: SubscriberConfig = {
  event: "company.created",
};