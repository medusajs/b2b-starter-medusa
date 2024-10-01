import { defineLink } from "@medusajs/framework/utils";
import OrderModule from "@medusajs/medusa/order";
import CompanyModule from "../modules/company";

export default defineLink(
  OrderModule.linkable.order,
  CompanyModule.linkable.company
);
