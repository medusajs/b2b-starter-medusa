import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MedusaApp } from '@medusajs/framework';
import { CompanyDTO, EmployeeDTO } from '../types/common';
import { CreateCompanyDTO } from '../types/mutations';

describe('Company Onboarding Integration', () => {
  let app: MedusaApp;
  let companyService: any;

  beforeEach(async () => {
    // Initialize test app
    app = await MedusaApp.create({
      modules: {
        company: {
          resolve: '../index',
        },
      },
    });
    
    companyService = app.modules.company;
  });

  afterEach(async () => {
    await app?.shutdown();
  });

  describe('Deterministic Onboarding Flow', () => {
    it('should create company → customer group → admin employee', async () => {
      // Step 1: Create company
      const companyData: CreateCompanyDTO = {
        name: 'Solar Tech LTDA',
        email: 'admin@solartech.com.br',
        cnpj: '12.345.678/0001-90',
        phone: '+55 11 99999-9999',
        city: 'São Paulo',
        state: 'SP',
      };

      const adminCustomerId = 'cust_admin_123';

      // Step 2: Execute onboarding
      const result = await companyService.onboardCompany(companyData, adminCustomerId);

      // Assertions
      expect(result.company).toBeDefined();
      expect(result.employee).toBeDefined();

      // Verify company creation
      const company: CompanyDTO = result.company;
      expect(company.id).toMatch(/^comp_/);
      expect(company.name).toBe('Solar Tech LTDA');
      expect(company.cnpj).toBe('12.345.678/0001-90');
      expect(company.email_domain).toBe('solartech.com.br');
      expect(company.country).toBe('BR');
      expect(company.currency_code).toBe('BRL');
      expect(company.is_active).toBe(true);

      // Verify admin employee creation
      const employee: EmployeeDTO = result.employee;
      expect(employee.id).toMatch(/^emp_/);
      expect(employee.customer_id).toBe(adminCustomerId);
      expect(employee.company_id).toBe(company.id);
      expect(employee.is_admin).toBe(true);
      expect(employee.role).toBe('admin');
      expect(employee.is_active).toBe(true);

      // Step 3: Verify relationships
      const retrievedCompany = await companyService.getCompany(company.id);
      expect(retrievedCompany.employees).toHaveLength(1);
      expect(retrievedCompany.employees[0].id).toBe(employee.id);
    });

    it('should enforce CNPJ uniqueness constraint', async () => {
      const companyData1: CreateCompanyDTO = {
        name: 'Company One',
        email: 'admin@company1.com',
        cnpj: '11.111.111/0001-11',
      };

      const companyData2: CreateCompanyDTO = {
        name: 'Company Two',
        email: 'admin@company2.com',
        cnpj: '11.111.111/0001-11', // Same CNPJ
      };

      // First company should succeed
      await companyService.createCompany(companyData1);

      // Second company with same CNPJ should fail
      await expect(companyService.createCompany(companyData2))
        .rejects.toThrow();
    });

    it('should enforce customer_id uniqueness for employees', async () => {
      // Create two companies
      const company1 = await companyService.createCompany({
        name: 'Company One',
        email: 'admin@company1.com',
        cnpj: '11.111.111/0001-11',
      });

      const company2 = await companyService.createCompany({
        name: 'Company Two',
        email: 'admin@company2.com',
        cnpj: '22.222.222/0001-22',
      });

      const customerId = 'cust_shared_123';

      // First employee should succeed
      await companyService.createEmployee({
        customer_id: customerId,
        company_id: company1.id,
        role: 'admin',
      });

      // Second employee with same customer_id should fail
      await expect(companyService.createEmployee({
        customer_id: customerId,
        company_id: company2.id,
        role: 'buyer',
      })).rejects.toThrow();
    });

    it('should handle bulk operations correctly', async () => {
      const companiesData = [
        {
          name: 'Bulk Company 1',
          email: 'admin@bulk1.com',
          cnpj: '33.333.333/0001-33',
        },
        {
          name: 'Bulk Company 2',
          email: 'admin@bulk2.com',
          cnpj: '44.444.444/0001-44',
        },
        {
          name: 'Invalid Company',
          email: 'invalid-email',
          cnpj: '55.555.555/0001-55',
        },
      ];

      const results = await companyService.bulkImportCompanies({
        companies: companiesData,
      });

      // Should create valid companies and skip invalid ones
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Bulk Company 1');
      expect(results[1].name).toBe('Bulk Company 2');
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(async () => {
      // Setup test data
      await companyService.createCompany({
        name: 'Solar Energy Corp',
        email: 'contact@solarenergy.com',
        cnpj: '10.000.000/0001-10',
      });

      await companyService.createCompany({
        name: 'Wind Power Ltd',
        email: 'info@windpower.com.br',
        cnpj: '20.000.000/0001-20',
      });
    });

    it('should search by CNPJ', async () => {
      const results = await companyService.searchCompanies({
        cnpj: '10.000.000/0001-10',
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Solar Energy Corp');
    });

    it('should search by email domain', async () => {
      const results = await companyService.searchCompanies({
        email_domain: 'windpower.com.br',
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Wind Power Ltd');
    });

    it('should search by name with partial match', async () => {
      const results = await companyService.searchCompanies({
        name: 'Solar',
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Solar Energy Corp');
    });
  });
});