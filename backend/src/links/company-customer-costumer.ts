import CompanyModule from "../modules/company";
import CustomerModule from "@medusajs/customer";
import { defineLink } from "@medusajs/utils";

export default defineLink(
  CompanyModule.linkable.companyCustomer,
  CustomerModule.linkable.customer
);
