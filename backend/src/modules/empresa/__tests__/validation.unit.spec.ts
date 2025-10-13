import { describe, it, expect } from '@jest/globals';

// Test validation functions directly
describe('Company Validation Functions', () => {
  describe('CNPJ Validation', () => {
    function validateCNPJ(cnpj: string): void {
      const cleanCNPJ = cnpj.replace(/\D/g, "");
      
      if (cleanCNPJ.length !== 14) {
        throw new Error("CNPJ must have 14 digits");
      }

      if (isInvalidCNPJ(cleanCNPJ)) {
        throw new Error("Invalid CNPJ");
      }
    }

    function isInvalidCNPJ(cnpj: string): boolean {
      if (/^(\d)\1{13}$/.test(cnpj)) return true;
      
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

    it('should validate correct CNPJ', () => {
      expect(() => validateCNPJ('11.222.333/0001-81')).not.toThrow();
    });

    it('should reject CNPJ with wrong length', () => {
      expect(() => validateCNPJ('123')).toThrow('CNPJ must have 14 digits');
    });

    it('should reject CNPJ with all same digits', () => {
      expect(() => validateCNPJ('11111111111111')).toThrow('Invalid CNPJ');
    });

    it('should reject invalid CNPJ checksum', () => {
      expect(() => validateCNPJ('11.222.333/0001-99')).toThrow('Invalid CNPJ');
    });
  });

  describe('Email Domain Extraction', () => {
    function extractEmailDomain(email: string): string {
      const domain = email.split("@")[1];
      if (!domain) {
        throw new Error("Invalid email format");
      }
      return domain.toLowerCase();
    }

    it('should extract domain correctly', () => {
      expect(extractEmailDomain('admin@testcompany.com')).toBe('testcompany.com');
    });

    it('should handle uppercase domains', () => {
      expect(extractEmailDomain('Admin@TestCompany.COM')).toBe('testcompany.com');
    });

    it('should reject invalid email format', () => {
      expect(() => extractEmailDomain('invalid-email')).toThrow('Invalid email format');
    });

    it('should handle complex domains', () => {
      expect(extractEmailDomain('user@subdomain.company.com.br')).toBe('subdomain.company.com.br');
    });
  });
});