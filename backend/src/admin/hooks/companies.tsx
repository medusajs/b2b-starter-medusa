import { useState, useEffect } from "react";
import { CompanyDTO } from "../../modules/company/types/common";
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
} from "../../modules/company/types/mutations";

export const useCompanies = (
  query?: Record<string, any>
): {
  data: { companies: CompanyDTO[] } | null;
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
    const fetchCompanies = async () => {
      try {
        const response = await fetch(
          "/admin/companies" + (filterQuery ? `?${filterQuery}` : "")
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

    fetchCompanies();
  }, [refetchTrigger]);

  return { data, refetch, loading, error };
};

export const useCompany = (
  companyId: string,
  query?: Record<string, any>
): {
  data: { company: CompanyDTO } | null;
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
    const fetchCompanies = async () => {
      try {
        const response = await fetch(
          `/admin/companies/${companyId}` +
            (filterQuery ? `?${filterQuery}` : "")
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

    fetchCompanies();
  }, [refetchTrigger]);

  return { data, refetch, loading, error };
};

export const useCreateCompany = (): {
  mutate: (company: CreateCompanyDTO) => Promise<CompanyDTO>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (company: CreateCompanyDTO) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/admin/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(company),
      });

      if (!response.ok) {
        throw new Error("Failed to create company");
      }

      const result = await response.json();
      return result;
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

export const useUpdateCompany = (
  companyId: string
): {
  mutate: (company: UpdateCompanyDTO) => Promise<CompanyDTO>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (company: UpdateCompanyDTO) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/admin/companies/${companyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(company),
      });

      if (!response.ok) {
        throw new Error("Failed to update company");
      }

      const result = await response.json();
      return result;
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

export const useDeleteCompany = (
  companyId: string
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
      const response = await fetch(`/admin/companies/${companyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete company");
      }

      const result = await response.json();
      return result;
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
