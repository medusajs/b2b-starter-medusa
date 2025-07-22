import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import CompanyModule from "../modules/company";

export default defineLink(
  CompanyModule.linkable.company,
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  }
);
