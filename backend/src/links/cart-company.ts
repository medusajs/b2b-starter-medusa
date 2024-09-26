import CartModule from "@medusajs/cart";
import { defineLink } from "@medusajs/utils";
import CompanyModule from "../modules/company";

export default defineLink(
  CartModule.linkable.cart,
  CompanyModule.linkable.company
);
