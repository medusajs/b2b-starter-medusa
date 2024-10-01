import CustomerModule from "@medusajs/customer";
import { defineLink } from "@medusajs/framework/utils";
import CompanyModule from "../modules/company";

export default defineLink(
  CompanyModule.linkable.employee,
  CustomerModule.linkable.customer
);
