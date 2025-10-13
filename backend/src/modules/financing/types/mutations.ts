export interface CreateFinancingProposalDTO {
  customer_id: string;
  quote_id?: string;
  credit_analysis_id?: string;
  modality: "CDC" | "LEASING" | "EAAS";
  requested_amount: number;
  down_payment_amount?: number;
  requested_term_months: number;
  amortization_system?: "PRICE" | "SAC";
  notes?: string;
}

export interface UpdateFinancingProposalDTO {
  id: string;
  approved_amount?: number;
  approved_term_months?: number;
  interest_rate_monthly?: number;
  interest_rate_annual?: number;
  cet_rate?: number;
  approval_conditions?: any;
  rejection_reason?: string;
  notes?: string;
}

export interface ApproveFinancingDTO {
  id: string;
  approved_amount: number;
  approved_term_months: number;
  interest_rate_annual: number;
  approval_conditions?: string[];
  expires_in_days?: number;
}

export interface ContractFinancingDTO {
  id: string;
  contract_terms?: any;
}

export interface CancelFinancingDTO {
  id: string;
  cancellation_reason: string;
}

export interface CalculateFinancingDTO {
  amount: number;
  down_payment?: number;
  term_months: number;
  interest_rate_annual: number;
  system?: "PRICE" | "SAC";
  start_date?: Date;
}