import { MedusaService } from "@medusajs/framework/utils"
import { TechnicalSheet } from "./models/technical_sheet"

export default class TechnicalSheetModuleService extends MedusaService({
  TechnicalSheet,
}) { }
