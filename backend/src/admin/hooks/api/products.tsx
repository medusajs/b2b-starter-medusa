import { FetchError } from "@medusajs/js-sdk";
import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeysFactory } from "../../lib/query-key-factory";
import { sdk } from "../../lib/client";

const PRODUCT_QUERY_KEY = "product" as const;
export const productQueryKeys = queryKeysFactory(PRODUCT_QUERY_KEY);

export const useProducts = (
  query?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<any, FetchError, any, QueryKey>,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.product.list(query),
    queryKey: productQueryKeys.list(query),
    ...options,
  });

  return { ...data, ...rest };
}; 