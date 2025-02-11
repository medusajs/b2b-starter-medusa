import { FetchError } from "@medusajs/js-sdk";
import {
  AdminApproval,
  AdminApprovalSettings,
  AdminApprovalsResponse,
  AdminUpdateApproval,
  AdminUpdateApprovalSettings,
} from "../../../types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { sdk } from "../../lib/client";
import { queryKeysFactory } from "../../lib/query-key-factory";
import { companyQueryKey } from "./companies";

export const approvalSettingsQueryKey = queryKeysFactory("approvalSettings");

export const useUpdateApprovalSettings = (
  companyId: string,
  options?: UseMutationOptions<
    AdminApprovalSettings,
    FetchError,
    AdminUpdateApprovalSettings
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminUpdateApprovalSettings) =>
      sdk.client.fetch<AdminUpdateApprovalSettings>(
        `/admin/companies/${companyId}/approval-settings`,
        {
          body: payload,
          method: "POST",
        }
      ),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: approvalSettingsQueryKey.detail(companyId),
      });

      queryClient.invalidateQueries({
        queryKey: companyQueryKey.detail(companyId),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

const approvalQueryKey = queryKeysFactory("approval");

export const useApprovals = (
  query?: Record<string, any>,
  options?: UseQueryOptions<AdminApprovalsResponse, FetchError>
) => {
  const fetchApprovals = async () =>
    sdk.client.fetch<AdminApprovalsResponse>(`/admin/approvals`, {
      method: "GET",
      query,
    });

  return useQuery({
    queryKey: approvalQueryKey.list(query),
    queryFn: fetchApprovals,
    ...options,
  });
};

export const useUpdateApproval = (
  approvalId: string,
  options?: UseMutationOptions<AdminApproval, FetchError, AdminUpdateApproval>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminUpdateApproval) =>
      sdk.client.fetch<AdminApproval>(`/admin/approvals/${approvalId}`, {
        body: payload,
        method: "POST",
      }),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: approvalQueryKey.lists(),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
