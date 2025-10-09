import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";

export interface EmitEventInput {
  name: string;
  data: any;
}

export const emitEventsStep = createStep(
  "emit-events",
  async (events: EmitEventInput[], { container }) => {
    const eventBus = container.resolve(Modules.EVENT_BUS);
    const logger = container.resolve("logger");
    
    for (const event of events) {
      logger.info(`Emitting event: ${event.name}`);
      await eventBus.emit(event);
    }
    
    return new StepResponse(events);
  }
);