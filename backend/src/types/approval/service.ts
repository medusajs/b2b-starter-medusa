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
}
