import {
  BaseFilterable,
  Context,
  FindConfig,
  IModuleService,
} from "@medusajs/types";
import {
  ModuleCreateQuote,
  ModuleCreateQuoteMessage,
  ModuleQuote,
  ModuleQuoteMessage,
  ModuleUpdateQuote,
} from "./module";

export interface ModuleQuoteFilters extends BaseFilterable<ModuleQuoteFilters> {
  q?: string;
  id?: string | string[];
  status?: string | string[];
}

/**
 * The main service interface for the Quote Module.
 */
export interface IQuoteModuleService extends IModuleService {
  /* Entity: Quotes */
  createQuotes(
    data: ModuleCreateQuote,
    sharedContext?: Context
  ): Promise<ModuleQuote>;

  createQuotes(
    data: ModuleCreateQuote[],
    sharedContext?: Context
  ): Promise<ModuleQuote[]>;

  updateQuotes(
    data: ModuleUpdateQuote,
    sharedContext?: Context
  ): Promise<ModuleQuote>;

  updateQuotes(
    data: ModuleUpdateQuote[],
    sharedContext?: Context
  ): Promise<ModuleQuote[]>;

  listQuotes(
    filters?: ModuleQuoteFilters,
    config?: FindConfig<ModuleQuote>,
    sharedContext?: Context
  ): Promise<ModuleQuote[]>;

  deleteQuotes(ids: string[], sharedContext?: Context): Promise<void>;

  /* Entity: Message */

  createMessages(
    data: ModuleCreateQuoteMessage,
    sharedContext?: Context
  ): Promise<ModuleQuoteMessage>;

  deleteMessages(ids: string[], sharedContext?: Context): Promise<void>;
}
