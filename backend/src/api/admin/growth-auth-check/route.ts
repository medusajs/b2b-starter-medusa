import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Client } from "pg";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    // Get user email from auth context
    const actorId = req.auth_context.actor_id;
    if (!actorId) {
      return res.status(401).json({
        authorized: false,
        message: "Authentication required"
      });
    }

    // Get the query service from the request scope
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    
    // Get user email from the user table using actor_id
    const { data: users } = await query.graph({
      entity: "user",
      fields: ["email"],
      filters: { id: actorId }
    });
    
    if (users.length === 0) {
      return res.status(401).json({
        authorized: false,
        message: "User not found"
      });
    }
    
    const userEmail = users[0].email;
    
    // Use direct SQL query to check growth_users table
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    
    const result = await client.query(
      "SELECT id, email, is_active FROM growth_users WHERE email = $1 AND is_active = true",
      [userEmail]
    );
    
    await client.end();
    
    const isAuthorized = result.rows.length > 0;
    
    res.json({
      authorized: isAuthorized,
      email: userEmail
    });
  } catch (error: any) {
    console.error("Error in growth auth check:", error);
    res.status(500).json({
      authorized: false,
      message: "Internal server error"
    });
  }
}
