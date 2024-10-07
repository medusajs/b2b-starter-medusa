"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateQuoteMessage } from "@lib/hooks/api/quotes"
import { AdminOrderLineItem, AdminOrderPreview } from "@medusajs/types"
import { Button, clx, Container, Heading, Select, Textarea } from "@medusajs/ui"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { GeneralQuoteType } from "types/global"
import { z } from "zod"
import { QuoteTableItem } from "./quote-table"

export const CreateQuoteCommentForm = z.object({
  text: z.string().min(1),
  item_id: z.string().nullish(),
})

const defaultValues = {
  text: "",
  item_id: undefined,
}

const QuoteMessages = ({
  quote,
  preview,
}: {
  quote: GeneralQuoteType
  preview: AdminOrderPreview
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues,
    resolver: zodResolver(CreateQuoteCommentForm),
  })

  const { mutateAsync: createMessage, isPending: isCreatingMessage } =
    useCreateQuoteMessage(quote.id)

  const handleCreateMessage = (data: GeneralQuoteType) => {
    createMessage(data, { onSettled: () => reset(defaultValues) })
  }

  const originalItemsMap = useMemo(() => {
    return new Map<string, AdminOrderLineItem>(
      quote.draft_order?.items?.map((item: AdminOrderLineItem) => [
        item.id,
        item,
      ])
    )
  }, [quote.draft_order])

  const previewItemsMap = useMemo(() => {
    return new Map<string, AdminOrderLineItem>(
      preview?.items?.map((item: AdminOrderLineItem) => [item.id, item])
    )
  }, [preview])

  return (
    <Container className="divide-y divide-dashed p-0 ">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h3">Messages</Heading>
      </div>

      <div>
        {quote.comments?.map((comment) => (
          <div
            key={comment.id}
            className={clx("px-6 py-4 text-sm flex flex-col gap-y-2", {
              "!bg-ui-bg-subtle !inset-x-5 !inset-y-3": !!comment.customer_id,
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
                <QuoteTableItem
                  key={comment.item_id}
                  item={previewItemsMap.get(comment.item_id)!}
                  originalItem={originalItemsMap.get(comment.item_id)}
                  currencyCode={quote.draft_order.currency_code}
                />
              </div>
            )}

            <div>{comment.text}</div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-5 pb-3">
        <form
          onSubmit={handleSubmit(handleCreateMessage)}
          className="flex flex-col gap-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-x-1">
                <label className="font-sans txt-compact-small font-medium">
                  Pick Quote Item
                </label>
              </div>
              <span
                className="txt-small text-ui-fg-subtle"
                id=":r10:-form-item-description"
              >
                Select a quote item to write a message around
              </span>
            </div>
            <div className="flex-1">
              <Controller
                name="item_id"
                control={control}
                render={({ field: { onChange, ref, value, ...field } }) => (
                  <Select {...field} onValueChange={onChange} value={value}>
                    <Select.Trigger className="bg-ui-bg-base" ref={ref}>
                      <Select.Value />
                      {value ? <Select.Value /> : "Select Item"}
                    </Select.Trigger>

                    <Select.Content>
                      {preview?.items?.map((l) => (
                        <Select.Item key={l.id} value={l.id}>
                          {l.variant_sku}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
              {errors.item_id?.message && <p>{errors.item_id?.message}</p>}
            </div>
          </div>

          <Textarea {...register("text")} />
          {errors.text?.message && <p>{errors.text?.message}</p>}

          <Button
            size="small"
            type="submit"
            className="self-end"
            disabled={isCreatingMessage}
          >
            Send
          </Button>
        </form>
      </div>
    </Container>
  )
}

export default QuoteMessages
