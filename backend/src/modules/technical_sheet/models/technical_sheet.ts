import { model } from "@medusajs/framework/utils"

export const TechnicalSheet = model.define("technical_sheet", {
  id: model.id().primaryKey(),
  url: model.text(),
  file_type: model.text(),
  version: model.text(),
})
