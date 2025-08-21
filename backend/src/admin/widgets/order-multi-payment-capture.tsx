import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Button, Container, Heading, Input, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { sdk } from "../lib/client";
import { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types";

const formatCurrency = (amount: number, currency?: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const PartialCaptureWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const [amount, setAmount] = useState("");
  const [captures, setCaptures] = useState<
    { id: string; created_at: string; amount: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [orderCurrency, setOrderCurrency] = useState<string>(data?.currency_code || "USD");

  const paymentCollection = data.payment_collections.find((pc) =>
    pc.payments?.find((p) => p.provider_id === "pp_system_default")
  );

  const payment = paymentCollection?.payments?.[0];
  const currency = orderCurrency || payment?.currency_code || "usd";

  const fetchOrderTotals = async () => {
    if (!data?.id) return;
    try {
      const totals = await sdk.client.fetch<{
        id: string;
        currency_code: string;
        subtotal: number;
        shipping_total: number;
        tax_total: number;
        total: number;
      }>(`/admin/orders/${data.id}/totals`, { method: "GET" });
      setOrderTotal(totals.total || 0);
      setOrderCurrency(totals.currency_code || data?.currency_code || "USD");
    } catch (e) {
      setOrderTotal((data as any)?.total || 0);
    }
  };

  const fetchCaptures = async () => {
    if (!payment?.id) return;
    try {
      const res = await sdk.client.fetch<{
        captures: { id: string; amount: number; created_at: string }[];
      }>(`/admin/payments/${payment.id}/partial-capture`, {
        method: "GET",
      });
      setCaptures(res.captures || []);
    } catch (err) {
      console.error("Failed to fetch captures", err);
    }
  };

  const handleDeleteCapture = async (captureId: string) => {
    if (!payment?.id) return;
    setLoading(true);
    try {
      await sdk.client.fetch(`/admin/payments/${payment.id}/partial-capture?capture_id=${captureId}`, {
        method: "DELETE",
      });
      await Promise.all([fetchCaptures(), fetchOrderTotals()]);
    } catch (err) {
      console.error("Failed to delete capture", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) return;

    setLoading(true);
    try {
      await sdk.client.fetch(`/admin/payments/${payment?.id}/partial-capture`, {
        method: "POST",
        body: {
          amount: numericAmount,
        },
      });
      setAmount("");
      await Promise.all([fetchCaptures(), fetchOrderTotals()]);
    } catch (err) {
      console.error("Capture failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptures();
    fetchOrderTotals();
  }, [payment?.id, data?.id]);

  const capturedTotal = captures.reduce((sum, c) => sum + c.amount, 0);
  const outstanding = Math.max(orderTotal - capturedTotal, 0);

  return (
    <Container className="p-6 space-y-6">
      <Heading level="h2">💳 Partial Payment Capture</Heading>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-ui-bg-base rounded-lg border">
          <Text className="font-semibold text-sm text-ui-fg-subtle mb-1">
            Order Total
          </Text>
          <Text className="text-lg font-medium text-ui-fg-base">
            {formatCurrency(orderTotal, currency)}
          </Text>
        </div>
        <div className="p-4 bg-ui-bg-base rounded-lg border">
          <Text className="font-semibold text-sm text-ui-fg-subtle mb-1">
            Captured Amount
          </Text>
          <Text className="text-lg font-medium text-ui-fg-base">
            {formatCurrency(capturedTotal, currency)}
          </Text>
        </div>
        <div className="p-4 bg-ui-bg-base rounded-lg border">
          <Text className="font-semibold text-sm text-ui-fg-subtle mb-1">
            Outstanding
          </Text>
          <Text className="text-lg font-medium text-ui-fg-base">
            {formatCurrency(outstanding, currency)}
          </Text>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          variant="primary"
          isLoading={loading}
          onClick={handleCapture}
          disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0 || Number(amount) > outstanding}
        >
          Capture
        </Button>
      </div>

      <div className="space-y-2">
        <Heading level="h3">📜 Capture History</Heading>
        <div className="border rounded-lg divide-y bg-ui-bg-base">
          {captures.length === 0 ? (
            <Text className="p-4 text-ui-fg-subtle">No captures yet.</Text>
          ) : (
            captures.map((c, i) => (
              <div
                key={c.id}
                className="flex justify-between px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <Text className="text-ui-fg-base">
                    {i + 1}. {new Date(c.created_at).toLocaleString()}
                  </Text>
                  <Text className="font-medium text-ui-fg-base">
                    {formatCurrency(c.amount, currency)}
                  </Text>
                </div>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDeleteCapture(c.id)}
                  disabled={loading}
                >
                  ×
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.after",
});

export default PartialCaptureWidget;
