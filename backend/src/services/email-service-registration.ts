import { Module } from "@medusajs/framework/utils";
import EmailService from "./email.service";

export const EMAIL_SERVICE = "emailService";

export default Module(EMAIL_SERVICE, {
  service: EmailService,
});
