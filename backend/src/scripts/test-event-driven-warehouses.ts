import { ExecArgs } from "@medusajs/framework/types";
import { ModuleRegistrationName } from "@medusajs/framework/utils";
import { createCompaniesWorkflow } from "../workflows/company/workflows";
import { ModuleCompanySpendingLimitResetFrequency } from "../types/company";

export default async function testEventDrivenWarehouses({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const stockLocationService = container.resolve(ModuleRegistrationName.STOCK_LOCATION);
  
  logger.info("🚀 Testing event-driven virtual warehouse creation...");
  
  // Get initial warehouse count
  const initialWarehouses = await stockLocationService.listStockLocations(
    {},
    { select: ["id", "name", "metadata"] }
  );
  
  const initialVirtualCount = initialWarehouses.filter(
    (w: any) => w.metadata?.is_abstract === false
  ).length;
  
  logger.info(`📊 Initial virtual warehouses: ${initialVirtualCount}`);
  
  // Create a test company - this should trigger the event-driven flow
  logger.info("🏢 Creating test company...");
  
  const { result: [testCompany] } = await createCompaniesWorkflow(container).run({
    input: [
      {
        name: "Test Event Corp",
        country: "us",
        currency_code: "usd",
        phone: "",
        email: "test@eventcorp.com",
        address: null,
        city: null,
        zip: null,
        state: null,
        logo_url: null,
        spending_limit_reset_frequency: ModuleCompanySpendingLimitResetFrequency.NEVER,
      },
    ],
  });
  
  logger.info(`✅ Company created: ${testCompany.name} (ID: ${testCompany.id})`);
  
  // Wait for event processing
  logger.info("⏳ Waiting for event subscriber to process...");
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Check final warehouse count
  const finalWarehouses = await stockLocationService.listStockLocations(
    {},
    { select: ["id", "name", "metadata"] }
  );
  
  const finalVirtualWarehouses = finalWarehouses.filter(
    (w: any) => w.metadata?.is_abstract === false
  );
  
  const companyWarehouses = finalVirtualWarehouses.filter(
    (w: any) => w.metadata?.company_id === testCompany.id
  );
  
  logger.info(`📊 Final virtual warehouses: ${finalVirtualWarehouses.length}`);
  logger.info(`🏢 Warehouses for ${testCompany.name}: ${companyWarehouses.length}`);
  
  if (companyWarehouses.length > 0) {
    logger.info("🎉 SUCCESS: Event-driven virtual warehouse creation working!");
    companyWarehouses.forEach((w: any) => {
      logger.info(`  - ${w.name} (ID: ${w.id})`);
    });
  } else {
    logger.error("❌ FAILED: No virtual warehouses created for the company!");
    logger.info("Debugging info:");
    logger.info(`- Event should have been emitted for company ${testCompany.id}`);
    logger.info(`- Subscriber should have triggered virtual warehouse creation`);
    logger.info(`- Check event bus and subscriber logs`);
  }
}