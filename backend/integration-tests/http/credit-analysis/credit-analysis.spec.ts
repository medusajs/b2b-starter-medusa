import { randomUUID } from "crypto"
import { POST as createCreditAnalysis, GET as getCreditAnalysis } from "../../../src/api/credit-analysis/route"
import { POST as analyzeCreditAnalysis } from "../../../src/api/credit-analysis/[id]/analyze/route"
import { PATCH as updateCreditStatus } from "../../../src/api/credit-analysis/[id]/status/route"
import { GET as listCreditAnalysesByQuote } from "../../../src/api/credit-analysis/quote/[quote_id]/route"
import CreditAnalysisService from "../../../src/modules/credit-analysis/service"

const buildPayload = (overrides: Record<string, any> = {}) => ({
    customer_id: `cus_${randomUUID()}`,
    customer_type: "individual" as const,
    full_name: "João da Silva",
    cpf_cnpj: "12345678901",
    email: "joao@example.com",
    phone: "11999999999",
    address: {
        street: "Rua Solar",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zip: "01001000",
        country: "Brasil"
    },
    monthly_income: 5000,
    employment_time_months: 36,
    credit_score: 720,
    has_negative_credit: false,
    has_bankruptcy: false,
    monthly_debts: 1200,
    requested_amount: 25000,
    requested_term_months: 60,
    financing_modality: "CDC" as const,
    has_down_payment: true,
    down_payment_amount: 5000,
    documents: {
        income_proof: "s3://bucket/income.pdf"
    },
    submission_source: "integration-test",
    ...overrides
})

type StoredAnalysis = ReturnType<CreditAnalysisService["createCreditAnalysis"]> extends Promise<infer R> ? R & { id: string } : never

type QueryGraphArgs = {
    entity: string
    fields: string[]
    data?: any[] | Record<string, any>
    filters?: Record<string, any>
    order?: Record<string, "ASC" | "DESC">
}

type QueryClient = {
    graph: jest.Mock<Promise<{ data: any[] }>, [QueryGraphArgs]>
}

const createQueryClient = (store: Map<string, StoredAnalysis>): QueryClient => {
    const graph = jest.fn(async ({ data, filters, order }: QueryGraphArgs) => {
        if (Array.isArray(data) && data.length > 0) {
            const [record] = data
            const id = `cred_${randomUUID()}`
            const stored: StoredAnalysis = {
                id,
                analysis_result: null,
                ...record,
            }
            store.set(id, stored)
            return { data: [stored] }
        }

        if (data && !Array.isArray(data) && filters?.id) {
            const current = store.get(filters.id)
            if (!current) {
                return { data: [] }
            }
            const updated = {
                ...current,
                ...data
            }
            store.set(filters.id, updated)
            return { data: [{ id: filters.id }] }
        }

        if (filters?.id) {
            const record = store.get(filters.id)
            return { data: record ? [record] : [] }
        }

        if (filters?.quote_id) {
            const matches = Array.from(store.values()).filter((item) => item.quote_id === filters.quote_id)
            if (order?.submitted_at === "DESC") {
                matches.sort((a, b) => {
                    const timeA = (a.submitted_at as Date).getTime()
                    const timeB = (b.submitted_at as Date).getTime()
                    return timeB - timeA
                })
            }
            return { data: matches }
        }

        return { data: [] }
    })

    return { graph }
}

const createScope = (service: CreditAnalysisService, query: QueryClient) => ({
    resolve: (token: string) => {
        if (token === "creditAnalysisService") {
            return service
        }
        if (token === "query") {
            return query
        }
        throw new Error(`Unexpected dependency requested: ${token}`)
    }
})

const createMockResponse = () => {
    const response: any = {
        statusCode: 200,
        jsonBody: undefined,
        status: jest.fn(function (this: any, code: number) {
            this.statusCode = code
            return this
        }),
        json: jest.fn(function (this: any, body: any) {
            this.jsonBody = body
            return this
        })
    }

    return response
}

describe("Credit analysis HTTP handlers", () => {
    let store: Map<string, StoredAnalysis>
    let query: QueryClient
    let service: CreditAnalysisService

    beforeEach(() => {
        store = new Map()
        query = createQueryClient(store)
        service = new CreditAnalysisService()
    })

    const createRequest = (overrides: Record<string, any> = {}) => ({
        body: buildPayload(overrides.bodyOverrides ?? {}),
        params: overrides.params ?? {},
        query: overrides.query ?? {},
        headers: overrides.headers ?? {},
        ip: overrides.ip ?? "127.0.0.1",
        scope: overrides.scope ?? createScope(service, query),
    })

    const createAnalysisRecord = async (payloadOverrides: Record<string, any> = {}) => {
        const req: any = createRequest({ bodyOverrides: payloadOverrides })
        const res = createMockResponse()

        await createCreditAnalysis(req, res)

        if (res.statusCode !== 201) {
            throw new Error(`Failed to create credit analysis: ${res.jsonBody?.error ?? "unknown"}`)
        }

        return {
            response: res,
            analysis: res.jsonBody.credit_analysis as StoredAnalysis,
            payload: req.body
        }
    }

    it("creates and persists a new credit analysis", async () => {
        const { response, analysis, payload } = await createAnalysisRecord()

        expect(response.statusCode).toBe(201)
        expect(response.jsonBody.success).toBe(true)
        expect(analysis.id).toMatch(/^cred_/)
        expect(analysis.customer_id).toBe(payload.customer_id)
        expect(analysis.status).toBe("pending")
        expect(analysis.debt_to_income_ratio).toBeCloseTo((payload.monthly_debts ?? 0) / (payload.monthly_income ?? 0), 4)
        expect(analysis.submitted_at).toBeInstanceOf(Date)
        expect(analysis.documents).toMatchObject(payload.documents)
        expect(analysis.analysis_result).toBeNull()

        // Ensure record stored in the simulated database
        expect(store.get(analysis.id)).toBeDefined()
    })

    it("retrieves a credit analysis by id", async () => {
        const { analysis } = await createAnalysisRecord()
        const req: any = {
            params: { id: analysis.id },
            scope: createScope(service, query),
        }
        const res = createMockResponse()

        await getCreditAnalysis(req, res)

        expect(res.statusCode).toBe(200)
        expect(res.jsonBody.success).toBe(true)
        expect(res.jsonBody.credit_analysis.id).toBe(analysis.id)
        expect(res.jsonBody.credit_analysis.customer_id).toBe(analysis.customer_id)
    })

    it("approves a strong applicant via automatic analysis", async () => {
        const { analysis, payload } = await createAnalysisRecord()
        const req: any = {
            params: { id: analysis.id },
            scope: createScope(service, query)
        }
        const res = createMockResponse()

        await analyzeCreditAnalysis(req, res)

        expect(res.statusCode).toBe(200)
        expect(res.jsonBody.success).toBe(true)
        expect(res.jsonBody.analysis_result.approved).toBe(true)
        expect(res.jsonBody.analysis_result.approved_amount).toBe(payload.requested_amount)
        expect(res.jsonBody.credit_analysis.status).toBe("approved")
        expect(res.jsonBody.credit_analysis.analysis_result.approved).toBe(true)
    })

    it("rejects a high-risk applicant", async () => {
        const overrides = {
            customer_id: `cus_${randomUUID()}`,
            credit_score: 520,
            has_negative_credit: true,
            monthly_debts: 3500,
            requested_amount: 40000,
            requested_term_months: 72,
            has_down_payment: false,
            down_payment_amount: undefined
        }

        const { analysis } = await createAnalysisRecord(overrides)
        const req: any = {
            params: { id: analysis.id },
            scope: createScope(service, query)
        }
        const res = createMockResponse()

        await analyzeCreditAnalysis(req, res)

        expect(res.statusCode).toBe(200)
        expect(res.jsonBody.success).toBe(true)
        expect(res.jsonBody.analysis_result.approved).toBe(false)
        expect(res.jsonBody.analysis_result.rejection_reason).toBe("Restrições no CPF/CNPJ (Serasa/SPC)")
        expect(res.jsonBody.credit_analysis.status).toBe("rejected")
    })

    it("updates the analysis status manually", async () => {
        const { analysis } = await createAnalysisRecord()
        const req: any = {
            params: { id: analysis.id },
            body: {
                status: "conditional",
                analyst_notes: "Enviar comprovante de renda atualizado"
            },
            scope: createScope(service, query)
        }
        const res = createMockResponse()

        await updateCreditStatus(req, res)

        expect(res.statusCode).toBe(200)
        expect(res.jsonBody.success).toBe(true)
        expect(res.jsonBody.credit_analysis.status).toBe("conditional")
        expect(res.jsonBody.credit_analysis.analyst_notes).toBe("Enviar comprovante de renda atualizado")
        expect(res.jsonBody.credit_analysis.reviewed_at).toBeInstanceOf(Date)
    })

    it("lists analyses associated with a quote", async () => {
        const quoteId = `quote_${randomUUID()}`
        await createAnalysisRecord({ quote_id: quoteId })
        await createAnalysisRecord({ quote_id: quoteId })

        const req: any = {
            params: { quote_id: quoteId },
            scope: createScope(service, query)
        }
        const res = createMockResponse()

        await listCreditAnalysesByQuote(req, res)

        expect(res.statusCode).toBe(200)
        expect(res.jsonBody.success).toBe(true)
        expect(res.jsonBody.count).toBeGreaterThanOrEqual(2)
        res.jsonBody.credit_analyses.forEach((item: StoredAnalysis) => {
            expect(item.quote_id).toBe(quoteId)
        })
    })
})
