import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ICustomerModuleService, INotificationModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

export default async function customerCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const emailService = container.resolve("emailService") as EmailService;
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const customerId = event.data.id;
  logger.info("[SUBSCRIBER] Customer created event triggered", {
    customerId,
    eventName: event.name,
  });

  try {
    
    logger.debug("[SUBSCRIBER] Retrieving customer data", { customerId });
    
    const customer = await customerModuleService.retrieveCustomer(customerId, {
      relations: ["addresses"],
    });

    logger.debug("[SUBSCRIBER] Customer data retrieved", {
      customerId: customer.id,
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
    });

    if (!customer?.email) {
      logger.warn(`[SUBSCRIBER] Customer ${customerId} has no email address - skipping email`);
      return;
    }

    // Try to get employee and company data through the link
    let companyData: any = null;
    try {
      logger.debug("[SUBSCRIBER] Querying for employee/company data", { customerId });
      
      const { data } = await query.graph({
        entity: "customer",
        fields: [
          "id",
          "employee.*",
          "employee.company.*"
        ],
        filters: {
          id: customerId,
        },
      });

      if (data && data.length > 0 && data[0].employee) {
        companyData = data[0].employee.company;
        logger.debug("[SUBSCRIBER] Company data found", {
          companyId: companyData?.id,
          companyName: companyData?.name,
        });
      } else {
        logger.debug("[SUBSCRIBER] No company data found for customer", { customerId });
      }
    } catch (error) {
      logger.warn(`[SUBSCRIBER] Could not retrieve company for customer ${customerId}`, error);
    }

    const enrichedCustomer = {
      ...customer,
      company: companyData,
    };

    logger.info("[SUBSCRIBER] Sending customer confirmation email", {
      to: customer.email,
      customerId,
      hasCompany: !!companyData,
    });

    const emailSent = await emailService.sendCustomerConfirmationEmail({
      to: customer.email,
      customer: enrichedCustomer,
    });

    if (emailSent) {
      logger.info(`[SUBSCRIBER] ✅ Customer created email successfully sent`, {
        customerId,
        email: customer.email,
      });
    } else {
      logger.warn(`[SUBSCRIBER] ⚠️ Customer created email was NOT sent (check email service logs)`, {
        customerId,
        email: customer.email,
      });
    }
  } catch (error: any) {
    logger.error(`[SUBSCRIBER] ❌ Failed to handle customer created event`, {
      customerId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
};