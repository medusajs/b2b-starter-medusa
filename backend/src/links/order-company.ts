import OrderModule from "@medusajs/order";
import { defineLink } from "@medusajs/utils";
import CompanyModule from "../modules/company";

export default defineLink(
  OrderModule.linkable.order,
  CompanyModule.linkable.company
);
