import { Modules } from "@medusajs/framework/utils";
import { createStep } from "@medusajs/framework/workflows-sdk";

export const triggerAlgoliaSyncStep = createStep(
  "trigger-algolia-sync",
  async (_, { container }) => {
    const eventModuleService = container.resolve(Modules.EVENT_BUS);
    await eventModuleService.emit({
      name: "algolia.sync",
      data: {},
    });
  }
);
