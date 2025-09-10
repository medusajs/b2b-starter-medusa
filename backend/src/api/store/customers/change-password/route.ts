import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const { currentPassword, newPassword } = req.body as { 
      currentPassword: string; 
      newPassword: string; 
    };
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "New password must be at least 8 characters long" 
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "New password must be different from current password" 
      });
    }


    // Get customer ID from auth context
    const { customer_id } = req.auth_context.app_metadata as {
      customer_id: string;
    };

    if (!customer_id) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // Get services from the request scope
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER);
    const authModuleService = req.scope.resolve(Modules.AUTH);
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // Get customer details
    const customer = await customerModuleService.retrieveCustomer(customer_id);
    
    if (!customer || !customer.email) {
      return res.status(404).json({ 
        success: false, 
        message: "Customer not found" 
      });
    }


    // Find the auth identity for this customer
    const { data: [providerIdentity] } = await query.graph({
      entity: "provider_identity",
      fields: ["id", "provider_metadata"],
      filters: {
        provider: "emailpass",
        entity_id: customer.email,
      },
    });

    if (!providerIdentity) {
      return res.status(404).json({ 
        success: false, 
        message: "Authentication identity not found" 
      });
    }

    // Verify current password by checking the provider identity
    // We'll validate by attempting to authenticate with the current credentials
    const bcrypt = require("bcrypt");
    
    // Get the hashed password from provider metadata
    const hashedPassword = providerIdentity.provider_metadata?.password;
    
    if (!hashedPassword) {
      return res.status(500).json({ 
        success: false, 
        message: "Unable to verify current password" 
      });
    }
    
    // Verify the current password matches
    const isValidPassword = await bcrypt.compare(currentPassword, hashedPassword);
    
    if (!isValidPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }

    // Update the password
    await authModuleService.updateProviderIdentities([
      {
        id: providerIdentity.id,
        provider_metadata: {
          password: newPassword,
        },
      },
    ]);


    res.json({ 
      success: true, 
      message: "Password updated successfully" 
    });

  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to update password" 
    });
  }
};

