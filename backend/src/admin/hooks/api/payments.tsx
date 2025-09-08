import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../lib/client";

interface UsePaymentsParams {
  limit?: number;
  offset?: number;
  q?: string;
  order?: string;
}

interface OrderPaymentData {
  order_id: string;
  order_number: number;
  order_date: string;
  customer_name: string;
  company_name: string;
  email: string;
  order_total: number;
  total_paid: number;
  outstanding_amount: number;
  reminder_last_sent_at: string | null;
}

interface PaymentsResponse {
  orders: OrderPaymentData[];
  count: number;
  offset: number;
  limit: number;
}

export const usePayments = (params: UsePaymentsParams = {}) => {
  const { limit = 50, offset = 0, q, order = "-created_at" } = params;

  return useQuery({
    queryKey: ["payments", { limit, offset, q, order }],
    queryFn: async (): Promise<PaymentsResponse> => {
      const searchParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        order,
      });

      if (q) {
        searchParams.append("q", q);
      }

      const response = await sdk.client.fetch<PaymentsResponse>(
        `/admin/payments?${searchParams.toString()}`,
        {
          method: "GET",
        }
      );

      console.log("Payments API response:", response);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSendReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await sdk.client.fetch(
        `/admin/payments/send-reminder`,
        {
          method: "POST",
          body: { order_id: orderId },
        }
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch payments data to update the reminder timestamp
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};
