import { Module } from "@medusajs/framework/utils";
import QuoteModuleService from "./service.js";

export const QUOTE_MODULE = "quote";

export default Module(QUOTE_MODULE, { service: QuoteModuleService });
