import { FetchError } from "@medusajs/js-sdk";
import { HttpTypes } from "@medusajs/types";
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

import { ClientHeaders } from "@medusajs/js-sdk/dist/types";
import { sdk } from "../../lib/sdk";
import { orderPreviewQueryKey } from "./order-preview";

export const useQuotes = (
  query?: Record<any, any>,
  options?: Omit<
    UseQueryOptions<
      // TODO: Add params type
      Record<any, any>,
      FetchError,
      // TODO: Add response type
      { quotes: Record<any, any>[] },
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) => {
  const fetchQuotes = async (
    query?: Record<any, any>,
    headers?: ClientHeaders
  ) => {
    return await sdk.client.fetch<Record<any, any>>(`/admin/quotes`, {
      query,
      headers,
    });
  };

  const { data, ...rest } = useQuery({
    queryFn: async () => fetchQuotes(query),
    queryKey: [],
    ...options,
  });

  return { ...data, ...rest };
};

export const useQuote = (
  id: string,
  query?: Record<any, any>,
  options?: Omit<
    UseQueryOptions<
      // TODO: Add params type
      Record<any, any>,
      FetchError,
      // TODO: Add response type
      { quote: Record<any, any> },
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) => {
  const fetchQuote = async (
    id: string,
    query?: Record<any, any>,
    headers?: ClientHeaders
  ) => {
    return await sdk.client.fetch<Record<any, any>>(`/admin/quotes/${id}`, {
      query,
      headers,
    });
  };

  const { data, ...rest } = useQuery({
    queryFn: async () => fetchQuote(id, query),
    queryKey: [],
    ...options,
  });

  return { ...data, ...rest };
};

export const useAddItemsToQuote = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminOrderEditPreviewResponse,
    FetchError,
    HttpTypes.AdminAddOrderEditItems
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: HttpTypes.AdminAddOrderEditItems) =>
      sdk.admin.orderEdit.addItems(id, payload),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: orderPreviewQueryKey.detail(id),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateQuoteItem = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminOrderEditPreviewResponse,
    FetchError,
    HttpTypes.AdminUpdateOrderEditItem & { itemId: string }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      ...payload
    }: HttpTypes.AdminUpdateOrderEditItem & { itemId: string }) => {
      return sdk.admin.orderEdit.updateOriginalItem(id, itemId, payload);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: orderPreviewQueryKey.detail(id),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useRemoveQuoteItem = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminOrderEditPreviewResponse,
    FetchError,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (actionId: string) =>
      sdk.admin.orderEdit.removeAddedItem(id, actionId),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: orderPreviewQueryKey.detail(id),
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateAddedQuoteItem = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminOrderEditPreviewResponse,
    FetchError,
    HttpTypes.AdminUpdateOrderEditItem & { actionId: string }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }: HttpTypes.AdminUpdateOrderEditItem & { actionId: string }) => {
      return sdk.admin.orderEdit.updateAddedItem(id, actionId, payload);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: orderPreviewQueryKey.detail(id),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useConfirmQuote = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminOrderEditPreviewResponse,
    FetchError,
    void
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sdk.admin.orderEdit.request(id),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: orderPreviewQueryKey.details(),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
