import CreditAnalysisService, { CreditAnalysisInput } from "../service"

describe("CreditAnalysisService", () => {
    let service: CreditAnalysisService

    beforeEach(() => {
        service = new CreditAnalysisService()
    })

    const baseInput: CreditAnalysisInput = {
        customer_id: "cus_test_01",
        customer_type: "individual",
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
        financing_modality: "CDC",
        has_down_payment: true,
        down_payment_amount: 5000,
        documents: {
            income_proof: "s3://bucket/income.pdf"
        },
        submission_source: "unit-test"
    }

    it("approves a strong applicant with favorable metrics", async () => {
        const analysis = await service.createCreditAnalysis(baseInput)
        const result = await service.analyzeCreditAutomatically(analysis)

        expect(result.approved).toBe(true)
        expect(result.approved_amount).toBe(baseInput.requested_amount)
        expect(result.approved_term_months).toBe(baseInput.requested_term_months)
        expect(result.approval_conditions).toEqual([])
        expect(result.approved_interest_rate).toBeCloseTo(0.013, 3)
    })

    it("rejects applicant with high debt ratio and negative credit", async () => {
        const riskyInput: CreditAnalysisInput = {
            ...baseInput,
            customer_id: "cus_test_02",
            credit_score: 580,
            has_negative_credit: true,
            monthly_debts: 3500,
            requested_amount: 40000,
            requested_term_months: 72,
            has_down_payment: false,
            down_payment_amount: undefined
        }

        const analysis = await service.createCreditAnalysis(riskyInput)
        const result = await service.analyzeCreditAutomatically(analysis)

        expect(result.approved).toBe(false)
        expect(result.rejection_reason).toBe("Restrições no CPF/CNPJ (Serasa/SPC)")
        expect(result.recommended_actions).toEqual(
            expect.arrayContaining([
                "Regularizar pendências no Serasa/SPC",
                "Reduzir dívidas mensais ou aumentar renda comprovada",
                "Considerar entrada de 20-30% do valor total"
            ])
        )
    })
})
