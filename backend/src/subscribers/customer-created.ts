import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ICustomerModuleService, INotificationModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import EmailService from "../services/email.service";

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("========== CUSTOMER CREATED SUBSCRIBER START ==========");
  console.log("[CustomerCreated] Subscriber triggered with customer ID:", data.id);
  
  const emailService = container.resolve("emailService") as EmailService;
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const customerId = data.id;
  console.log("[CustomerCreated] Event details:", {
    customerId,
  });

  try {
    
    console.log("[CustomerCreated] Retrieving customer data...");
    
    const customer = await customerModuleService.retrieveCustomer(customerId, {
      relations: ["addresses"],
    });

    console.log("[CustomerCreated] Customer data retrieved:", {
      customerId: customer.id,
      email: customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
    });

    if (!customer?.email) {
      console.log(`[CustomerCreated] Customer ${customerId} has no email address - skipping email`);
      return;
    }

    // Try to get employee and company data through the link
    let companyData: any = null;
    try {
      console.log("[CustomerCreated] Querying for employee/company data...");
      
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
        console.debug("[SUBSCRIBER] Company data found", {
          companyId: companyData?.id,
          companyName: companyData?.name,
        });
      } else {
        console.debug("[SUBSCRIBER] No company data found for customer", { customerId });
      }
    } catch (error) {
      console.warn(`[SUBSCRIBER] Could not retrieve company for customer ${customerId}`, error);
    }

    const enrichedCustomer = {
      ...customer,
      company: companyData,
    };

    console.info("[SUBSCRIBER] Sending customer confirmation email", {
      to: customer.email,
      customerId,
      hasCompany: !!companyData,
    });

    const emailSent = await emailService.sendCustomerConfirmationEmail({
      to: customer.email,
      customer: enrichedCustomer,
    });

    if (emailSent) {
      console.info(`[SUBSCRIBER] ✅ Customer created email successfully sent`, {
        customerId,
        email: customer.email,
      });
    } else {
      console.warn(`[SUBSCRIBER] ⚠️ Customer created email was NOT sent (check email service logs)`, {
        customerId,
        email: customer.email,
      });
    }
  } catch (error: any) {
    console.error("[CustomerCreated] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    console.error("[CustomerCreated] Full error object:", error);
    throw error;
  } finally {
    console.log("========== CUSTOMER CREATED SUBSCRIBER END ==========");
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
  context: {
    subscriberId: "customer-created-handler",
  },
};