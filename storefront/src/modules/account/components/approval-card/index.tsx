import { retrieveCart } from "@/lib/data/cart"
import { convertToLocale } from "@/lib/util/money"
import ApprovalCardActions from "@/modules/account/components/approval-card-actions"
import CalendarIcon from "@/modules/common/icons/calendar"
import DocumentIcon from "@/modules/common/icons/document"
import { ApprovalStatusType } from "@/types/approval"
import { B2BCart } from "@/types/global"
import { CheckMini, XMarkMini } from "@medusajs/icons"
import { clx, Container, Text } from "@medusajs/ui"
import Image from "next/image"

type ApprovalCardProps = {
  cartWithApprovals: B2BCart
  type?: "admin" | "customer"
}

export default async function ApprovalCard({
  cartWithApprovals,
  type = "customer",
}: ApprovalCardProps) {
  const cart = await retrieveCart(cartWithApprovals.id)

  if (!cart) {
    return null
  }

  const createdAt = new Date(cart.created_at!)
  const updatedAt = new Date(cart.updated_at!)

  const numberOfLines = cart.items?.length ?? 0

  return (
    <Container className="bg-white flex small:flex-row flex-col p-4 rounded-md small:justify-between small:items-center gap-y-2 items-start">
      <div className="flex gap-x-4 items-center pl-3">
        <div className="flex min-w-10">
          {cart.items?.slice(0, 3).map((i, index) => {
            const numItems = cart.items?.length ?? 0

            return (
              <div
                key={i.id}
                className={clx(
                  "block w-7 h-7 border border-white bg-neutral-100 p-2 bg-cover bg-center rounded-md ml-[-5px]",
                  {
                    "-rotate-3": index === 0 && numItems > 1,
                    "rotate-0": index === 0 && numItems === 1,
                    "rotate-3":
                      (index === 1 && numItems === 2) ||
                      (index === 2 && numItems > 2),
                  }
                )}
              >
                <Image
                  src={i.thumbnail!}
                  alt={i.title}
                  className={clx("h-full w-full object-cover object-center", {
                    "-rotate-3": index === 0 && numItems > 1,
                    "rotate-0": index === 0 && numItems === 1,
                    "rotate-3":
                      (index === 1 && numItems === 2) ||
                      (index === 2 && numItems > 2),
                  })}
                  draggable={false}
                  quality={50}
                  width={20}
                  height={20}
                />
              </div>
            )
          })}
        </div>

        <div
          className="flex pr-2 text-small-regular items-center"
          data-testid="order-created-at"
        >
          <CalendarIcon className="inline-block mr-1" />
          {createdAt.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })}
        </div>

        <div className="flex items-center text-small-regular">
          <DocumentIcon className="inline-block mr-1" />
          <span data-testid="order-display-id">#{cart.id.slice(-4)}</span>
        </div>
        {cartWithApprovals.approval_status?.status ===
        ApprovalStatusType.APPROVED ? (
          cartWithApprovals.completed_at ? (
            <Text className="flex items-center gap-x-1 text-xs text-grey-500">
              <CheckMini className="inline-block" />
              Order completed at{" "}
              {updatedAt.toLocaleDateString("en-GB", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
              })}
            </Text>
          ) : (
            <Text className="flex items-center gap-x-1 text-xs text-grey-500">
              Approved at{" "}
              {updatedAt.toLocaleDateString("en-GB", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
              })}
              <CheckMini className="inline-block" />
            </Text>
          )
        ) : null}

        {cartWithApprovals.approval_status?.status ===
          ApprovalStatusType.REJECTED && (
          <div className="flex items-center text-small-regular">
            <XMarkMini className="inline-block mr-1" />
            <span data-testid="order-display-id">
              Rejected at{" "}
              {updatedAt.toLocaleDateString("en-GB", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-x-4 divide-gray-200 small:justify-normal justify-between w-full small:w-auto">
        <div className="flex items-center text-small-regular text-ui-fg-base">
          <span className="px-2" data-testid="order-amount">
            {convertToLocale({
              amount: cart.total,
              currency_code: cart.currency_code,
            })}
          </span>
          {"·"}
          <span className="px-2">{`${numberOfLines} ${
            numberOfLines > 1 ? "items" : "item"
          }`}</span>
          {type === "admin" && (
            <ApprovalCardActions cartWithApprovals={cartWithApprovals} />
          )}
        </div>
      </div>
    </Container>
  )
}
