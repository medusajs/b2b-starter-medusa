import { MedusaService } from "@medusajs/framework/utils";
import { Quote, Message } from "./models/index.js";

class QuoteModuleService extends MedusaService({
    Quote,
    Message,
}) { }

export default QuoteModuleService;
