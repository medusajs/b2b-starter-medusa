import { CompanyDTO } from './types/common';
import { CreateCompanyDTO } from './types/mutations';

export class CompanyCSVService {
  /**
   * Convert companies to CSV format
   */
  static exportToCSV(companies: CompanyDTO[]): string {
    const headers = [
      'id',
      'name',
      'email',
      'cnpj',
      'phone',
      'city',
      'state',
      'country',
      'currency_code',
      'is_active',
      'created_at',
    ];

    const rows = companies.map(company => [
      company.id,
      this.escapeCsvField(company.name),
      company.email,
      company.cnpj,
      company.phone || '',
      company.city || '',
      company.state || '',
      company.country,
      company.currency_code,
      company.is_active.toString(),
      company.created_at.toISOString(),
    ]);

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }

  /**
   * Parse CSV data to company objects
   */
  static importFromCSV(csvData: string): CreateCompanyDTO[] {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    
    // Validate required headers
    const requiredHeaders = ['name', 'email', 'cnpj'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    return lines.slice(1).map((line, index) => {
      try {
        const values = this.parseCsvLine(line);
        const company: any = {};

        headers.forEach((header, i) => {
          const value = values[i]?.trim();
          if (value) {
            company[header] = value;
          }
        });

        // Validate required fields
        if (!company.name || !company.email || !company.cnpj) {
          throw new Error('Missing required fields: name, email, cnpj');
        }

        return {
          name: company.name,
          email: company.email,
          cnpj: company.cnpj,
          phone: company.phone,
          address: company.address,
          city: company.city,
          state: company.state,
          zip: company.zip,
          country: company.country || 'BR',
          currency_code: company.currency_code || 'BRL',
        } as CreateCompanyDTO;

      } catch (error) {
        throw new Error(`Error parsing line ${index + 2}: ${error.message}`);
      }
    });
  }

  /**
   * Generate CSV template for import
   */
  static generateTemplate(): string {
    const headers = [
      'name',
      'email', 
      'cnpj',
      'phone',
      'address',
      'city',
      'state',
      'zip',
      'country',
      'currency_code',
    ];

    const exampleRow = [
      'Empresa Solar LTDA',
      'admin@empresasolar.com.br',
      '12.345.678/0001-90',
      '+55 11 99999-9999',
      'Rua das Flores, 123',
      'São Paulo',
      'SP',
      '01234-567',
      'BR',
      'BRL',
    ];

    return [headers, exampleRow]
      .map(row => row.join(','))
      .join('\n');
  }

  private static escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private static parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    result.push(current);
    return result;
  }
}