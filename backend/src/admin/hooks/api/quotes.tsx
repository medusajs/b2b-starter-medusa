import { HttpTypes } from "@medusajs/framework/types";
import { ClientHeaders, FetchError } from "@medusajs/js-sdk";
import {
  AdminCreateQuoteMessage,
  AdminQuoteResponse,
  QuoteFilterParams,
  StoreQuoteResponse,
  StoreQuotesResponse,
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
import { orderPreviewQueryKey } from "./order-preview";

export const quoteQueryKey = queryKeysFactory("quote");

export const useQuotes = (
  query: QuoteFilterParams,
  options?: UseQueryOptions<
    StoreQuotesResponse,
    FetchError,
    StoreQuotesResponse,
    QueryKey
  >
) => {
  const fetchQuotes = (query: QuoteFilterParams, headers?: ClientHeaders) =>
    sdk.client.fetch<StoreQuotesResponse>(`/admin/quotes`, {
      query,
      headers,
    });

  const { data, ...rest } = useQuery({
    ...options,
    queryFn: () => fetchQuotes(query)!,
    queryKey: quoteQueryKey.list(),
  });

  return { ...data, ...rest };
};

export const useQuote = (
  id: string,
  query?: QuoteFilterParams,
  options?: UseQueryOptions<
    StoreQuoteResponse,
    FetchError,
    StoreQuoteResponse,
    QueryKey
  >
) => {
  const fetchQuote = (
    id: string,
    query?: QuoteFilterParams,
    headers?: ClientHeaders
  ) =>
    sdk.client.fetch<StoreQuoteResponse>(`/admin/quotes/${id}`, {
      query,
      headers,
    });

  const { data, ...rest } = useQuery({
    queryFn: () => fetchQuote(id, query),
    queryKey: quoteQueryKey.detail(id),
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

export const useSendQuote = (
  id: string,
  options?: UseMutationOptions<AdminQuoteResponse, FetchError, void>
) => {
  const queryClient = useQueryClient();

  const sendQuote = async (id: string) =>
    sdk.client.fetch<AdminQuoteResponse>(`/admin/quotes/${id}/send`, {
      method: "POST",
    });

  return useMutation({
    mutationFn: () => sendQuote(id),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: orderPreviewQueryKey.details(),
      });

      queryClient.invalidateQueries({
        queryKey: quoteQueryKey.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: quoteQueryKey.lists(),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useRejectQuote = (
  id: string,
  options?: UseMutationOptions<AdminQuoteResponse, FetchError, void>
) => {
  const queryClient = useQueryClient();

  const rejectQuote = async (id: string) =>
    sdk.client.fetch<AdminQuoteResponse>(`/admin/quotes/${id}/reject`, {
      method: "POST",
    });

  return useMutation({
    mutationFn: () => rejectQuote(id),
    onSuccess: (data: AdminQuoteResponse, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: orderPreviewQueryKey.details(),
      });

      queryClient.invalidateQueries({
        queryKey: quoteQueryKey.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: quoteQueryKey.lists(),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useCreateQuoteMessage = (
  id: string,
  options?: UseMutationOptions<
    AdminQuoteResponse,
    FetchError,
    AdminCreateQuoteMessage
  >
) => {
  const queryClient = useQueryClient();

  const sendQuote = async (id: string, body: AdminCreateQuoteMessage) =>
    sdk.client.fetch<AdminQuoteResponse>(`/admin/quotes/${id}/messages`, {
      body,
      method: "POST",
    });

  return useMutation({
    mutationFn: (body) => sendQuote(id, body),
    onSuccess: (data: AdminQuoteResponse, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: quoteQueryKey.details(),
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
