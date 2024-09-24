import { useEffect, useState } from "react";
import {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
} from "../../modules/company/types/mutations";
import { EmployeeDTO } from "../../modules/company/types/common";

export const useEmployees = (
  companyId: string,
  query?: Record<string, any>
): {
  data: { employees: EmployeeDTO[] } | null;
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
    const fetchEmployees = async () => {
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

    fetchEmployees();
  }, [refetchTrigger]);
  return { data, refetch, loading, error };
};

export const useCreateEmployee = (
  companyId: string
): {
  mutate: (customer: CreateEmployeeDTO) => Promise<EmployeeDTO>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (customer: CreateEmployeeDTO) => {
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

export const useUpdateEmployee = (
  companyId: string,
  employeeId: string
): {
  mutate: (customer: UpdateEmployeeDTO) => Promise<EmployeeDTO>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (customer: UpdateEmployeeDTO) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/companies/${companyId}/customers/${employeeId}`,
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

export const useDeleteEmployee = (
  companyId: string,
  employeeId: string
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
        `/companies/${companyId}/customers/${employeeId}`,
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
