import { Module } from "@medusajs/framework/utils";
import QuoteModuleService from "./service";

export const QUOTE_MODULE = "Quote";

export default Module(QUOTE_MODULE, { service: QuoteModuleService });
