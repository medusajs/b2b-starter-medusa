import ViabilityCalculatorService from "../../../src/modules/solar/services/viability"
import BACENFinancingService from "../../../src/modules/financing/bacen-service"

// Mocks are declared outside to allow reassignment per test
const createPVLibMock = () => ({
    getInverterById: jest.fn().mockResolvedValue({
        id: "inverter_test",
        sandia_params: {},
        technical_specs: {
            power_w: 550,
        },
    }),
    getPanelById: jest.fn().mockResolvedValue({
        id: "panel_test",
        cec_params: {},
        technical_specs: {
            power_w: 550,
        },
    }),
    validateMPPT: jest.fn().mockReturnValue({
        compatible: true,
        warnings: [],
        v_string_min: 400,
        v_string_max: 820,
        v_mppt_low: 350,
        v_mppt_high: 840,
    }),
})

const createANEELMock = () => ({
    getTariffByUF: jest.fn().mockReturnValue({
        uf: "SP",
        distributor: "ENEL",
        base_rate: 0.78,
    }),
    calculateSolarSavings: jest.fn().mockReturnValue({
        annual_savings: 9600,
        current_annual_cost: 18240,
        new_annual_cost: 8640,
    }),
})

let pvlibMock: ReturnType<typeof createPVLibMock>
let aneelMock: ReturnType<typeof createANEELMock>

jest.mock("../../../src/modules/pvlib-integration/service", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => pvlibMock),
}))

jest.mock("../../../src/modules/aneel-tariff/service", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => aneelMock),
}))

describe("ViabilityCalculatorService financing integration", () => {
    const baseLocation = {
        latitude: -23.55,
        longitude: -46.63,
        uf: "SP" as const,
    }

    const baseSystem = {
        inverter_id: "inverter_test",
        panel_id: "panel_test",
        modules_per_string: 10,
        strings: 2,
    }

    const baseConsumption = {
        monthly_kwh: 720,
        grupo: "B1" as const,
    }

    const modelChainResult = {
        annual_generation_kwh: 12000,
        monthly_avg_kwh: 1000,
        monthly_generation: Array(12).fill(1000),
        performance_ratio: 0.82,
        capacity_factor: 0.24,
    }

    let bacenRateSpy: jest.SpyInstance<Promise<number>, [number?]>
    let runModelChainSpy: jest.SpyInstance

    beforeEach(() => {
        pvlibMock = createPVLibMock()
        aneelMock = createANEELMock()
        bacenRateSpy = jest
            .spyOn(BACENFinancingService.prototype, "getSolarFinancingRate")
            .mockResolvedValue(15.5)

        runModelChainSpy = jest
            .spyOn(ViabilityCalculatorService.prototype as any, "runPythonModelChain")
            .mockResolvedValue(modelChainResult)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("uses BACEN rates to enrich the financing simulation when none is provided", async () => {
        const service = new ViabilityCalculatorService()

        const result = await service.calculateViability(
            baseLocation,
            baseSystem,
            {
                investment: 50000,
                periods: 60,
                system: "SAC",
            },
            baseConsumption,
        )

        expect(result.success).toBe(true)
        expect(bacenRateSpy).toHaveBeenCalledWith(3.5)
        expect(pvlibMock.validateMPPT).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            baseSystem.modules_per_string,
        )
        expect(aneelMock.calculateSolarSavings).toHaveBeenCalledWith(
            baseConsumption.monthly_kwh,
            modelChainResult.monthly_avg_kwh,
            baseLocation.uf,
            baseConsumption.grupo,
        )

        const financial = result.financial!
        const simulation = financial.financing_simulation

        expect(financial.monthly_savings).toBeCloseTo(800, 5)
        expect(simulation.system).toBe("SAC")
        expect(simulation.summary.average_payment).toBeGreaterThan(0)
        expect(simulation.monthly_payment).toBeCloseTo(
            simulation.summary.average_payment,
            5,
        )
        expect(simulation.net_monthly_cash_flow).toBeCloseTo(
            financial.monthly_savings - simulation.monthly_payment,
            5,
        )
    })

    it("respects explicit annual_rate and skips BACEN lookup", async () => {
        const service = new ViabilityCalculatorService()

        const result = await service.calculateViability(
            baseLocation,
            baseSystem,
            {
                investment: 48000,
                periods: 48,
                annual_rate: 18,
                system: "PRICE",
                spread: 4.2,
            },
            baseConsumption,
        )

        expect(bacenRateSpy).not.toHaveBeenCalled()

        const simulation = result.financial!.financing_simulation
        expect(simulation.system).toBe("PRICE")
        expect(simulation.summary.first_payment).toBeCloseTo(
            simulation.summary.last_payment,
            5,
        )
        expect(simulation.summary.total_paid).toBeCloseTo(
            simulation.summary.average_payment * 48,
            4,
        )
    })
})
