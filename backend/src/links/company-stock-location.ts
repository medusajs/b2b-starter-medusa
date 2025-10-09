import { defineLink } from "@medusajs/framework/utils";
import StockLocationModule from "@medusajs/medusa/stock-location";
import CompanyModule from "../modules/company";

export default defineLink(
  CompanyModule.linkable.company,
  {
    linkable: StockLocationModule.linkable.stockLocation,
    isList: true,
  }
);