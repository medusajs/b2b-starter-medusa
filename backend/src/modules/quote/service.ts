import { MedusaService } from "@medusajs/framework/utils";
import { Message, Quote } from "./models";

class QuoteModuleService extends MedusaService({ Quote, Message }) {}

export default QuoteModuleService;
