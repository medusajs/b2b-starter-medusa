import { MedusaClient } from "./client";
import { AdminCreateCustomer, AdminCustomer } from "@medusajs/types";
import { useState } from "react";

export const useAdminCreateCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (customer: AdminCreateCustomer) => {
    setLoading(true);
    setError(null);

    try {
      const result = await MedusaClient.admin.customer.create(customer);
      return result.customer;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
