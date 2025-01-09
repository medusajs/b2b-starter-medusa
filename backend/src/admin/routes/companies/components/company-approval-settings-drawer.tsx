import { Button, Drawer, Switch, Text, toast } from "@medusajs/ui";
import { QueryCompany } from "@starter/types";
import { useEffect, useState } from "react";
import { useUpdateApprovalSettings } from "../../../hooks/api/approvals";
import { CoolSwitch } from "../../../components/common";

export function CompanyApprovalSettingsDrawer({
  company,
  refetch,
  open,
  setOpen,
}: {
  company: QueryCompany;
  refetch: () => void;
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

  const { mutate, isPending, error, isSuccess } = useUpdateApprovalSettings(
    company.id
  );

  const { approval_settings } = company;

  const handleSubmit = () => {
    mutate({
      id: approval_settings.id,
      requires_admin_approval: requiresAdminApproval,
      requires_sales_manager_approval: requiresSalesManagerApproval,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setOpen(false);
      refetch();
      toast.success(`Company ${company.name} updated successfully`);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to update company approval settings");
    }
  }, [error]);

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
