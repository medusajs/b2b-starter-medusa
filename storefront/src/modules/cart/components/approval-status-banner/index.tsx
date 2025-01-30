import { retrieveCustomer } from "@lib/data/customer"
import { getCartApprovalStatus } from "@lib/util/get-cart-approval-status"
import { LockClosedSolid, XMarkMini } from "@medusajs/icons"
import { Container, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { B2BCart } from "@starter/types/global"
import Button from "@modules/common/components/button"
import { updateApproval } from "@lib/data/approvals"

const ApprovalStatusBanner = ({ cart }: { cart: B2BCart }) => {
  const { isPendingApproval, isApproved, isRejected } =
    getCartApprovalStatus(cart)

  if (isApproved || (!isPendingApproval && !isRejected)) {
    return null
  }

  return (
    <Container className="flex gap-2 self-stretch relative w-full h-fit overflow-hidden items-center">
      {isPendingApproval && (
        <>
          <LockClosedSolid className="w-4 h-4" />
          <Text className="text-left">
            This cart is locked for approval by a{" "}
            {cart.company.approval_settings.requires_admin_approval
              ? "company admin"
              : "sales manager"}
            .
          </Text>
        </>
      )}

      {isRejected && (
        <>
          <XMarkMini className="w-4 h-4" />
          <Text className="text-left">
            This cart has been rejected by a{" "}
            {cart.company.approval_settings.requires_admin_approval
              ? "company admin"
              : "sales manager"}
            . You can re-request approval from the{" "}
            <LocalizedClientLink
              href="/checkout"
              className="text-ui-bg-interactive hover:text-ui-fg-interactive-hover"
            >
              checkout page
            </LocalizedClientLink>
            .
          </Text>
        </>
      )}
    </Container>
  )
}

export default ApprovalStatusBanner
