import { POST as calculateViability, GET as quickViability } from "../../../../src/api/solar/viability/route"

const mockCalculateViability = jest.fn()

jest.mock("../../../../src/modules/solar/services/viability", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        calculateViability: mockCalculateViability,
    })),
}))

type MockResponse = {
    statusCode: number
    jsonBody: any
    status: jest.MockedFunction<(code: number) => MockResponse>
    json: jest.MockedFunction<(body: any) => MockResponse>
}

const createMockResponse = (): MockResponse => {
    const response: Partial<MockResponse> = {
        statusCode: 200,
        jsonBody: undefined,
    }

    response.status = jest.fn(function (this: MockResponse, code: number) {
        this.statusCode = code
        return this
    }) as MockResponse["status"]

    response.json = jest.fn(function (this: MockResponse, body: any) {
        this.jsonBody = body
        return this
    }) as MockResponse["json"]

    return response as MockResponse
}

const buildValidPayload = () => ({
    location: {
        latitude: -23.55,
        longitude: -46.63,
        uf: "SP",
    },
    system: {
        inverter_id: "inv_test",
        panel_id: "panel_test",
        modules_per_string: 10,
        strings: 2,
    },
    financial: {
        investment: 50000,
        periods: 60,
        system: "SAC" as const,
    },
    consumption: {
        monthly_kwh: 600,
        grupo: "B1" as const,
    },
})

const buildSuccessResult = () => ({
    success: true,
    energy: {
        annual_generation_kwh: 12000,
        monthly_avg_kwh: 1000,
        monthly_generation: new Array(12).fill(1000),
        performance_ratio: 0.82,
        specific_yield: 2000,
        capacity_factor: 0.23,
        system_size_kwp: 6,
    },
    financial: {
        annual_savings: 9000,
        monthly_savings: 750,
        payback_years: 5,
        roi_percent: 18,
        irr_percent: 16,
        npv: 12000,
        financing_simulation: {
            summary: {
                average_payment: 500,
                total_paid: 60000,
            },
        },
        savings_breakdown: {
            current_annual_cost: 15000,
            new_annual_cost: 6000,
            avoided_cost: 9000,
        },
    },
    mppt_validation: {
        compatible: true,
    },
    tariff_info: {
        uf: "SP",
    },
    warnings: [],
    errors: [],
    metadata: {
        calculated_at: new Date().toISOString(),
        calculation_time_ms: 1234,
    },
})

describe("Solar viability HTTP handlers", () => {
    beforeEach(() => {
        mockCalculateViability.mockReset()
    })

    it("returns viability report on successful POST", async () => {
        const payload = buildValidPayload()
        const expectedResult = buildSuccessResult()
        mockCalculateViability.mockResolvedValue(expectedResult)

        const req: any = { body: payload }
        const res = createMockResponse()

        await calculateViability(req, res as any)

        expect(mockCalculateViability).toHaveBeenCalledWith(
            payload.location,
            payload.system,
            payload.financial,
            payload.consumption,
        )
        expect(res.statusCode).toBe(200)
        expect(res.jsonBody).toEqual(expectedResult)
    })

    it("returns 500 when viability service fails", async () => {
        const payload = buildValidPayload()
        const failureResult = {
            success: false,
            energy: null,
            financial: null,
            mppt_validation: null,
            tariff_info: null,
            warnings: ["mppt_warning"],
            errors: ["failure"],
            metadata: {
                calculated_at: new Date().toISOString(),
                calculation_time_ms: 200,
            },
        }

        mockCalculateViability.mockResolvedValue(failureResult)

        const req: any = { body: payload }
        const res = createMockResponse()

        await calculateViability(req, res as any)

        expect(res.statusCode).toBe(500)
        expect(res.jsonBody).toEqual({
            error: "Viability calculation failed",
            details: failureResult.errors,
            warnings: failureResult.warnings,
        })
    })

    it("returns 400 when required POST fields are missing", async () => {
        const req: any = {
            body: {
                ...buildValidPayload(),
                location: undefined,
            },
        }
        const res = createMockResponse()

        await calculateViability(req, res as any)

        expect(res.statusCode).toBe(400)
        expect(res.jsonBody?.error).toBe("Missing required location parameters")
        expect(res.jsonBody?.required).toContain("location.latitude")
        expect(mockCalculateViability).not.toHaveBeenCalled()
    })

    it("parses query parameters and returns quick viability result", async () => {
        const expectedResult = buildSuccessResult()
        mockCalculateViability.mockResolvedValue(expectedResult)

        const req: any = {
            query: {
                latitude: "-22.9",
                longitude: "-43.2",
                uf: "RJ",
                inverter_id: "inv_test",
                panel_id: "panel_test",
                modules_per_string: "12",
                strings: "3",
                monthly_kwh: "800",
                investment: "65000",
                periods: "72",
            },
        }
        const res = createMockResponse()

        await quickViability(req as any, res as any)

        expect(mockCalculateViability).toHaveBeenCalledTimes(1)
        expect(mockCalculateViability).toHaveBeenCalledWith(
            {
                latitude: -22.9,
                longitude: -43.2,
                uf: "RJ",
            },
            {
                inverter_id: "inv_test",
                panel_id: "panel_test",
                modules_per_string: 12,
                strings: 3,
            },
            {
                investment: 65000,
                periods: 72,
                system: "SAC",
            },
            {
                monthly_kwh: 800,
                grupo: "B1",
            },
        )
        expect(res.statusCode).toBe(200)
        expect(res.jsonBody).toEqual(expectedResult)
    })

    it("returns 400 for quick viability when query params missing", async () => {
        const req: any = {
            query: {
                latitude: "-22.9",
                longitude: "-43.2",
                uf: "RJ",
                inverter_id: "inv_test",
                // panel_id missing
            },
        }
        const res = createMockResponse()

        await quickViability(req as any, res as any)

        expect(res.statusCode).toBe(400)
        expect(res.jsonBody?.error).toBe("Missing required query parameters")
        expect(res.jsonBody?.required).toContain("panel_id")
        expect(mockCalculateViability).not.toHaveBeenCalled()
    })
})
