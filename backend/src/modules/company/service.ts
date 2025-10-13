import { MedusaService } from "@medusajs/framework/utils";
import { Company, Employee } from "./models";
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  CompanySearchDTO,
  BulkImportCompanyDTO,
  BulkExportCompanyDTO,
} from "./types/mutations";
import { CompanyDTO, EmployeeDTO } from "./types/common";
import { CompanyCSVService } from "./csv-service";

class CompanyModuleService extends MedusaService({
  Company,
  Employee,
}) {
  // Custom business logic methods - don't override generated methods
  async createCompanyWithValidation(data: CreateCompanyDTO): Promise<CompanyDTO> {
    // Validate CNPJ
    const cleanCNPJ = data.cnpj.replace(/\D/g, "");
    if (cleanCNPJ.length !== 14) {
      throw new Error("CNPJ must have 14 digits");
    }
    if (this.isInvalidCNPJ(cleanCNPJ)) {
      throw new Error("Invalid CNPJ");
    }

    const companyPayload = {
      ...data,
      email_domain: this.extractEmailDomain(data.email),
      country: data.country || "BR",
      currency_code: data.currency_code || "BRL",
    };

    const [company] = await this.createCompanies([companyPayload]);
    return company;
  }

  async updateCompanyWithValidation(data: UpdateCompanyDTO): Promise<CompanyDTO> {
    const { id, email, ...rest } = data;
    const updatePayload: Record<string, unknown> = { ...rest };

    if (email) {
      updatePayload.email = email;
      updatePayload.email_domain = this.extractEmailDomain(email);
    }

    const company = await this.updateCompanies(updatePayload, { where: { id } });
    return company;
  }

  async searchCompaniesByFilters(filters: CompanySearchDTO = {}): Promise<CompanyDTO[]> {
    const where: Record<string, unknown> = {};

    if (filters.cnpj) where.cnpj = filters.cnpj;
    if (filters.email_domain) where.email_domain = filters.email_domain;
    if (filters.name) where.name = { $ilike: `%${filters.name}%` };
    if (typeof filters.is_active === "boolean") {
      where.is_active = filters.is_active;
    }

    return await this.listCompanies(where);
  }

  async softDeleteCompanyById(id: string): Promise<void> {
    await this.updateCompanies({ is_active: false }, { where: { id } });
  }

  async createEmployeeWithValidation(data: CreateEmployeeDTO): Promise<EmployeeDTO> {
    const companyExists = await this.retrieveCompany(data.company_id).catch(() => null);
    if (!companyExists) {
      throw new Error(`Company ${data.company_id} not found`);
    }

    const employee = await this.createEmployees(data);
    return employee;
  }

  async updateEmployeeWithValidation(data: UpdateEmployeeDTO): Promise<EmployeeDTO> {
    const employee = await this.updateEmployees(data, { where: { id: data.id } });
    return employee;
  }

  async getEmployeeByCustomerId(customerId: string): Promise<EmployeeDTO | null> {
    const employees = await this.listEmployees();
    const employee = employees.find(emp => emp.customer_id === customerId);
    return employee || null;
  }

  async getActiveEmployeesByCompany(companyId: string): Promise<EmployeeDTO[]> {
    const employees = await this.listEmployees();
    return employees.filter(emp => emp.company_id === companyId && emp.is_active);
  }

  async softDeleteEmployeeById(id: string): Promise<void> {
    await this.updateEmployees({ is_active: false }, { where: { id } });
  }

  async bulkImportCompanies(data: BulkImportCompanyDTO): Promise<CompanyDTO[]> {
    const results: CompanyDTO[] = [];

    for (const companyData of data.companies) {
      try {
        const company = await this.createCompanyWithValidation(companyData);
        results.push(company);
      } catch (error) {
        console.error(`Failed to import company ${companyData.name}:`, error);
      }
    }

    return results;
  }

  async importFromCSV(csvData: string): Promise<CompanyDTO[]> {
    const companiesData = CompanyCSVService.importFromCSV(csvData);
    return await this.bulkImportCompanies({ companies: companiesData });
  }

  async exportToCSV(_filters?: CompanySearchDTO): Promise<string> {
    const companies = await this.listCompanies();
    return CompanyCSVService.exportToCSV(companies);
  }

  getCSVTemplate(): string {
    return CompanyCSVService.generateTemplate();
  }

  async bulkExportCompanies(data: BulkExportCompanyDTO): Promise<CompanyDTO[]> {
    if (data.company_ids && data.company_ids.length > 0) {
      // Filter companies by IDs
      const allCompanies = await this.listCompanies();
      return allCompanies.filter(company => data.company_ids.includes(company.id));
    }

    return await this.listCompanies();
  }

  async onboardCompany(
    companyData: CreateCompanyDTO,
    adminCustomerId: string
  ): Promise<{ company: CompanyDTO; employee: EmployeeDTO }> {
    const company = await this.createCompanyWithValidation(companyData);

    const [employee] = await this.createEmployees([{
      customer_id: adminCustomerId,
      company_id: company.id,
      is_admin: true,
      role: "admin",
      spending_limit: 0,
    }]);

    return { company, employee };
  }

  private isInvalidCNPJ(cnpj: string): boolean {
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return true;
    }

    let sum = 0;
    let weight = 2;

    for (let i = 11; i >= 0; i--) {
      sum += Number(cnpj[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }

    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (Number(cnpj[12]) !== digit1) {
      return true;
    }

    sum = 0;
    weight = 2;

    for (let i = 12; i >= 0; i--) {
      sum += Number(cnpj[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }

    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return Number(cnpj[13]) !== digit2;
  }

  private extractEmailDomain(email: string): string {
    const domain = email.split("@")[1];
    if (!domain) {
      throw new Error("Invalid email format");
    }
    return domain.toLowerCase();
  }

  async retrieveEmployeeByCustomerId(customerId: string): Promise<EmployeeDTO | null> {
    const employees = await this.listEmployees();
    const employee = employees.find(emp => emp.customer_id === customerId && emp.is_active);
    return employee || null;
  }

  async checkSpendingLimit(
    employeeId: string,
    amount: number
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    const employee = await this.retrieveEmployee(employeeId);

    if (!employee) {
      return { allowed: false, reason: "Employee not found" };
    }

    if (!employee.spending_limit || employee.spending_limit === 0) {
      return { allowed: true };
    }

    if (amount > employee.spending_limit) {
      return {
        allowed: false,
        reason: `Amount ${amount} exceeds limit ${employee.spending_limit}`,
        remaining: employee.spending_limit,
      };
    }

    return {
      allowed: true,
      remaining: employee.spending_limit - amount,
    };
  }
}

export default CompanyModuleService;
