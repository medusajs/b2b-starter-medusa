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
  // Company CRUD
  async createCompany(data: CreateCompanyDTO): Promise<CompanyDTO> {
    this.validateCNPJ(data.cnpj);
    const emailDomain = this.extractEmailDomain(data.email);

    const companyData = {
      ...data,
      email_domain: emailDomain,
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
        async createCompany(data: CreateCompanyDTO): Promise<CompanyDTO> {
          this.validateCNPJ(data.cnpj);
          const companyPayload = {
            ...data,
            email_domain: this.extractEmailDomain(data.email),
            country: data.country || "BR",
            currency_code: data.currency_code || "BRL",
          };

          const [company] = await this.createCompanies_([companyPayload]);
          return company;
        }

        async updateCompany(data: UpdateCompanyDTO): Promise < CompanyDTO > {
      const { id, email, ...rest } = data;
      const updatePayload: Record<string, unknown> = { id, ...rest };

    if (email) {
      updatePayload.email = email;
      updatePayload.email_domain = this.extractEmailDomain(email);
    }

    const [company] = await this.updateCompanies_([updatePayload]);
    return company;
  }

  async getCompany(id: string): Promise<CompanyDTO | null> {
    return await this.retrieveCompany_(id, {
      relations: ["employees"],
    }).catch(() => null);
  }

  async searchCompanies(filters: CompanySearchDTO = {}): Promise<CompanyDTO[]> {
    const where: Record<string, unknown> = {};

    if (filters.cnpj) where.cnpj = filters.cnpj;
    if (filters.email_domain) where.email_domain = filters.email_domain;
    if (filters.name) where.name = { $ilike: `%${filters.name}%` };
    if (typeof filters.is_active === "boolean") where.is_active = filters.is_active;

    return await this.listCompanies_(where);
  }

  async deleteCompany(id: string): Promise<void> {
    await this.updateCompanies_([
      {
        id,
        is_active: false,
      },
    ]);
  }

  async createEmployee(data: CreateEmployeeDTO): Promise<EmployeeDTO> {
    const companyExists = await this.retrieveCompany_(data.company_id).catch(() => null);
    if (!companyExists) {
      throw new Error(`Company ${data.company_id} not found`);
    }

    const [employee] = await this.createEmployees_([data]);
    return employee;
  }

  async updateEmployee(data: UpdateEmployeeDTO): Promise<EmployeeDTO> {
    const [employee] = await this.updateEmployees_([
      {
        id: data.id,
        ...data,
      },
    ]);
    return employee;
  }

  async getEmployee(id: string): Promise<EmployeeDTO | null> {
    return await this.retrieveEmployee_(id, {
      relations: ["company"],
    }).catch(() => null);
  }

  async getEmployeeByCustomer(customerId: string): Promise<EmployeeDTO | null> {
    const employees = await this.listEmployees_(
      { customer_id: customerId },
      { relations: ["company"], take: 1 }
    );
    return employees[0] || null;
  }

  async getCompanyEmployees(companyId: string): Promise<EmployeeDTO[]> {
    return await this.listEmployees_({ company_id: companyId, is_active: true });
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.updateEmployees_([
      {
        id,
        is_active: false,
      },
    ]);
  }

  async bulkImportCompanies(data: BulkImportCompanyDTO): Promise<CompanyDTO[]> {
    const results: CompanyDTO[] = [];

    for (const companyData of data.companies) {
      try {
        const company = await this.createCompany(companyData);
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

  async exportToCSV(filters?: CompanySearchDTO): Promise<string> {
    const companies = filters
      ? await this.searchCompanies(filters)
      : await this.listCompanies_({}, { relations: ["employees"] });

    return CompanyCSVService.exportToCSV(companies);
  }

  getCSVTemplate(): string {
    return CompanyCSVService.generateTemplate();
  }

  async bulkExportCompanies(data: BulkExportCompanyDTO): Promise<CompanyDTO[]> {
    if (data.company_ids?.length) {
      return await this.listCompanies_(
        { id: { $in: data.company_ids } },
        { relations: ["employees"] }
      );
    }

    if (data.filters) {
      return await this.searchCompanies(data.filters);
    }

    return await this.listCompanies_({}, { relations: ["employees"] });
  }

  async onboardCompany(
    companyData: CreateCompanyDTO,
    adminCustomerId: string
  ): Promise<{ company: CompanyDTO; employee: EmployeeDTO }> {
    const company = await this.createCompany(companyData);

    const employee = await this.createEmployee({
      customer_id: adminCustomerId,
      company_id: company.id,
      is_admin: true,
      role: "admin",
      spending_limit: 0,
    });

    return { company, employee };
  }

  private validateCNPJ(cnpj: string): void {
    const cleanCNPJ = cnpj.replace(/\D/g, "");

    if (cleanCNPJ.length !== 14) {
      throw new Error("CNPJ must have 14 digits");
    }

    if (this.isInvalidCNPJ(cleanCNPJ)) {
      throw new Error("Invalid CNPJ");
    }
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
    const employees = await this.listEmployees_(
      { customer_id: customerId, is_active: true },
      { relations: ["company"], take: 1 }
    );
    return employees[0] || null;
  }

  async retrieveCompany(id: string): Promise<CompanyDTO | null> {
    return await this.retrieveCompany_(id).catch(() => null);
  }

  async checkSpendingLimit(
    employeeId: string,
    amount: number
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    const employee = await this.retrieveEmployee_(employeeId).catch(() => null);

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

  async listEmployees(filters: { company_id?: string } = {}): Promise<EmployeeDTO[]> {
    const where: Record<string, unknown> = { is_active: true };
    if (filters.company_id) {
      where.company_id = filters.company_id;
    }

    return await this.listEmployees_(where);
  }
}

export default CompanyModuleService;
