import {
  BaseFilterable,
  Context,
  FindConfig,
  IModuleService,
} from "@medusajs/types";
import {
  ModuleCreateApprovalSettings,
  ModuleApprovalSettings,
  ModuleUpdateApprovalSettings,
  ModuleApproval,
  ModuleCreateApproval,
  ModuleUpdateApproval,
  ModuleCreateApprovalStatus,
  ModuleApprovalStatus,
  ModuleUpdateApprovalStatus,
  ModuleApprovalRule,
  ModuleCreateApprovalRule,
  ModuleUpdateApprovalRule,
  ModuleApprovalHistory,
  ModuleCreateApprovalHistory,
} from "./module";

export interface ModuleApprovalSettingsFilters
  extends BaseFilterable<ModuleApprovalSettingsFilters> {
  id?: string | string[];
  company_id?: string | string[];
}

export interface ModuleApprovalFilters
  extends BaseFilterable<ModuleApprovalFilters> {
  id?: string | string[];
  cart_id?: string | string[];
  idempotency_key?: string | string[];
}

/**
 * The main service interface for the Approval Module.
 */
export interface IApprovalModuleService extends IModuleService {
  /* Entity: Approval */
  createApproval(
    data: ModuleCreateApproval,
    sharedContext?: Context
  ): Promise<ModuleApproval>;

  createApprovals(
    data: ModuleCreateApproval[],
    sharedContext?: Context
  ): Promise<ModuleApproval[]>;

  updateApproval(
    data: ModuleUpdateApproval,
    sharedContext?: Context
  ): Promise<ModuleApproval>;

  updateApprovals(
    data: ModuleUpdateApproval[],
    sharedContext?: Context
  ): Promise<ModuleApproval[]>;

  listApprovals(
    filters?: ModuleApprovalFilters,
    config?: FindConfig<ModuleApproval>,
    sharedContext?: Context
  ): Promise<ModuleApproval[]>;

  retrieveApproval(
    id: string,
    sharedContext?: Context
  ): Promise<ModuleApproval>;

  softDeleteApprovals(ids: string[], sharedContext?: Context): Promise<void>;

  deleteApprovals(ids: string[], sharedContext?: Context): Promise<void>;

  restoreApprovals(ids: string[], sharedContext?: Context): Promise<void>;

  hasPendingApprovals(cartId: string): Promise<boolean>;

  evaluateApprovalRules(
    companyId: string,
    cartContext: {
      total: number;
      itemCount: number;
      dayOfWeek?: string;
      timeOfDay?: string;
    }
  ): Promise<{ type: string; count: number }[]>;

  recordApprovalHistory(data: {
    approval_id: string;
    previous_status: any | null;
    new_status: any;
    actor_id: string;
    actor_role: string;
    actor_ip?: string;
    actor_user_agent?: string;
    reason?: string;
    comment?: string;
    cart_total_at_action?: number;
    is_escalation?: boolean;
    is_system_action?: boolean;
    metadata?: Record<string, any>;
  }): Promise<void>;

  checkEscalation(approvalId: string): Promise<boolean>;

  generateIdempotencyKey(cartId: string, approvalType: string): string;

  /* Entity: Approval Settings */
  retrieveApprovalSettings(
    id: string,
    sharedContext?: Context
  ): Promise<ModuleApprovalSettings>;

  createApprovalSettings(
    data: ModuleCreateApprovalSettings,
    sharedContext?: Context
  ): Promise<ModuleApprovalSettings>;

  createApprovalSettings(
    data: ModuleCreateApprovalSettings[],
    sharedContext?: Context
  ): Promise<ModuleApprovalSettings[]>;

  updateApprovalSettings(
    data: ModuleUpdateApprovalSettings,
    sharedContext?: Context
  ): Promise<ModuleApprovalSettings>;

  updateApprovalSettings(
    data: ModuleUpdateApprovalSettings[],
    sharedContext?: Context
  ): Promise<ModuleApprovalSettings[]>;

  listApprovalSettings(
    filters?: ModuleApprovalSettingsFilters,
    config?: FindConfig<ModuleApprovalSettings>,
    sharedContext?: Context
  ): Promise<ModuleApprovalSettings[]>;

  deleteApprovalSettings(ids: string[], sharedContext?: Context): Promise<void>;

  /* Entity: Approval Status */
  createApprovalStatus(
    data: ModuleCreateApprovalStatus,
    sharedContext?: Context
  ): Promise<ModuleApprovalStatus>;

  createApprovalStatuses(
    data: ModuleCreateApprovalStatus[],
    sharedContext?: Context
  ): Promise<ModuleApprovalStatus[]>;

  updateApprovalStatus(
    data: ModuleUpdateApprovalStatus,
    sharedContext?: Context
  ): Promise<ModuleApprovalStatus>;

  updateApprovalStatuses(
    data: ModuleUpdateApprovalStatus[],
    sharedContext?: Context
  ): Promise<ModuleApprovalStatus[]>;

  deleteApprovalStatuses(ids: string[], sharedContext?: Context): Promise<void>;

  /* Entity: Approval Rule */
  createApprovalRule(
    data: ModuleCreateApprovalRule,
    sharedContext?: Context
  ): Promise<ModuleApprovalRule>;

  createApprovalRules(
    data: ModuleCreateApprovalRule[],
    sharedContext?: Context
  ): Promise<ModuleApprovalRule[]>;

  updateApprovalRule(
    data: ModuleUpdateApprovalRule,
    sharedContext?: Context
  ): Promise<ModuleApprovalRule>;

  updateApprovalRules(
    data: ModuleUpdateApprovalRule[],
    sharedContext?: Context
  ): Promise<ModuleApprovalRule[]>;

  listApprovalRules(
    filters?: any,
    config?: FindConfig<ModuleApprovalRule>,
    sharedContext?: Context
  ): Promise<ModuleApprovalRule[]>;

  retrieveApprovalRule(
    id: string,
    sharedContext?: Context
  ): Promise<ModuleApprovalRule>;

  deleteApprovalRules(ids: string[], sharedContext?: Context): Promise<void>;

  /* Entity: Approval History */
  createApprovalHistory(
    data: ModuleCreateApprovalHistory,
    sharedContext?: Context
  ): Promise<ModuleApprovalHistory>;

  createApprovalHistories(
    data: ModuleCreateApprovalHistory[],
    sharedContext?: Context
  ): Promise<ModuleApprovalHistory[]>;

  listApprovalHistories(
    filters?: any,
    config?: FindConfig<ModuleApprovalHistory>,
    sharedContext?: Context
  ): Promise<ModuleApprovalHistory[]>;

  retrieveApprovalHistory(
    id: string,
    sharedContext?: Context
  ): Promise<ModuleApprovalHistory>;
}
