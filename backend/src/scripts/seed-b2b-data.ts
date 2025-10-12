/**
 * Seed B2B Data Script
 * ====================
 * 
 * Gera dados de exemplo para testar funcionalidades B2B:
 * - Empresas (Companies)
 * - Funcionários (Employees)
 * - Configurações de aprovação (ApprovalSettings)
 * - Clientes vinculados
 * 
 * Baseado no framework de jornada:
 * Etapa: Seleção/Fechamento (Win-rate, SQL→Order)
 * 
 * KPIs: SQL rate, Win-rate, Lead→Go-Live
 */

import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type CompanyData = {
  name: string
  cnpj: string
  razao_social: string
  email: string
  phone: string
  spending_limit: number
  approval_required_above: number
  industry: string
  size: "small" | "medium" | "large"
}

type EmployeeData = {
  customer_email: string
  customer_name: string
  role: "buyer" | "approver" | "admin"
  spending_limit?: number
}

const COMPANIES: CompanyData[] = [
  {
    name: "Solar Engenharia LTDA",
    cnpj: "12.345.678/0001-90",
    razao_social: "SOLAR ENGENHARIA LTDA",
    email: "contato@solareng.com.br",
    phone: "+55 11 91234-5678",
    spending_limit: 50000,
    approval_required_above: 10000,
    industry: "engineering",
    size: "medium",
  },
  {
    name: "GreenPower Instalações",
    cnpj: "98.765.432/0001-10",
    razao_social: "GREENPOWER INSTALACOES ELETRICAS LTDA",
    email: "comercial@greenpower.com.br",
    phone: "+55 21 98765-4321",
    spending_limit: 100000,
    approval_required_above: 25000,
    industry: "construction",
    size: "large",
  },
  {
    name: "EcoSol Projetos",
    cnpj: "11.222.333/0001-44",
    razao_social: "ECOSOL PROJETOS SUSTENTAVEIS LTDA",
    email: "projetos@ecosol.com.br",
    phone: "+55 31 93456-7890",
    spending_limit: 30000,
    approval_required_above: 5000,
    industry: "consulting",
    size: "small",
  },
  {
    name: "Condomínio Residencial Parque Solar",
    cnpj: "55.666.777/0001-88",
    razao_social: "CONDOMINIO RESIDENCIAL PARQUE SOLAR",
    email: "sindico@parquesolar.com.br",
    phone: "+55 11 94567-8901",
    spending_limit: 150000,
    approval_required_above: 50000,
    industry: "real_estate",
    size: "large",
  },
]

const EMPLOYEES_BY_COMPANY: Record<string, EmployeeData[]> = {
  "Solar Engenharia LTDA": [
    {
      customer_email: "carlos.silva@solareng.com.br",
      customer_name: "Carlos Silva",
      role: "admin",
      spending_limit: 50000,
    },
    {
      customer_email: "ana.costa@solareng.com.br",
      customer_name: "Ana Costa",
      role: "buyer",
      spending_limit: 5000,
    },
    {
      customer_email: "joao.santos@solareng.com.br",
      customer_name: "João Santos",
      role: "approver",
      spending_limit: 25000,
    },
  ],
  "GreenPower Instalações": [
    {
      customer_email: "roberto.lima@greenpower.com.br",
      customer_name: "Roberto Lima",
      role: "admin",
      spending_limit: 100000,
    },
    {
      customer_email: "patricia.souza@greenpower.com.br",
      customer_name: "Patrícia Souza",
      role: "buyer",
      spending_limit: 10000,
    },
  ],
  "EcoSol Projetos": [
    {
      customer_email: "fernanda.oliveira@ecosol.com.br",
      customer_name: "Fernanda Oliveira",
      role: "admin",
      spending_limit: 30000,
    },
  ],
  "Condomínio Residencial Parque Solar": [
    {
      customer_email: "sindico@parquesolar.com.br",
      customer_name: "José Pereira (Síndico)",
      role: "admin",
      spending_limit: 150000,
    },
    {
      customer_email: "subsindico@parquesolar.com.br",
      customer_name: "Maria Santos (Subsíndico)",
      role: "approver",
      spending_limit: 50000,
    },
    {
      customer_email: "zelador@parquesolar.com.br",
      customer_name: "Paulo Rodrigues (Zelador)",
      role: "buyer",
      spending_limit: 5000,
    },
  ],
}

async function seedB2BData(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const dbConnection = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  logger.info("🌱 Iniciando seed de dados B2B...")

  try {
    // 1. Criar empresas
    logger.info("📊 Criando empresas...")
    const createdCompanies = new Map<string, string>()

    for (const companyData of COMPANIES) {
      // Verificar se empresa já existe
      const existingCompany = await dbConnection.raw(
        `SELECT id FROM company WHERE cnpj = ?`,
        [companyData.cnpj]
      )

      let companyId: string

      if (existingCompany.rows.length > 0) {
        companyId = existingCompany.rows[0].id
        logger.info(`  ↻ Empresa já existe: ${companyData.name}`)
      } else {
        const result = await dbConnection.raw(
          `INSERT INTO company (
            name, cnpj, razao_social, email, phone, 
            spending_limit, industry, size, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING id`,
          [
            companyData.name,
            companyData.cnpj,
            companyData.razao_social,
            companyData.email,
            companyData.phone,
            companyData.spending_limit,
            companyData.industry,
            companyData.size,
          ]
        )

        companyId = result.rows[0].id
        logger.info(`  ✓ Criada: ${companyData.name} (ID: ${companyId})`)

        // Criar ApprovalSettings
        await dbConnection.query(
          `INSERT INTO approval_settings (
            company_id, approval_required_above, created_at, updated_at
          ) VALUES ($1, $2, NOW(), NOW())`,
          [companyId, companyData.approval_required_above]
        )
      }

      createdCompanies.set(companyData.name, companyId)
    }

    // 2. Criar clientes/funcionários
    logger.info("\n👥 Criando clientes e vinculando a empresas...")
    let employeeCount = 0

    for (const [companyName, employees] of Object.entries(EMPLOYEES_BY_COMPANY)) {
      const companyId = createdCompanies.get(companyName)
      if (!companyId) {
        logger.warn(`  ⚠ Empresa não encontrada: ${companyName}`)
        continue
      }

      for (const empData of employees) {
        // Verificar se customer já existe
        let customerResult = await dbConnection.query(
          `SELECT id FROM customer WHERE email = $1`,
          [empData.customer_email]
        )

        let customerId: string

        if (customerResult.rows.length > 0) {
          customerId = customerResult.rows[0].id
          logger.info(`  ↻ Cliente já existe: ${empData.customer_email}`)
        } else {
          // Criar customer
          const insertCustomer = await dbConnection.query(
            `INSERT INTO customer (
              email, first_name, last_name, has_account, created_at, updated_at
            ) VALUES ($1, $2, $3, true, NOW(), NOW())
            RETURNING id`,
            [
              empData.customer_email,
              empData.customer_name.split(" ")[0],
              empData.customer_name.split(" ").slice(1).join(" ") || empData.customer_name,
            ]
          )

          customerId = insertCustomer.rows[0].id
          logger.info(`  ✓ Cliente criado: ${empData.customer_email}`)
        }

        // Verificar se employee já existe
        const existingEmployee = await dbConnection.query(
          `SELECT id FROM employee WHERE customer_id = $1 AND company_id = $2`,
          [customerId, companyId]
        )

        if (existingEmployee.rows.length === 0) {
          // Criar Employee
          await dbConnection.query(
            `INSERT INTO employee (
              customer_id, company_id, role, spending_limit, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [customerId, companyId, empData.role, empData.spending_limit]
          )

          logger.info(`    → Vinculado como ${empData.role} com limite R$ ${empData.spending_limit?.toLocaleString("pt-BR")}`)
          employeeCount++
        } else {
          logger.info(`    ↻ Vínculo já existe`)
        }
      }
    }

    // 3. Relatório final
    logger.info("\n" + "=".repeat(60))
    logger.info("✅ Seed B2B concluído com sucesso!")
    logger.info("=".repeat(60))
    logger.info(`📊 Empresas: ${createdCompanies.size}`)
    logger.info(`👥 Funcionários: ${employeeCount}`)
    logger.info("\n📋 Resumo por empresa:")

    for (const [companyName, companyId] of createdCompanies) {
      const company = COMPANIES.find((c) => c.name === companyName)
      const employees = EMPLOYEES_BY_COMPANY[companyName] || []

      logger.info(`\n  ${companyName}`)
      logger.info(`    CNPJ: ${company?.cnpj}`)
      logger.info(`    Limite Total: R$ ${company?.spending_limit.toLocaleString("pt-BR")}`)
      logger.info(`    Aprovação Acima de: R$ ${company?.approval_required_above.toLocaleString("pt-BR")}`)
      logger.info(`    Funcionários: ${employees.length}`)
      employees.forEach((emp) => {
        logger.info(`      - ${emp.customer_name} (${emp.role}) - Limite: R$ ${emp.spending_limit?.toLocaleString("pt-BR") || "N/A"}`)
      })
    }

    logger.info("\n" + "=".repeat(60))
    logger.info("🎯 Próximos passos:")
    logger.info("  1. Testar login com qualquer email acima")
    logger.info("  2. Adicionar itens ao carrinho > limite de aprovação")
    logger.info("  3. Verificar fluxo de aprovação no admin")
    logger.info("=".repeat(60))
  } catch (error) {
    logger.error("❌ Erro ao criar seed B2B:", error)
    throw error
  }
}

export default seedB2BData

// CLI execution
if (require.main === module) {
  const { createMedusaContainer } = require("@medusajs/framework/utils")
  const { medusaIntegrationTestRunner } = require("@medusajs/test-utils")

  medusaIntegrationTestRunner({
    testSuite: async ({ getContainer }) => {
      const container = await getContainer()
      await seedB2BData(container)
    },
  })
}
