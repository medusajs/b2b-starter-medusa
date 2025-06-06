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

  const paymentCollection = data.payment_collections.find((pc) =>
    pc.payments?.find((p) => p.provider_id === "pp_system_default")
  );

  const payment = paymentCollection?.payments?.[0];
  const total = payment?.amount ?? 0;
  const currency = payment?.currency_code ?? "usd";

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
      await fetchCaptures();
    } catch (err) {
      console.error("Capture failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptures();
  }, [payment?.id]);

  const capturedTotal = captures.reduce((sum, c) => sum + c.amount, 0);
  const outstanding = total - capturedTotal;

  const isInvalidAmount =
    !amount ||
    isNaN(Number(amount)) ||
    Number(amount) > outstanding ||
    Number(amount) <= 0;

  return (
    <Container className="p-6 space-y-6">
      <Heading level="h2">💳 Partial Payment Capture</Heading>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border">
          <Text className="font-semibold text-sm text-gray-500 mb-1">
            Total Amount
          </Text>
          <Text className="text-lg font-medium">
            {formatCurrency(total, currency)}
          </Text>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border">
          <Text className="font-semibold text-sm text-gray-500 mb-1">
            Captured Amount
          </Text>
          <Text className="text-lg font-medium">
            {formatCurrency(capturedTotal, currency)}
          </Text>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border">
          <Text className="font-semibold text-sm text-gray-500 mb-1">
            Outstanding
          </Text>
          <Text className="text-lg font-medium">
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
          className=""
        />
        <Button
          variant="primary"
          isLoading={loading}
          onClick={handleCapture}
          disabled={isInvalidAmount}
        >
          Capture
        </Button>
      </div>

      <div className="space-y-2">
        <Heading level="h3">📜 Capture History</Heading>
        <div className="border rounded-lg divide-y bg-white">
          {captures.length === 0 ? (
            <Text className="p-4 text-gray-500">No captures yet.</Text>
          ) : (
            captures.map((c, i) => (
              <div
                key={c.id}
                className="flex justify-between px-4 py-3 text-sm"
              >
                <Text className="text-gray-700">
                  {i + 1}. {new Date(c.created_at).toLocaleString()}
                </Text>
                <Text className="font-medium">
                  {formatCurrency(c.amount, currency)}
                </Text>
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
