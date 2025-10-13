import { describe, it, expect } from '@jest/globals';
import { CompanyCSVService } from '../csv-service';
import { CompanyDTO } from '../types/common';
import { CreateCompanyDTO } from '../types/mutations';

describe('CompanyCSVService', () => {
  describe('Export to CSV', () => {
    it('should export companies to CSV format', () => {
      const companies: CompanyDTO[] = [
        {
          id: 'comp_123',
          name: 'Solar Tech LTDA',
          email: 'admin@solartech.com.br',
          cnpj: '12.345.678/0001-90',
          email_domain: 'solartech.com.br',
          phone: '+55 11 99999-9999',
          city: 'São Paulo',
          state: 'SP',
          country: 'BR',
          currency_code: 'BRL',
          spending_limit_reset_frequency: 'monthly',
          customer_group_id: null,
          is_active: true,
          created_at: new Date('2024-01-01T00:00:00Z'),
          updated_at: new Date('2024-01-01T00:00:00Z'),
        } as CompanyDTO,
      ];

      const csv = CompanyCSVService.exportToCSV(companies);
      
      expect(csv).toContain('id,name,email,cnpj,phone,city,state,country,currency_code,is_active,created_at');
      expect(csv).toContain('comp_123,Solar Tech LTDA,admin@solartech.com.br,12.345.678/0001-90');
      expect(csv).toContain('São Paulo,SP,BR,BRL,true,2024-01-01T00:00:00.000Z');
    });

    it('should escape CSV fields with commas', () => {
      const companies: CompanyDTO[] = [
        {
          id: 'comp_123',
          name: 'Company, Inc.',
          email: 'admin@company.com',
          cnpj: '12.345.678/0001-90',
          email_domain: 'company.com',
          country: 'BR',
          currency_code: 'BRL',
          spending_limit_reset_frequency: 'monthly',
          is_active: true,
          created_at: new Date('2024-01-01T00:00:00Z'),
          updated_at: new Date('2024-01-01T00:00:00Z'),
        } as CompanyDTO,
      ];

      const csv = CompanyCSVService.exportToCSV(companies);
      
      expect(csv).toContain('"Company, Inc."');
    });
  });

  describe('Import from CSV', () => {
    it('should import companies from CSV format', () => {
      const csvData = `name,email,cnpj,phone,city,state,country,currency_code
Solar Tech LTDA,admin@solartech.com.br,12.345.678/0001-90,+55 11 99999-9999,São Paulo,SP,BR,BRL
Wind Power Ltd,info@windpower.com,98.765.432/0001-10,+55 21 88888-8888,Rio de Janeiro,RJ,BR,BRL`;

      const companies = CompanyCSVService.importFromCSV(csvData);
      
      expect(companies).toHaveLength(2);
      expect(companies[0]).toEqual({
        name: 'Solar Tech LTDA',
        email: 'admin@solartech.com.br',
        cnpj: '12.345.678/0001-90',
        phone: '+55 11 99999-9999',
        city: 'São Paulo',
        state: 'SP',
        country: 'BR',
        currency_code: 'BRL',
      });
      expect(companies[1].name).toBe('Wind Power Ltd');
    });

    it('should handle missing optional fields', () => {
      const csvData = `name,email,cnpj
Minimal Company,admin@minimal.com,11.111.111/0001-11`;

      const companies = CompanyCSVService.importFromCSV(csvData);
      
      expect(companies).toHaveLength(1);
      expect(companies[0]).toEqual({
        name: 'Minimal Company',
        email: 'admin@minimal.com',
        cnpj: '11.111.111/0001-11',
        country: 'BR',
        currency_code: 'BRL',
      });
    });

    it('should reject CSV without required headers', () => {
      const csvData = `name,email
Company Name,admin@company.com`;

      expect(() => CompanyCSVService.importFromCSV(csvData))
        .toThrow('Missing required headers: cnpj');
    });

    it('should reject rows with missing required fields', () => {
      const csvData = `name,email,cnpj
Complete Company,admin@complete.com,11.111.111/0001-11
Incomplete Company,,22.222.222/0001-22`;

      expect(() => CompanyCSVService.importFromCSV(csvData))
        .toThrow('Error parsing line 3: Missing required fields: name, email, cnpj');
    });

    it('should handle quoted CSV fields', () => {
      const csvData = `name,email,cnpj
"Company, Inc.","admin@company.com","12.345.678/0001-90"`;

      const companies = CompanyCSVService.importFromCSV(csvData);
      
      expect(companies[0].name).toBe('Company, Inc.');
    });
  });

  describe('Generate Template', () => {
    it('should generate CSV template with headers and example', () => {
      const template = CompanyCSVService.generateTemplate();
      
      expect(template).toContain('name,email,cnpj,phone,address,city,state,zip,country,currency_code');
      expect(template).toContain('Empresa Solar LTDA,admin@empresasolar.com.br,12.345.678/0001-90');
    });
  });
});