import { zodResolver } from "@hookform/resolvers/zod";
import { AdminOrderPreview } from "@medusajs/framework/types";
import {
  Button,
  clx,
  Container,
  Heading,
  Select,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { Form } from "../../../components/common/form";
import { QuoteItem } from "../../../components/quotes";
import { useCreateQuoteComment } from "../../../hooks/api/quotes";

export const CreateQuoteCommentForm = z.object({
  text: z.string().min(1),
  item_id: z.string().nullish(),
});

export function QuoteMessages({
  quote,
  preview,
}: {
  quote: any;
  preview: AdminOrderPreview;
}) {
  const { quoteId } = useParams();

  /**
   * FORM
   */
  const form = useForm<z.infer<typeof CreateQuoteCommentForm>>({
    defaultValues: () =>
      Promise.resolve({
        text: "",
        item_id: null,
      }),
    resolver: zodResolver(CreateQuoteCommentForm),
  });

  const { mutateAsync: createMessage, isPending: isCreatingMessage } =
    useCreateQuoteComment(quoteId!);

  const originalItemsMap = useMemo(() => {
    return new Map(quote?.draft_order?.items?.map((item) => [item.id, item]));
  }, [quote?.draft_order]);

  const previewItemsMap = useMemo(() => {
    return new Map(preview?.items?.map((item) => [item.id, item]));
  }, [preview]);

  const handleCreateMessage = async () => {
    await createMessage(
      {},
      {
        onSuccess: () => toast.success("Successfully sent message to customer"),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    await createMessage(
      {
        text: data.text,
        item_id: data.item_id,
      },
      {
        onSuccess: () => {
          form.reset();
          toast.success("Successfully sent message to customer");
        },
        onError: (e) => toast.error(e.message),
      }
    );
  });

  return (
    <Container className="divide-y divide-dashed p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Messages</Heading>
      </div>

      <div>
        {quote.comments?.map((comment) => (
          <div
            key={comment.id}
            className={clx("px-6 py-4 text-sm flex flex-col gap-y-2", {
              "!bg-ui-bg-subtle !inset-x-5 !inset-y-3": !!comment.admin_id,
            })}
          >
            <div className="font-medium font-sans txt-compact-small text-ui-fg-subtle ">
              {!!comment.admin &&
                `${comment.admin.first_name} ${comment.admin.last_name}`}

              {!!comment.customer &&
                `${comment.customer.first_name} ${comment.customer.last_name}`}
            </div>

            {!!comment.item_id && (
              <div className="border border-dashed border-neutral-400 my-2">
                <QuoteItem
                  item={previewItemsMap.get(comment.item_id)!}
                  originalItem={originalItemsMap.get(comment.item_id)!}
                  currencyCode={quote.draft_order.currency_code}
                />
              </div>
            )}

            <div>{comment.text}</div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-5 pb-3">
        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
            <Form.Field
              control={form.control}
              name="item_id"
              render={({ field: { onChange, ref, ...field } }) => {
                return (
                  <Form.Item>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Form.Label>Pick Quote Item</Form.Label>
                        <Form.Hint>
                          Select a quote item to write a message around
                        </Form.Hint>
                      </div>
                      <div className="flex-1">
                        <Form.Control>
                          <Select onValueChange={onChange} {...field}>
                            <Select.Trigger className="bg-ui-bg-base" ref={ref}>
                              <Select.Value placeholder="Select Item" />
                            </Select.Trigger>
                            <Select.Content>
                              {preview.items.map((l) => (
                                <Select.Item key={l.id} value={l.id}>
                                  {l.variant_sku}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </Form.Control>
                      </div>
                    </div>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />

            <Form.Field
              name={`text`}
              render={({ field: { ref, ...field } }) => {
                return (
                  <Form.Item>
                    <Form.Control>
                      <Textarea {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />

            <Button
              size="small"
              type="submit"
              className="self-end"
              disabled={isCreatingMessage}
              onClick={() => handleCreateMessage}
            >
              Send
            </Button>
          </form>
        </Form>
      </div>
    </Container>
  );
}
