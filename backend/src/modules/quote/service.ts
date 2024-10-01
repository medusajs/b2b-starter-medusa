import { MedusaService } from "@medusajs/framework/utils";
import { Quote } from "./models";

class QuoteModuleService extends MedusaService({ Quote }) {}

export default QuoteModuleService;
