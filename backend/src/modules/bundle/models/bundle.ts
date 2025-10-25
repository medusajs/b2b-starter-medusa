import { model } from "@medusajs/framework/utils"
import { BundleItem } from "./bundle_item"

export const Bundle = model.define("bundle", {
  id: model.id().primaryKey(),
  title: model.text(),
  items: model.hasMany(() => BundleItem, {
    mappedBy: "bundle",
  }),
})
