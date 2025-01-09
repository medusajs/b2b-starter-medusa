/* Entity: Approval Settings */

export type ModuleApprovalSettings = {
  id: string;
  company_id: string;
  requires_admin_approval: boolean;
  requires_sales_manager_approval: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ModuleCreateApprovalSettings = {
  company_id: string;
  requires_admin_approval: boolean;
  requires_sales_manager_approval: boolean;
};

export type ModuleUpdateApprovalSettings = {
  id: string;
  requires_admin_approval?: boolean;
  requires_sales_manager_approval?: boolean;
};
