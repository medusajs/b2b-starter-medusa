import { HttpTypes } from "@medusajs/framework/types";
import { sdk } from "../lib/client";
import { AdminCreateCustomer, AdminCustomer } from "@medusajs/types";
import { useEffect, useState } from "react";

export const useAdminCreateCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (customer: AdminCreateCustomer) => {
    setLoading(true);
    setError(null);

    try {
      const result = await sdk.admin.customer.create(customer);
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

export const useAdminCustomerGroups = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<HttpTypes.AdminCustomerGroup[]>([]);

  useEffect(() => {
    const fetchCustomerGroups = async () => {
      setLoading(true);
      setError(null);

      await sdk.admin.customerGroup
        .list()
        .then(({ customer_groups }) => {
          setData(customer_groups);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchCustomerGroups();
  }, []);

  return { data, loading, error };
};
