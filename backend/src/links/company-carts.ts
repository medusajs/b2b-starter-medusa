import { defineLink } from "@medusajs/framework/utils";
import CartModule from "@medusajs/medusa/cart";
import CompanyModule from "../modules/company";

export default defineLink(CompanyModule.linkable.company, {
  linkable: CartModule.linkable.cart,
  isList: true,
});
