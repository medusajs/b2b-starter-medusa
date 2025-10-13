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
      country: data.country || "BR",
      currency_code: data.currency_code || "BRL",
    };

    return await this.create("Company", companyData);
  }

  async updateCompany(data: UpdateCompanyDTO): Promise<CompanyDTO> {
    const updateData: any = { ...data };
    
    if (data.email) {
      updateData.email_domain = this.extractEmailDomain(data.email);
    }

    return await this.update("Company", data.id, updateData);
  }

  async getCompany(id: string): Promise<CompanyDTO | null> {
    return await this.retrieve("Company", id, {
      relations: ["employees"],
    });
  }

  async searchCompanies(filters: CompanySearchDTO): Promise<CompanyDTO[]> {
    const where: any = {};
    
    if (filters.cnpj) where.cnpj = filters.cnpj;
    if (filters.email_domain) where.email_domain = filters.email_domain;
    if (filters.name) where.name = { $ilike: `%${filters.name}%` };
    if (filters.is_active !== undefined) where.is_active = filters.is_active;

    return await this.list("Company", { where });
  }

  async deleteCompany(id: string): Promise<void> {
    // Soft delete - deactivate instead of hard delete
    await this.update("Company", id, { is_active: false });
  }

  // Employee CRUD
  async createEmployee(data: CreateEmployeeDTO): Promise<EmployeeDTO> {
    // Validate company exists
    const company = await this.retrieve("Company", data.company_id);
    if (!company) {
      throw new Error(`Company ${data.company_id} not found`);
    }

    return await this.create("Employee", data);
  }

  async updateEmployee(data: UpdateEmployeeDTO): Promise<EmployeeDTO> {
    return await this.update("Employee", data.id, data);
  }

  async getEmployee(id: string): Promise<EmployeeDTO | null> {
    return await this.retrieve("Employee", id, {
      relations: ["company"],
    });
  }

  async getEmployeeByCustomer(customerId: string): Promise<EmployeeDTO | null> {
    const employees = await this.list("Employee", {
      where: { customer_id: customerId },
      relations: ["company"],
    });
    return employees[0] || null;
  }

  async getCompanyEmployees(companyId: string): Promise<EmployeeDTO[]> {
    return await this.list("Employee", {
      where: { company_id: companyId, is_active: true },
    });
  }

  async deleteEmployee(id: string): Promise<void> {
    // Soft delete
    await this.update("Employee", id, { is_active: false });
  }

  // Bulk Operations
  async bulkImportCompanies(data: BulkImportCompanyDTO): Promise<CompanyDTO[]> {
    const results: CompanyDTO[] = [];
    
    for (const companyData of data.companies) {
      try {
        const company = await this.createCompany(companyData);
        results.push(company);
      } catch (error) {
        // Log error but continue with other companies
        console.error(`Failed to import company ${companyData.name}:`, error);
      }
    }
    
    return results;
  }

  // CSV Operations
  async importFromCSV(csvData: string): Promise<CompanyDTO[]> {
    const companiesData = CompanyCSVService.importFromCSV(csvData);
    return await this.bulkImportCompanies({ companies: companiesData });
  }

  async exportToCSV(filters?: CompanySearchDTO): Promise<string> {
    const companies = filters 
      ? await this.searchCompanies(filters)
      : await this.list("Company");
    
    return CompanyCSVService.exportToCSV(companies);
  }

  getCSVTemplate(): string {
    return CompanyCSVService.generateTemplate();
  }

  async bulkExportCompanies(data: BulkExportCompanyDTO): Promise<CompanyDTO[]> {
    let companies: CompanyDTO[];
    
    if (data.company_ids?.length) {
      companies = await this.list("Company", {
        where: { id: { $in: data.company_ids } },
        relations: ["employees"],
      });
    } else if (data.filters) {
      companies = await this.searchCompanies(data.filters);
    } else {
      companies = await this.list("Company", {
        relations: ["employees"],
      });
    }
    
    return companies;
  }

  // Onboarding Flow
  async onboardCompany(companyData: CreateCompanyDTO, adminCustomerId: string): Promise<{
    company: CompanyDTO;
    employee: EmployeeDTO;
  }> {
    // Create company
    const company = await this.createCompany(companyData);
    
    // Create admin employee
    const employee = await this.createEmployee({
      customer_id: adminCustomerId,
      company_id: company.id,
      is_admin: true,
      role: "admin",
      spending_limit: 0, // No limit for admin
    });

    return { company, employee };
  }

  // Validation helpers
  private validateCNPJ(cnpj: string): void {
    // Remove non-digits
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    
    if (cleanCNPJ.length !== 14) {
      throw new Error("CNPJ must have 14 digits");
    }

    // Basic CNPJ validation algorithm
    if (this.isInvalidCNPJ(cleanCNPJ)) {
      throw new Error("Invalid CNPJ");
    }
  }

  private isInvalidCNPJ(cnpj: string): boolean {
    // Check for known invalid patterns
    if (/^(\d)\1{13}$/.test(cnpj)) return true;
    
    // CNPJ validation algorithm
    let sum = 0;
    let weight = 2;
    
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(cnpj[12]) !== digit1) return true;
    
    sum = 0;
    weight = 2;
    
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(cnpj[13]) !== digit2;
  }

  private extractEmailDomain(email: string): string {
    const domain = email.split("@")[1];
    if (!domain) {
      throw new Error("Invalid email format");
    }
    return domain.toLowerCase();
  }

  // Missing methods for financing integration
  async retrieveEmployeeByCustomerId(customerId: string): Promise<EmployeeDTO | null> {
    const employees = await this.list("Employee", {
      where: { customer_id: customerId, is_active: true },
      relations: ["company"],
    });
    return employees[0] || null;
  }

  async retrieveCompany(id: string): Promise<CompanyDTO | null> {
    return await this.retrieve("Company", id);
  }

  async checkSpendingLimit(employeeId: string, amount: number): Promise<{
    allowed: boolean;
    reason?: string;
    remaining?: number;
  }> {
    const employee = await this.retrieve("Employee", employeeId);
    
    if (!employee) {
      return { allowed: false, reason: "Employee not found" };
    }

    // If no spending limit set, allow
    if (!employee.spending_limit || employee.spending_limit === 0) {
      return { allowed: true };
    }

    // Check if amount exceeds limit
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

  async listEmployees(filters: { company_id?: string }): Promise<EmployeeDTO[]> {
    const where: any = { is_active: true };
    if (filters.company_id) {
      where.company_id = filters.company_id;
    }
    
    return await this.list("Employee", { where });
  }
}

export default CompanyModuleService;
