import {
  acceptQuote,
  createQuote,
  fetchQuote,
  fetchQuotePreview,
  fetchQuotes,
  rejectQuote,
} from "@lib/api/quotes"
import { FetchError } from "@medusajs/js-sdk"
import { HttpTypes } from "@medusajs/types"
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"
import { GeneralQuoteType } from "types/global"

const QuoteQueryKeys = {
  fetchQuote: "fetchQuote",
  fetchQuotes: "fetchQuotes",
  fetchQuotePreview: "fetchQuotePreview",
}

export const useQuotes = (
  query?: GeneralQuoteType,
  options?: UseQueryOptions<
    GeneralQuoteType,
    FetchError,
    { quotes: GeneralQuoteType[] },
    QueryKey
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => fetchQuotes(query),
    queryKey: [QuoteQueryKeys.fetchQuotes],
    ...options,
  })

  return { ...data, ...rest }
}

export const useQuote = (
  id: string,
  query?: GeneralQuoteType,
  options?: UseQueryOptions<
    GeneralQuoteType,
    FetchError,
    { quote: GeneralQuoteType },
    QueryKey
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => fetchQuote(id, query),
    queryKey: [QuoteQueryKeys.fetchQuote],
    ...options,
  })

  return { ...data, ...rest }
}

export const useQuotePreview = (
  id: string,
  query?: HttpTypes.AdminOrderFilters,
  options?: UseQueryOptions<
    GeneralQuoteType,
    FetchError,
    { preview: GeneralQuoteType },
    QueryKey
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => fetchQuotePreview(id, query),
    queryKey: [QuoteQueryKeys.fetchQuotePreview],
    ...options,
  })

  return { ...data, ...rest }
}

export const useCreateQuote = (
  options?: UseMutationOptions<GeneralQuoteType, FetchError, GeneralQuoteType>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => createQuote(),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: [QuoteQueryKeys.fetchQuote] })
      queryClient.invalidateQueries({ queryKey: [QuoteQueryKeys.fetchQuotes] })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useAcceptQuote = (
  id: string,
  options?: UseMutationOptions<GeneralQuoteType, FetchError, GeneralQuoteType>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => acceptQuote(id),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: [QuoteQueryKeys.fetchQuote] })
      queryClient.invalidateQueries({ queryKey: [QuoteQueryKeys.fetchQuotes] })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useRejectQuote = (
  id: string,
  options?: UseMutationOptions<GeneralQuoteType, FetchError, GeneralQuoteType>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => rejectQuote(id),
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: [QuoteQueryKeys.fetchQuote] })
      queryClient.invalidateQueries({ queryKey: [QuoteQueryKeys.fetchQuotes] })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
