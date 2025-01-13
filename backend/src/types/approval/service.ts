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
} from "./module";

export interface ModuleApprovalSettingsFilters
  extends BaseFilterable<ModuleApprovalSettingsFilters> {
  id?: string | string[];
  company_id?: string | string[];
}

/**
 * The main service interface for the Approval Module.
 */
export interface IApprovalModuleService extends IModuleService {
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
}
