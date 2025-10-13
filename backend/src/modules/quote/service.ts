import { MedusaService } from "@medusajs/framework/utils";
import { Quote, Message } from "./models";

class QuoteModuleService extends MedusaService({
    Quote,
    Message,
}) { }

export default QuoteModuleService;
