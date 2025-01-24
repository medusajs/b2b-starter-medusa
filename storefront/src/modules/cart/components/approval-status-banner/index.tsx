import { CheckMini, LockClosedSolid, XMarkMini } from "@medusajs/icons"
import { Container, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ApprovalStatus,
  ApprovalType,
  StoreApproval,
} from "@starter/types/approval"

const ApprovalStatusBanner = ({
  approvals,
}: {
  approvals: StoreApproval[]
}) => {
  const cartHasPendingApproval = approvals.some(
    (approval) => approval.status === ApprovalStatus.PENDING
  )

  const cartIsApproved = approvals.some(
    (approval) => approval.status === ApprovalStatus.APPROVED
  )

  const cartIsRejected =
    approvals.some((approval) => approval.status === ApprovalStatus.REJECTED) &&
    !cartHasPendingApproval &&
    !cartIsApproved

  if (cartIsApproved) {
    return null
  }

  return (
    <Container className="flex gap-2 self-stretch relative w-full h-fit overflow-hidden items-center">
      {cartHasPendingApproval && (
        <>
          <LockClosedSolid className="w-4 h-4" />
          <Text className="text-left">
            This cart is locked for approval by a{" "}
            {approvals[0].type === ApprovalType.ADMIN
              ? "company admin"
              : "sales manager"}
            .
          </Text>
        </>
      )}

      {cartIsRejected && (
        <>
          <XMarkMini className="w-4 h-4" />
          <Text className="text-left">
            This cart has been rejected by a{" "}
            {approvals[0].type === ApprovalType.ADMIN
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
