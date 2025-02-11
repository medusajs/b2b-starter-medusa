import { Button, Drawer, toast } from "@medusajs/ui";
import { useState } from "react";
import { QueryCompany } from "../../../../types";
import { CoolSwitch } from "../../../components/common";
import { useUpdateApprovalSettings } from "../../../hooks/api";

export function CompanyApprovalSettingsDrawer({
  company,
  open,
  setOpen,
}: {
  company: QueryCompany;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [requiresAdminApproval, setRequiresAdminApproval] = useState(
    company.approval_settings?.requires_admin_approval || false
  );
  const [requiresSalesManagerApproval, setRequiresSalesManagerApproval] =
    useState(
      company.approval_settings?.requires_sales_manager_approval || false
    );

  const { mutateAsync, isPending } = useUpdateApprovalSettings(company.id);

  const { approval_settings } = company;

  const handleSubmit = async () => {
    await mutateAsync(
      {
        id: approval_settings.id,
        requires_admin_approval: requiresAdminApproval,
        requires_sales_manager_approval: requiresSalesManagerApproval,
      },
      {
        onSuccess: async () => {
          setOpen(false);
          toast.success("Company approval settings updated successfully");
        },
        onError: (error) => {
          toast.error("Failed to update company approval settings");
        },
      }
    );
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content className="z-50">
        <Drawer.Header>
          <Drawer.Title>Company Approval Settings</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CoolSwitch
              checked={requiresAdminApproval}
              onChange={() => setRequiresAdminApproval(!requiresAdminApproval)}
              fieldName="requires_admin_approval"
              label="Requires Admin Approval"
              description="Require company admin approval for all orders placed by this company."
            />
          </div>

          <div className="flex items-center gap-2">
            <CoolSwitch
              checked={requiresSalesManagerApproval}
              onChange={() =>
                setRequiresSalesManagerApproval(!requiresSalesManagerApproval)
              }
              fieldName="requires_sales_manager_approval"
              label="Requires Sales Manager Approval"
              description="Require sales manager approval for all orders placed by this company."
            />
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isPending}>
            Save
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
