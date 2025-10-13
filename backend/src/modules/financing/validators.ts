export const validateCreateProposal = (data: any) => {
  const errors: string[] = [];

  if (!data.customer_id) errors.push("customer_id is required");
  if (!data.modality || !["CDC", "LEASING", "EAAS"].includes(data.modality)) {
    errors.push("modality must be CDC, LEASING, or EAAS");
  }
  if (!data.requested_amount || data.requested_amount <= 0) {
    errors.push("requested_amount must be greater than 0");
  }
  if (!data.requested_term_months || data.requested_term_months < 1 || data.requested_term_months > 120) {
    errors.push("requested_term_months must be between 1 and 120");
  }
  if (data.down_payment_amount && data.down_payment_amount < 0) {
    errors.push("down_payment_amount cannot be negative");
  }

  return errors;
};

export const validateApproveProposal = (data: any) => {
  const errors: string[] = [];

  if (!data.id) errors.push("id is required");
  if (!data.approved_amount || data.approved_amount <= 0) {
    errors.push("approved_amount must be greater than 0");
  }
  if (!data.approved_term_months || data.approved_term_months < 1) {
    errors.push("approved_term_months must be greater than 0");
  }
  if (!data.interest_rate_annual || data.interest_rate_annual < 0) {
    errors.push("interest_rate_annual must be greater than or equal to 0");
  }

  return errors;
};