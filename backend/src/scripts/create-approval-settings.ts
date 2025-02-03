import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createApprovalSettingsWorkflow } from "../workflows/approval/workflows";

/**
 * This script adds approval settings to companies that don't have them yet.
 * It's meant to be run once when you're upgrading the Starter for an existing project.
 * If you're doing a fresh install, you can ignore this script.
 *
 * Execute by running `npx medusa exec src/scripts/create-approval-settings.ts`
 */
export default async function createApprovalSettings({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: companies } = await query.graph({
    entity: "company",
    fields: ["id", "approval_settings.*"],
  });

  const companiesWithoutApprovalSettings = companies.filter(
    (company) => !company.approval_settings
  );

  logger.info(
    `Found ${companiesWithoutApprovalSettings.length} companies without approval settings`
  );

  if (companiesWithoutApprovalSettings.length === 0) {
    logger.error("No companies without approval settings found");
    return;
  }

  logger.info(
    `Creating approval settings for ${companiesWithoutApprovalSettings.length} companies`
  );

  const { result } = await createApprovalSettingsWorkflow.run({
    input: companiesWithoutApprovalSettings,
    container,
  });

  logger.info(`Approval settings created for ${result.length} companies`);
}
