import { Module } from "@medusajs/utils";
import QuoteModuleService from "./service";

export const QUOTE_MODULE = "quote";

export default Module(QUOTE_MODULE, { service: QuoteModuleService });
