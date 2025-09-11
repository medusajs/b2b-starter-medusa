import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ICustomerModuleService, INotificationModuleService } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("========== CUSTOMER CREATED SUBSCRIBER START ==========");
  console.log("[CustomerCreated] Subscriber triggered with customer ID:", data.id);
  
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

    // EMAIL SENDING DISABLED - Using API approach instead
    // Welcome emails are now sent directly from the signup function
    // via the /store/send-welcome-email API endpoint
    console.log("[CustomerCreated] Email sending disabled - handled by API");

    // You can add other customer creation logic here if needed
    // For example: analytics tracking, webhook notifications, etc.

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