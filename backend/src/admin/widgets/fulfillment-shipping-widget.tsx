import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Heading, Input, Table, Text, toast } from "@medusajs/ui";
import { useEffect, useMemo, useState } from "react";
import { sdk } from "../lib/client";

// A simple currency formatter similar to other widgets
const formatCurrency = (amount: number, currency?: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

// Local ephemeral structure to stage shipping price edits per-fulfillment
type FulfillmentPriceDraft = Record<string, string>; // fulfillment_id -> input string

const FulfillmentShippingWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  // Stage shipping price input values by fulfillment id (as strings to avoid locale issues)
  const [draftPrices, setDraftPrices] = useState<FulfillmentPriceDraft>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [generatingInvoiceMap, setGeneratingInvoiceMap] = useState<Record<string, boolean>>({});
  const [invoiceDataMap, setInvoiceDataMap] = useState<Record<string, { invoice_url: string; generated_at: string }>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fulfillments, setFulfillments] = useState<any[]>([]);
  // Initialize orderItems with data.items if available
  const [orderItems, setOrderItems] = useState<any[]>((data as any)?.items || []);
  // Removed order-level tiles; no need to store order totals here

  // Choose a currency; prefer order currency
  const currency = data?.currency_code || "USD";

  // Order items map to enrich fulfillment items with title/SKU
  const orderItemsById = useMemo<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    orderItems.forEach((it: any) => {
      map[it.id] = it;
    });
    return map;
  }, [orderItems]);

  // Load current fulfillment shipping prices and totals
  useEffect(() => {
    const load = async () => {
      if (!data?.id) return;
      setIsLoading(true);
      
      try {
        // Fetch the complete order data with ALL the item details we need
        const orderRes = await sdk.client.fetch<{
          order: {
            id: string;
            items: Array<{
              id: string;
              title: string;
              product_title: string | null;
              variant_sku: string | null;
              thumbnail: string | null;
              variant: {
                sku?: string;
                title?: string;
                product?: {
                  title?: string;
                };
              } | null;
            }>;
          };
        }>(`/admin/orders/${data.id}?fields=id,items.*`, { method: "GET" });

        // Store the fetched order items in state
        if (orderRes?.order?.items) {
          setOrderItems(orderRes.order.items);
        }

        // Then fetch fulfillment data
        const res = await sdk.client.fetch<{
          fulfillments: { id: string; items: { id: string; item_id: string; quantity: number }[]; shipping_price: number }[];
        }>(`/admin/orders/fulfillment/${data.id}`, { method: "GET" });
        
        setFulfillments(res.fulfillments || []);
        
        // Check for existing invoices for each fulfillment
        for (const fulfillment of res.fulfillments || []) {
          await checkInvoiceExists(fulfillment.id);
        }
      } catch (e) {
        console.error("Failed to load fulfillment shipping data", e);
        toast.error("Failed to load fulfillment shipping data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [data?.id]);

  const handlePriceChange = (fulfillmentId: string, value: string) => {
    setDraftPrices((prev) => ({ ...prev, [fulfillmentId]: value }));
  };

  // Generate invoice for fulfillment
  const handleGenerateInvoice = async (fulfillmentId: string, fulfillmentIndex: number) => {
    setGeneratingInvoiceMap((prev) => ({ ...prev, [fulfillmentId]: true }));
    try {
      // Always generate a new invoice (this will update existing ones)
      const res = await sdk.client.fetch<{ invoice_url: string; generated_at: string }>(`/admin/invoice`, {
        method: "POST",
        body: {
          order_id: data.id,
          fulfillment_id: fulfillmentId,
          fulfillment_index: fulfillmentIndex,
        },
      });

      setInvoiceDataMap((prev) => ({ ...prev, [fulfillmentId]: res }));
      toast.success("Invoice generated successfully");
    } catch (e) {
      console.error("Failed to generate invoice", e);
      toast.error("Failed to generate invoice");
    } finally {
      setGeneratingInvoiceMap((prev) => ({ ...prev, [fulfillmentId]: false }));
    }
  };

  // View invoice in new tab
  const handleViewInvoice = (fulfillmentId: string) => {
    const invoiceData = invoiceDataMap[fulfillmentId];
    if (!invoiceData?.invoice_url) {
      toast.error("No invoice available to view");
      return;
    }

    try {
      console.log('Opening invoice in new tab:', invoiceData.invoice_url);
      window.open(invoiceData.invoice_url, '_blank');
      toast.success("Invoice opened in new tab");
    } catch (e) {
      console.error("Failed to open invoice", e);
      toast.error("Failed to open invoice");
    }
  };

  // Check if invoice exists for fulfillment
  const checkInvoiceExists = async (fulfillmentId: string) => {
    try {
      const res = await sdk.client.fetch<{ invoice_url: string; generated_at: string }>(`/admin/invoice?order_id=${data.id}&fulfillment_id=${fulfillmentId}`, {
        method: "GET",
      });
      
      if (res) {
        setInvoiceDataMap((prev) => ({ ...prev, [fulfillmentId]: res }));
      }
    } catch (e) {
      // Invoice doesn't exist yet, which is fine
      console.log("No existing invoice found for fulfillment", fulfillmentId);
    }
  };

  // Save shipping price and refresh totals
  const handleSavePrice = async (fulfillmentId: string) => {
    setSavingMap((prev) => ({ ...prev, [fulfillmentId]: true }));
    try {
      const raw = draftPrices[fulfillmentId];
      const numeric = Number(raw);
      if (!raw || isNaN(numeric) || numeric < 0) {
        toast.error("Enter a valid non-negative price");
        return;
      }

      const priceInCents = Math.round(numeric * 100);
      const shippingMethodId = (data as any)?.shipping_methods?.[0]?.id as string | undefined;
      if (!shippingMethodId) {
        console.error("No shipping method found on order to apply price to");
        toast.error("No shipping method found on order");
        return;
      }

      const res = await sdk.client.fetch<{
        fulfillment_id: string;
        shipping_method_id: string;
        price: number;
      }>(`/admin/orders/fulfillment/${data.id}/shipping`, {
        method: "POST",
        body: {
          fulfillment_id: fulfillmentId,
          shipping_method_id: shippingMethodId,
          price: priceInCents,
        },
      });

      // Clear draft
      setDraftPrices((prev) => ({ ...prev, [fulfillmentId]: "" }));

      // Refresh list to show updated placeholders
      try {
        // Re-fetch order items with all fields
        const orderRes = await sdk.client.fetch<{
          order: {
            id: string;
            items: Array<{
              id: string;
              title: string;
              product_title: string | null;
              variant_sku: string | null;
              thumbnail: string | null;
            }>;
          };
        }>(`/admin/orders/${data.id}?fields=id,items.*`, { method: "GET" });
        
        if (orderRes?.order?.items) {
          setOrderItems(orderRes.order.items);
        }
        
        // Re-fetch fulfillments
        const ref = await sdk.client.fetch<{
          fulfillments: { id: string; items: { id: string; item_id: string; quantity: number }[]; shipping_price: number }[];
        }>(`/admin/orders/fulfillment/${data.id}`, { method: "GET" });
        setFulfillments(ref.fulfillments || []);
        toast.success("Shipping price saved");
      } catch {
        toast.error("Saved, but failed to refresh data");
      }
    } catch (e) {
      console.error("Failed to save shipping price", e);
      toast.error("Failed to save shipping price");
    } finally {
      setSavingMap((prev) => ({ ...prev, [fulfillmentId]: false }));
    }
  };

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text>Loading…</Text>
      </Container>
    );
  }

  if (!fulfillments?.length) {
    return null;
  }

  return (
    <Container className="p-6 space-y-6">
      <Heading level="h2">🚚 Fulfillment Shipping</Heading>
      <Text className="text-ui-fg-subtle">Set a shipping price per fulfillment. This will be used for invoicing and reconciliation.</Text>

      {/* Removed order-level summary tiles */}

      {fulfillments.map((fulfillment, index) => {
        const fulfillmentId = (fulfillment as any).id as string;
        const draft = draftPrices[fulfillmentId] ?? "";
        const isSaving = !!savingMap[fulfillmentId];

        return (
          <Container key={fulfillmentId} className="p-4 space-y-4 border rounded-lg bg-ui-bg-base">
            <div className="flex items-center justify-between">
              <Text size="large" className="font-semibold">
                {`Fulfillment #${index + 1}`}
              </Text>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Shipping price"
                  value={draft}
                  onChange={(e) => handlePriceChange(fulfillmentId, e.target.value)}
                />
                <Button
                  variant="primary"
                  onClick={() => handleSavePrice(fulfillmentId)}
                  isLoading={isSaving}
                  disabled={!draft || Number(draft) < 0}
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleGenerateInvoice(fulfillmentId, index)}
                  isLoading={generatingInvoiceMap[fulfillmentId]}
                  disabled={generatingInvoiceMap[fulfillmentId]}
                >
                  Generate Invoice
                </Button>
                {invoiceDataMap[fulfillmentId] && (
                  <Button
                    variant="secondary"
                    onClick={() => handleViewInvoice(fulfillmentId)}
                    disabled={!invoiceDataMap[fulfillmentId]?.invoice_url}
                  >
                    View Invoice
                  </Button>
                )}
              </div>
            </div>

            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Item</Table.HeaderCell>
                  <Table.HeaderCell>SKU</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Quantity</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(((fulfillment as any).items) || []).map((fi: any) => {
                  const orderItem = orderItemsById[fi.item_id];
                  
                  // Use the direct fields from BaseOrderLineItem
                  const itemTitle = orderItem?.title || "Item";
                  const sku = orderItem?.variant_sku || "—";
                  const productTitle = orderItem?.product_title;
                  
                  return (
                    <Table.Row key={fi.id}>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <Text className="font-medium">{itemTitle}</Text>
                          {productTitle && (
                            <Text className="text-ui-fg-subtle text-xs">{productTitle}</Text>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>{sku}</Table.Cell>
                      <Table.Cell className="text-right">{fi.quantity}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>

            {/* Summary row with shipping price and invoice status */}
            <div className="flex items-center justify-between gap-2 text-sm text-ui-fg-subtle">
              <div>
                {invoiceDataMap[fulfillmentId] && (
                  <Text className="text-green-600">
                    ✓ Invoice generated on {new Date(invoiceDataMap[fulfillmentId].generated_at).toLocaleDateString()}
                  </Text>
                )}
              </div>
              <Text>
                Saved shipping price: {formatCurrency(((fulfillment as any).shipping_price || 0) / 100, currency)}
              </Text>
            </div>
          </Container>
        );
      })}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.after", // render above the payment capture widget
});

export default FulfillmentShippingWidget; 