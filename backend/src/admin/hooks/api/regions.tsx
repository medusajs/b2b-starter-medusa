import { HttpTypes } from "@medusajs/framework/types";
import { FetchError } from "@medusajs/js-sdk";
import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { sdk } from "../../lib/client";
import { queryKeysFactory } from "../../lib/query-key-factory";

export const regionQueryKey = queryKeysFactory("regions");

type RegionsResponse = {
  regions: HttpTypes.AdminRegion[];
};

export const useRegions = (
  options?: Omit<
    UseQueryOptions<RegionsResponse, FetchError, RegionsResponse, QueryKey>,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.region.list(),
    queryKey: regionQueryKey.list(),
    ...options,
  });

  return { ...data, ...rest };
};
