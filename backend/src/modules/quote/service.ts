import { MedusaService } from "@medusajs/framework/utils";
import { Comment, Quote } from "./models";

class QuoteModuleService extends MedusaService({ Quote, Comment }) {}

export default QuoteModuleService;
