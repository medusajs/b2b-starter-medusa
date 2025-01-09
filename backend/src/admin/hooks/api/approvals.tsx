import { FetchError } from "@medusajs/js-sdk";
import {
  AdminApprovalSettings,
  AdminUpdateApprovalSettings,
} from "@starter/types";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { sdk } from "../../lib/client";
import { queryKeysFactory } from "../../lib/query-key-factory";

export const approvalQueryKey = queryKeysFactory("approval");

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
        queryKey: approvalQueryKey.detail(companyId),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
