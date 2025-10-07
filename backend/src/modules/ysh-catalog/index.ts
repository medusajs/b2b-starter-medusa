import { Module } from "@medusajs/framework/utils";
import YshCatalogModuleService from "./service";

export const YSH_CATALOG_MODULE = "yshCatalog";

export default Module(YSH_CATALOG_MODULE, {
    service: YshCatalogModuleService,
});