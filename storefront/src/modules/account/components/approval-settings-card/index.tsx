"use client"

import { updateApprovalSettings } from "@/lib/data/companies"
import Button from "@/modules/common/components/button"
import { B2BCustomer, QueryCompany } from "@/types"
import { InformationCircleSolid } from "@medusajs/icons"
import {
  Container,
  Switch,
  Text,
  Tooltip,
  TooltipProvider,
  clx,
  toast,
} from "@medusajs/ui"
import { useState } from "react"

const ApprovalSettingsCard = ({
  company,
  customer,
}: {
  company: QueryCompany
  customer: B2BCustomer
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { approval_settings } = company

  const [requiresAdminApproval, setRequiresAdminApproval] = useState(
    approval_settings?.requires_admin_approval ?? false
  )

  const handleSave = async () => {
    setIsSaving(true)
    await updateApprovalSettings(company.id, requiresAdminApproval).catch(
      () => {
        toast.error("Error updating approval settings")
      }
    )
    setIsSaving(false)
    setIsEditing(false)

    toast.success("Company updated")
  }

  return (
    <div className="h-fit">
      <Container className="p-0 overflow-hidden">
        <div
          className={clx(
            "grid grid-cols-2 gap-4 border-b border-neutral-200 overflow-hidden transition-all duration-200 ease-in-out p-4"
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSave()
            }
          }}
        >
          <TooltipProvider>
            <div className="flex flex-col gap-y-2">
              <Text className="flex items-center gap-x-2 font-medium text-neutral-950">
                Requires Admin Approval
                <Tooltip content="This setting determines whether orders require admin approval before being processed. If enabled, orders will be held until an admin approves them.">
                  <InformationCircleSolid className="w-4 h-4" />
                </Tooltip>
              </Text>
              <div className="flex items-center gap-x-2 h-3">
                {isEditing ? (
                  <Switch
                    checked={requiresAdminApproval}
                    onCheckedChange={(checked) =>
                      setRequiresAdminApproval(checked)
                    }
                  />
                ) : (
                  <Text className="text-neutral-500">
                    {requiresAdminApproval ? "Yes" : "No"}
                  </Text>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <Text className="flex items-center gap-x-2 font-medium text-neutral-950">
                Requires Sales Manager Approval
                <Tooltip content="This setting determines whether orders require sales manager approval before being processed. If enabled, orders will be held until a sales manager approves them.">
                  <InformationCircleSolid className="w-4 h-4" />
                </Tooltip>
              </Text>
              <div className="flex items-center gap-x-2 h-3">
                <Text className="text-neutral-500">
                  {approval_settings?.requires_sales_manager_approval
                    ? "Yes"
                    : "No"}
                </Text>
              </div>
            </div>
          </TooltipProvider>
        </div>

        {customer?.employee?.is_admin && (
          <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  Save
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        )}
      </Container>
    </div>
  )
}

export default ApprovalSettingsCard
