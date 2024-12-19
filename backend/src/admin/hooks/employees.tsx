import {
  AdminCreateEmployee,
  AdminEmployeeResponse,
  AdminEmployeesResponse,
  AdminUpdateEmployee,
  QueryEmployee,
} from "@starter/types";
import { useEffect, useState } from "react";
import { sdk } from "../lib/client";

export const useEmployees = (
  companyId: string,
  query?: Record<string, any>
): {
  data: AdminEmployeesResponse | null;
  refetch: () => void;
  loading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<AdminEmployeesResponse | null>(null);
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
        const result: AdminEmployeesResponse = await sdk.client.fetch(
          `/admin/companies/${companyId}/employees` +
            (query ? `?${filterQuery}` : "")
        );
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
  mutate: (employee: Partial<AdminCreateEmployee>) => Promise<QueryEmployee>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (employee: AdminCreateEmployee) => {
    setLoading(true);
    setError(null);

    try {
      const response: AdminEmployeeResponse = await sdk.client.fetch(
        `/admin/companies/${companyId}/employees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: employee,
        }
      );

      return response.employee;
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
  data: QueryEmployee | null;
  mutate: (employee: AdminUpdateEmployee) => Promise<void>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<QueryEmployee | null>(null);

  const mutate = async (employee: AdminUpdateEmployee) => {
    setLoading(true);
    setError(null);

    try {
      const response: AdminEmployeeResponse = await sdk.client.fetch(
        `/admin/companies/${companyId}/employees/${employeeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: employee,
        }
      );

      setData(response.employee);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, mutate, loading, error };
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
        `/admin/companies/${companyId}/employees/${employeeId}`,
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
