import { HttpTypes } from "@medusajs/framework/types";
import { FetchError } from "@medusajs/js-sdk";
import { UseQueryOptions, useQuery, QueryKey } from '@tanstack/react-query';
import { sdk } from '../../lib/client';
import { toast } from "@medusajs/ui";
import { useMutation } from "@tanstack/react-query";


export const useOrders = (
  query?: HttpTypes.AdminOrderFilters,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminOrderListResponse,
      FetchError,
      HttpTypes.AdminOrderListResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.order.list({
      ...query,
      fields: "*customer, *sales_channel",
    }),
    queryKey: ['admin_orders', query], 
    ...options,
  });

  return { ...data, ...rest };
};


export const useGetOrder = (
  id: string,
  query?: HttpTypes.AdminOrderFilters,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminOrderPreviewResponse,
      FetchError,
      HttpTypes.AdminOrderPreviewResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.order.retrieve(id, query),
    queryKey: ['admin_order_preview', id],
    ...options,
  });

  return { ...data, ...rest };
};

export const useStockLocations = (id: string) => {
  return useQuery({
    queryKey: ['admin_stock_locations'],
    queryFn: async () => sdk.admin.stockLocation.retrieve(id),
  });
};

export const useCreateFulfillment = () => {
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      sdk.admin.order.createFulfillment(id, data),
    onSuccess: () => {
      toast.success("Items fulfilled successfully");
      // Optionally refetch order data or navigate
    },
    onError: (error: any) => {
      console.error("Fulfillment failed:", error);
      toast.error("Failed to fulfill items");
    },
  });
};

export const useShippingOptions = () => {
  return useQuery({
    queryKey: ['admin_shipping_options'],
    queryFn: async () => sdk.admin.shippingOption.list({
      
    }),
  });
}

export const useStockLocation = () => {
  return useQuery({
    queryKey: ['admin_stock_location'],
    queryFn: async () => sdk.admin.stockLocation.list(),
  });
}