import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export interface GenerateCompanyCodeInput {
  company_name: string;
  existing_codes?: string[];
}

export const generateCompanyCodeStep = createStep(
  "generate-company-code",
  async (input: GenerateCompanyCodeInput) => {
    const { company_name, existing_codes = [] } = input;

    // Remove non-alphanumeric characters and take first 6-8 characters
    const cleanName = company_name.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let baseCode = cleanName.substring(0, 6);

    // If the code is too short, pad it
    if (baseCode.length < 3) {
      baseCode = baseCode.padEnd(3, "X");
    }

    // Handle conflicts with existing codes
    let code = baseCode;
    let suffix = 2;

    while (existing_codes.includes(code)) {
      code = `${baseCode}${suffix}`;
      suffix++;
    }

    return new StepResponse(code);
  }
);