import { MedusaService } from "@medusajs/utils";
import { Quote } from "./models";

class QuoteModuleService extends MedusaService({ Quote }) {}

export default QuoteModuleService;
