import { FetchError } from "@medusajs/js-sdk";
import {
  AdminCompaniesResponse,
  AdminCompanyResponse,
  AdminCreateCompany,
  AdminUpdateCompany,
} from "../../../types";
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { queryKeysFactory } from "../../lib/query-key-factory";
import { sdk } from "../../lib/client";

export const companyQueryKey = queryKeysFactory("company");

export const useCompanies = (
  query?: Record<string, any>,
  options?: UseQueryOptions<
    AdminCompaniesResponse,
    FetchError,
    AdminCompaniesResponse,
    QueryKey
  >
) => {
  const filterQuery = new URLSearchParams(query).toString();

  const fetchCompanies = async () =>
    sdk.client.fetch<AdminCompaniesResponse>(
      `/admin/companies${filterQuery ? `?${filterQuery}` : ""}`,
      {
        method: "GET",
      }
    );

  return useQuery({
    queryKey: companyQueryKey.list(query),
    queryFn: fetchCompanies,
    ...options,
  });
};

export const useCompany = (
  companyId: string,
  query?: Record<string, any>,
  options?: UseQueryOptions<
    AdminCompanyResponse,
    FetchError,
    AdminCompanyResponse,
    QueryKey
  >
) => {
  const filterQuery = new URLSearchParams(query).toString();

  const fetchCompany = async () =>
    sdk.client.fetch<AdminCompanyResponse>(
      `/admin/companies/${companyId}${filterQuery ? `?${filterQuery}` : ""}`,
      {
        method: "GET",
      }
    );

  return useQuery({
    queryKey: companyQueryKey.detail(companyId),
    queryFn: fetchCompany,
    ...options,
  });
};

export const useCreateCompany = (
  options?: UseMutationOptions<
    AdminCompanyResponse,
    FetchError,
    AdminCreateCompany
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (company: AdminCreateCompany) =>
      sdk.client.fetch<AdminCompanyResponse>("/admin/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: company,
      }),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: companyQueryKey.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: companyQueryKey.detail(data.id),
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateCompany = (
  companyId: string,
  options?: UseMutationOptions<
    AdminCompanyResponse,
    FetchError,
    AdminUpdateCompany
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (company: AdminUpdateCompany) =>
      sdk.client.fetch<AdminCompanyResponse>(`/admin/companies/${companyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: company,
      }),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: companyQueryKey.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: companyQueryKey.detail(companyId),
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteCompany = (
  companyId: string,
  options?: UseMutationOptions<void, FetchError>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      sdk.client.fetch<void>(`/admin/companies/${companyId}`, {
        method: "DELETE",
      }),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: companyQueryKey.lists(),
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useAddCompanyToCustomerGroup = (
  companyId: string,
  options?: UseMutationOptions<void, FetchError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) =>
      sdk.client.fetch(`/admin/companies/${companyId}/customer-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { group_id: groupId },
      }),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: companyQueryKey.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: companyQueryKey.detail(companyId),
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useRemoveCompanyFromCustomerGroup = (
  companyId: string,
  options?: UseMutationOptions<void, FetchError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) =>
      sdk.client.fetch(
        `/admin/companies/${companyId}/customer-group/${groupId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "text/plain",
          },
        }
      ),
    onSuccess: (_, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: companyQueryKey.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: companyQueryKey.detail(companyId),
      });
      options?.onSuccess?.(undefined, variables, context);
    },
    ...options,
  });
};
