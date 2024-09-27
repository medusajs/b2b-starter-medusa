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
          `/admin/companies/${companyId}/employees` +
            (query ? `?${filterQuery}` : "")
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
  mutate: (employee: CreateEmployeeDTO) => Promise<EmployeeDTO>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (employee: CreateEmployeeDTO) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/admin/companies/${companyId}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employee),
      });

      if (!response.ok) {
        throw new Error("Failed to create employee");
      }

      const result = await response.json();
      return result.employee;
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
  data: EmployeeDTO | null;
  mutate: (employee: UpdateEmployeeDTO) => Promise<void>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<EmployeeDTO | null>(null);

  const mutate = async (employee: UpdateEmployeeDTO) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/admin/companies/${companyId}/employees/${employeeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employee),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update company customer");
      }

      const result = await response.json();
      setData(result.employee);
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
