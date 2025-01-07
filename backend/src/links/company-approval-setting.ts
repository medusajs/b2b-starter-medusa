import { defineLink } from "@medusajs/framework/utils";
import CompanyModule from "../modules/company";
import ApprovalModule from "../modules/approval";

export default defineLink(
  CompanyModule.linkable.company,
  ApprovalModule.linkable.approvalSettings
);
