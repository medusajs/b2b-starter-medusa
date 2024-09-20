import { useEffect, useState } from "react";
import {
  CreateCompanyCustomerDTO,
  UpdateCompanyCustomerDTO,
} from "../../modules/company/types/mutations";
import { CompanyCustomerDTO } from "../../modules/company/types/common";

export const useCompanyCustomers = (
  companyId: string,
  query?: Record<string, any>
): {
  data: { companyCustomers: CompanyCustomerDTO[] } | null;
  refetch: () => void;
  loading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const filterQuery = new URLSearchParams(query).toString();

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchCompanyCustomers = async () => {
      try {
        const response = await fetch(
          `/companies/${companyId}/customers` + (query ? `?${filterQuery}` : "")
        );
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyCustomers();
  }, [refetchTrigger]);
  return { data, refetch, loading, error };
};

export const useCreateCompanyCustomer = (
  companyId: string
): {
  mutate: (customer: CreateCompanyCustomerDTO) => Promise<CompanyCustomerDTO>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (customer: CreateCompanyCustomerDTO) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/companies/${companyId}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      });

      if (!response.ok) {
        throw new Error("Failed to create company customer");
      }

      const result = await response.json();
      return result.company_customer;
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

export const useUpdateCompanyCustomer = (
  companyId: string,
  companyCustomerId: string
): {
  mutate: (customer: UpdateCompanyCustomerDTO) => Promise<CompanyCustomerDTO>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (customer: UpdateCompanyCustomerDTO) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/companies/${companyId}/customers/${companyCustomerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customer),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update company customer");
      }

      const result = await response.json();
      return result.company_customer;
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

export const useDeleteCompanyCustomer = (
  companyId: string,
  companyCustomerId: string
): {
  mutate: () => Promise<void>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/companies/${companyId}/customers/${companyCustomerId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete company customer");
      }
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
