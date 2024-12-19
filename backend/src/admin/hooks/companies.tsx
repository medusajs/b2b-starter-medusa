import { useState, useEffect } from "react";
import { CompanyDTO } from "../../modules/company/types/common";
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
} from "../../modules/company/types/mutations";
import { sdk } from "../lib/client";
import {
  AdminCompaniesResponse,
  AdminCompanyResponse,
  AdminCreateCompany,
  AdminUpdateCompany,
} from "@starter/types";

export const useCompanies = (
  query?: Record<string, any>
): {
  data: AdminCompaniesResponse | null;
  refetch: () => void;
  loading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<AdminCompaniesResponse | null>(null);
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
        const result: AdminCompaniesResponse = await sdk.client.fetch(
          "/admin/companies" + (filterQuery ? `?${filterQuery}` : ""),
          {
            method: "GET",
          }
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

    fetchCompanies();
  }, [refetchTrigger]);

  return { data, refetch, loading, error };
};

export const useCompany = (
  companyId: string,
  query?: Record<string, any>
): {
  data: AdminCompanyResponse | null;
  refetch: () => void;
  loading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<AdminCompanyResponse | null>(null);
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
        const result: AdminCompanyResponse = await sdk.client.fetch(
          `/admin/companies/${companyId}` +
            (filterQuery ? `?${filterQuery}` : ""),
          {
            method: "GET",
          }
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

    fetchCompanies();
  }, [refetchTrigger]);

  return { data, refetch, loading, error };
};

export const useCreateCompany = (): {
  mutate: (company: AdminCreateCompany) => Promise<AdminCompanyResponse>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (company: CreateCompanyDTO) => {
    setLoading(true);
    setError(null);

    try {
      const result: AdminCompanyResponse = await sdk.client.fetch(
        "/admin/companies",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: company,
        }
      );

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
  mutate: (company: AdminUpdateCompany) => Promise<AdminCompanyResponse>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (company: AdminUpdateCompany) => {
    setLoading(true);
    setError(null);

    try {
      const result: AdminCompanyResponse = await sdk.client.fetch(
        `/admin/companies/${companyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: company,
        }
      );

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
      await sdk.client.fetch(`/admin/companies/${companyId}`, {
        method: "DELETE",
      });
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

export const useAddCompanyToCustomerGroup = (
  companyId: string
): {
  mutate: (groupId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (groupId: string) => {
    setLoading(true);
    setError(null);

    try {
      await sdk.client.fetch(`/admin/companies/${companyId}/customer-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { group_id: groupId },
      });
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

export const useRemoveCompanyFromCustomerGroup = (
  companyId: string
): {
  mutate: (groupId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (groupId: string) => {
    setLoading(true);
    setError(null);

    try {
      await sdk.client.fetch(
        `/admin/companies/${companyId}/customer-group/${groupId}`,
        {
          method: "DELETE",
        }
      );
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
