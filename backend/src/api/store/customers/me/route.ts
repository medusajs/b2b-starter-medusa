import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { customer_id } = req.auth_context.app_metadata as {
    customer_id: string;
  };

  if (!customer_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const requestedFields = req.query.fields as string;
  
  // Parse the requested fields
  let fields = ["*"];
  if (requestedFields) {
    // Decode URL encoded fields
    const decodedFields = decodeURIComponent(requestedFields);
    fields = decodedFields.split(",").map(f => f.trim());
  }
  
  // Always include metadata for approval status
  if (!fields.some(f => f.includes("metadata"))) {
    fields.push("metadata");
  }
  
  // Always include employee and company data for B2B functionality
  if (!fields.some(f => f.includes("employee"))) {
    fields.push("employee.*");
  }
  if (!fields.some(f => f.includes("employee.company"))) {
    fields.push("employee.company.*");
  }
  
  // Always include addresses and orders as they're commonly needed
  if (!fields.some(f => f.includes("addresses"))) {
    fields.push("*addresses");
  }
  if (!fields.some(f => f.includes("orders"))) {
    fields.push("*orders");
  }

  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields,
    filters: { id: customer_id },
  });

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  res.json({ customer });
};