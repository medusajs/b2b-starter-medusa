import { Module } from "@medusajs/framework/utils"
import CreditAnalysisService from "./service"

export const CREDIT_ANALYSIS = "credit-analysis"

export default Module(CREDIT_ANALYSIS, {
    service: CreditAnalysisService,
})
