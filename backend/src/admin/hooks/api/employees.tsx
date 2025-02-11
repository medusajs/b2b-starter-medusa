import { FetchError } from "@medusajs/js-sdk";
import {
  AdminCreateEmployee,
  AdminEmployeeResponse,
  AdminEmployeesResponse,
  AdminUpdateEmployee,
} from "../../../types";
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { sdk } from "../../lib/client";
import { queryKeysFactory } from "../../lib/query-key-factory";

export const employeeQueryKey = queryKeysFactory("employee");

export const useEmployees = (
  companyId: string,
  query?: Record<string, any>,
  options?: UseQueryOptions<
    AdminEmployeesResponse,
    FetchError,
    AdminEmployeesResponse,
    QueryKey
  >
) => {
  const filterQuery = new URLSearchParams(query).toString();

  const fetchEmployees = async () =>
    sdk.client.fetch<AdminEmployeesResponse>(
      `/admin/companies/${companyId}/employees${
        filterQuery ? `?${filterQuery}` : ""
      }`,
      {
        method: "GET",
      }
    );

  return useQuery({
    queryKey: employeeQueryKey.list(companyId),
    queryFn: fetchEmployees,
    ...options,
  });
};

export const useCreateEmployee = (
  companyId: string,
  options?: UseMutationOptions<
    AdminEmployeeResponse,
    FetchError,
    AdminCreateEmployee
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: AdminCreateEmployee) =>
      sdk.client.fetch<AdminEmployeeResponse>(
        `/admin/companies/${companyId}/employees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: employee,
        }
      ),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: employeeQueryKey.list(companyId),
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateEmployee = (
  companyId: string,
  employeeId: string,
  options?: UseMutationOptions<
    AdminEmployeeResponse,
    FetchError,
    AdminUpdateEmployee
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: AdminUpdateEmployee) =>
      sdk.client.fetch<AdminEmployeeResponse>(
        `/admin/companies/${companyId}/employees/${employeeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: employee,
        }
      ),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: employeeQueryKey.detail(employeeId),
      });
      queryClient.invalidateQueries({
        queryKey: employeeQueryKey.list(companyId),
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteEmployee = (
  companyId: string,
  options?: UseMutationOptions<void, FetchError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: string) =>
      sdk.client.fetch<void>(
        `/admin/companies/${companyId}/employees/${employeeId}`,
        {
          method: "DELETE",
        }
      ),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: employeeQueryKey.list(companyId),
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
