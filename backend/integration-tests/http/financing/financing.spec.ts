import { GET as getRates } from "../../../src/api/financing/rates/route"
import { POST as simulateFinancing } from "../../../src/api/financing/simulate/route"

const mockGetAllRates = jest.fn()
const mockGetSolarFinancingRate = jest.fn()
const mockSimulateSAC = jest.fn()
const mockSimulatePrice = jest.fn()

jest.mock("../../../src/modules/financing/bacen-service", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        getAllRates: mockGetAllRates,
        getSolarFinancingRate: mockGetSolarFinancingRate,
        simulateSAC: mockSimulateSAC,
        simulatePrice: mockSimulatePrice,
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

describe("Financing HTTP handlers", () => {
    beforeEach(() => {
        mockGetAllRates.mockReset()
        mockGetSolarFinancingRate.mockReset()
        mockSimulateSAC.mockReset()
        mockSimulatePrice.mockReset()
    })

    describe("GET /api/financing/rates", () => {
        it("returns BACEN rates successfully", async () => {
            const mockRates = {
                selic: {
                    rate: 10.5,
                    date: "01/10/2024",
                    annual_rate: 10.5,
                },
                cdi: {
                    rate: 10.15,
                    date: "01/10/2024",
                    annual_rate: 10.15,
                },
                ipca: {
                    rate: 4.5,
                    date: "01/10/2024",
                    annual_rate: 54,
                },
                updated_at: "2024-10-08T10:00:00Z",
            }

            mockGetAllRates.mockResolvedValue(mockRates)

            const req: any = {}
            const res = createMockResponse()

            await getRates(req, res as any)

            expect(mockGetAllRates).toHaveBeenCalledTimes(1)
            expect(res.statusCode).toBe(200)
            expect(res.jsonBody).toEqual(mockRates)
        })

        it("returns 500 on BACEN API failure", async () => {
            mockGetAllRates.mockRejectedValue(new Error("BACEN API timeout"))

            const req: any = {}
            const res = createMockResponse()

            await getRates(req, res as any)

            expect(res.statusCode).toBe(500)
            expect(res.jsonBody?.error).toBe("Failed to fetch financing rates")
        })
    })

    describe("POST /api/financing/simulate", () => {
        const basePayload = {
            principal: 50000,
            periods: 60,
            system: "SAC" as const,
        }

        it("simulates SAC financing with automatic rate lookup", async () => {
            mockGetSolarFinancingRate.mockResolvedValue(15.5)
            mockSimulateSAC.mockReturnValue({
                principal: 50000,
                interest_rate: 15.5,
                periods: 60,
                system: "SAC",
                payments: [],
                summary: {
                    total_paid: 58250,
                    total_interest: 8250,
                    first_payment: 1040,
                    last_payment: 835,
                    average_payment: 970,
                },
            })

            const req: any = { body: basePayload }
            const res = createMockResponse()

            await simulateFinancing(req, res as any)

            expect(mockGetSolarFinancingRate).toHaveBeenCalledWith(undefined)
            expect(mockSimulateSAC).toHaveBeenCalledWith(50000, 15.5, 60)
            expect(res.statusCode).toBe(200)
            expect(res.jsonBody.system).toBe("SAC")
            expect(res.jsonBody.summary.total_paid).toBe(58250)
        })

        it("simulates PRICE financing with explicit rate", async () => {
            mockSimulatePrice.mockReturnValue({
                principal: 48000,
                interest_rate: 18,
                periods: 48,
                system: "PRICE",
                payments: [],
                summary: {
                    total_paid: 57600,
                    total_interest: 9600,
                    first_payment: 1200,
                    last_payment: 1200,
                    average_payment: 1200,
                },
            })

            const req: any = {
                body: {
                    principal: 48000,
                    periods: 48,
                    system: "PRICE",
                    annual_rate: 18,
                },
            }
            const res = createMockResponse()

            await simulateFinancing(req, res as any)

            expect(mockGetSolarFinancingRate).not.toHaveBeenCalled()
            expect(mockSimulatePrice).toHaveBeenCalledWith(48000, 18, 48)
            expect(res.statusCode).toBe(200)
            expect(res.jsonBody.system).toBe("PRICE")
            expect(res.jsonBody.summary.first_payment).toBe(
                res.jsonBody.summary.last_payment,
            )
        })

        it("uses custom spread for rate calculation", async () => {
            mockGetSolarFinancingRate.mockResolvedValue(14.2)
            mockSimulateSAC.mockReturnValue({
                principal: 50000,
                interest_rate: 14.2,
                periods: 60,
                system: "SAC",
                payments: [],
                summary: {
                    total_paid: 57100,
                    total_interest: 7100,
                    first_payment: 1000,
                    last_payment: 840,
                    average_payment: 951,
                },
            })

            const req: any = {
                body: {
                    ...basePayload,
                    spread: 2.8,
                },
            }
            const res = createMockResponse()

            await simulateFinancing(req, res as any)

            expect(mockGetSolarFinancingRate).toHaveBeenCalledWith(2.8)
            expect(res.statusCode).toBe(200)
        })

        it("returns 400 when required fields are missing", async () => {
            const req: any = {
                body: {
                    principal: 50000,
                    // periods missing
                },
            }
            const res = createMockResponse()

            await simulateFinancing(req, res as any)

            expect(res.statusCode).toBe(400)
            expect(res.jsonBody?.error).toContain("Missing required")
            expect(mockGetSolarFinancingRate).not.toHaveBeenCalled()
            expect(mockSimulateSAC).not.toHaveBeenCalled()
        })

        it("returns 500 on simulation error", async () => {
            mockGetSolarFinancingRate.mockResolvedValue(15.5)
            mockSimulateSAC.mockImplementation(() => {
                throw new Error("Invalid principal amount")
            })

            const req: any = { body: basePayload }
            const res = createMockResponse()

            await simulateFinancing(req, res as any)

            expect(res.statusCode).toBe(500)
            expect(res.jsonBody?.error).toBe("Failed to simulate financing")
        })
    })
})
