import { LockClosedSolid } from "@medusajs/icons"
import { Button, Container, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ApprovalType, StoreApproval } from "@starter/types/approval"

const ApprovalStatus = ({ approval }: { approval: StoreApproval }) => {
  return (
    <Container className="flex gap-2 self-stretch relative w-full h-fit overflow-hidden items-center">
      <LockClosedSolid className="w-4 h-4" />
      <Text className="text-left">
        This cart is locked for approval by a{" "}
        {approval.type === ApprovalType.ADMIN
          ? "company admin"
          : "sales manager"}
        .
      </Text>
    </Container>
  )
}

export default ApprovalStatus
