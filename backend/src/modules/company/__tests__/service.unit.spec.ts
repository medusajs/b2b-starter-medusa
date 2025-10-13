import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import CompanyModuleService from '../service';
import { CreateCompanyDTO, CreateEmployeeDTO } from '../types/mutations';

// Mock MedusaService
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockRetrieve = jest.fn();
const mockList = jest.fn();

jest.mock('@medusajs/framework/utils', () => ({
  MedusaService: jest.fn(() => ({
    create: mockCreate,
    update: mockUpdate,
    retrieve: mockRetrieve,
    list: mockList,
  })),
}));

describe('CompanyModuleService', () => {
  let service: CompanyModuleService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CompanyModuleService({} as any);
  });

  describe('CNPJ Validation', () => {
    it('should validate correct CNPJ', async () => {
      const validCompanyData: CreateCompanyDTO = {
        name: 'Test Company',
        email: 'admin@testcompany.com',
        cnpj: '11.222.333/0001-81',
      };

      mockCreate.mockResolvedValue({ id: 'comp_123', ...validCompanyData });

      const result = await service.createCompany(validCompanyData);
      
      expect(mockCreate).toHaveBeenCalledWith('Company', {
        ...validCompanyData,
        cnpj: '11.222.333/0001-81',
        email_domain: 'testcompany.com',
        country: 'BR',
        currency_code: 'BRL',
      });
      expect(result).toBeDefined();
    });

    it('should reject invalid CNPJ format', async () => {
      const invalidCompanyData: CreateCompanyDTO = {
        name: 'Test Company',
        email: 'admin@testcompany.com',
        cnpj: '123',
      };

      await expect(service.createCompany(invalidCompanyData))
        .rejects.toThrow('CNPJ must have 14 digits');
    });

    it('should reject CNPJ with all same digits', async () => {
      const invalidCompanyData: CreateCompanyDTO = {
        name: 'Test Company',
        email: 'admin@testcompany.com',
        cnpj: '11111111111111',
      };

      await expect(service.createCompany(invalidCompanyData))
        .rejects.toThrow('Invalid CNPJ');
    });
  });

  describe('Email Domain Extraction', () => {
    it('should extract email domain correctly', async () => {
      const companyData: CreateCompanyDTO = {
        name: 'Test Company',
        email: 'Admin@TestCompany.COM',
        cnpj: '11.222.333/0001-81',
      };

      mockCreate.mockResolvedValue({ id: 'comp_123', ...companyData });

      await service.createCompany(companyData);
      
      expect(mockCreate).toHaveBeenCalledWith('Company', expect.objectContaining({
        email_domain: 'testcompany.com',
      }));
    });

    it('should reject invalid email format', async () => {
      const invalidCompanyData: CreateCompanyDTO = {
        name: 'Test Company',
        email: 'invalid-email',
        cnpj: '11.222.333/0001-81',
      };

      await expect(service.createCompany(invalidCompanyData))
        .rejects.toThrow('Invalid email format');
    });
  });

  describe('Onboarding Flow', () => {
    it('should complete onboarding flow successfully', async () => {
      const companyData: CreateCompanyDTO = {
        name: 'New Company',
        email: 'admin@newcompany.com',
        cnpj: '11.222.333/0001-81',
      };
      const adminCustomerId = 'cust_admin';

      const mockCompany = { id: 'comp_new', ...companyData };
      const mockEmployee = { 
        id: 'emp_admin', 
        customer_id: adminCustomerId,
        company_id: 'comp_new',
        is_admin: true,
        role: 'admin',
      };

      mockCreate
        .mockResolvedValueOnce(mockCompany)
        .mockResolvedValueOnce(mockEmployee);
      mockRetrieve.mockResolvedValue(mockCompany);

      const result = await service.onboardCompany(companyData, adminCustomerId);
      
      expect(result.company).toEqual(mockCompany);
      expect(result.employee).toEqual(mockEmployee);
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });
  });
});