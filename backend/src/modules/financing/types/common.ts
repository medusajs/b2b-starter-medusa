export interface FinancingProposalDTO {
  id: string;
  customer_id: string;
  quote_id?: string;
  credit_analysis_id?: string;
  modality: "CDC" | "LEASING" | "EAAS";
  requested_amount: number;
  approved_amount?: number;
  down_payment_amount: number;
  financed_amount?: number;
  requested_term_months: number;
  approved_term_months?: number;
  interest_rate_monthly?: number;
  interest_rate_annual?: number;
  cet_rate?: number;
  amortization_system: "PRICE" | "SAC";
  status: "pending" | "approved" | "contracted" | "cancelled";
  approved_at?: Date;
  contracted_at?: Date;
  cancelled_at?: Date;
  expires_at?: Date;
  contract_number?: string;
  contract_url?: string;
  approval_conditions?: any;
  rejection_reason?: string;
  notes?: string;
  payment_schedules?: PaymentScheduleDTO[];
  created_at: Date;
  updated_at: Date;
}

export interface PaymentScheduleDTO {
  id: string;
  financing_proposal_id: string;
  installment_number: number;
  due_date: Date;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  remaining_balance: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paid_at?: Date;
  paid_amount?: number;
  created_at: Date;
  updated_at: Date;
}

export interface FinancingCalculation {
  principal: number;
  interest_rate_annual: number;
  term_months: number;
  system: "PRICE" | "SAC";
  down_payment: number;
  financed_amount: number;
  monthly_payment: number;
  total_paid: number;
  total_interest: number;
  cet_rate: number;
  installments: {
    number: number;
    due_date: Date;
    principal: number;
    interest: number;
    total: number;
    balance: number;
  }[];
}

export interface ContractData {
  proposal_id: string;
  contract_number: string;
  customer_data: {
    name: string;
    document: string;
    email: string;
    phone: string;
    address: string;
  };
  financing_data: {
    amount: number;
    term_months: number;
    interest_rate: number;
    monthly_payment: number;
    total_amount: number;
  };
  terms_and_conditions: string;
  generated_at: Date;
}