import { 
  DespatchLabOrder,
  DespatchLabFulfillmentData,
  DespatchLabCalculatePriceData,
  DespatchLabFulfillmentDocument
} from "../../modules/despatch-lab/types";

/**
 * The main service interface for the DespatchLab Fulfillment Provider.
 */
export interface IDespatchLabFulfillmentService {
  /**
   * Calculate shipping price for given options and data
   */
  calculatePrice(
    optionData: any,
    context: any
  ): Promise<number>;

  /**
   * Check if the provider can calculate price for given data
   */
  canCalculate(
    data: DespatchLabCalculatePriceData,
    context: any
  ): Promise<boolean>;

  /**
   * Create a fulfillment in DespatchLab system
   */
  createFulfillment(
    fulfillmentData: DespatchLabFulfillmentData,
    items: any[],
    order: any,
    context: any
  ): Promise<DespatchLabFulfillmentData>;

  /**
   * Cancel a fulfillment in DespatchLab system
   */
  cancelFulfillment(
    fulfillmentData: DespatchLabFulfillmentData,
    context: any
  ): Promise<any>;

  /**
   * Create a return fulfillment
   */
  createReturnFulfillment(
    fulfillmentData: DespatchLabFulfillmentData,
    context: any
  ): Promise<DespatchLabFulfillmentData>;

  /**
   * Get fulfillment documents (labels, tracking info, etc.)
   */
  getFulfillmentDocuments(
    fulfillmentData: DespatchLabFulfillmentData,
    context: any
  ): Promise<DespatchLabFulfillmentDocument>;

  /**
   * Retrieve a specific order from DespatchLab by its unique identifier
   */
  getOrder(
    orderId: string
  ): Promise<DespatchLabOrder>;
}