import { Module } from "@medusajs/framework/utils";
import QuoteModuleService from "./service.js";

export const B2B_QUOTE_MODULE = "b2bQuote";

export default Module(QUOTE_MODULE, { service: QuoteModuleService });
