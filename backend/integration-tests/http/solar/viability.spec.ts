import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

// Mock Python subprocess to force fallback calculation (no external dependency)
jest.mock("child_process", () => {
    const { EventEmitter } = require("events")

    return {
        spawn: jest.fn(() => {
            const process = new EventEmitter()
            process.stdout = new EventEmitter()
            process.stderr = new EventEmitter()

            // Emit error on next tick to trigger fallback path
            process.nextTick(() => {
                process.emit("error", new Error("python runtime unavailable"))
            })

            return process
        })
    }
})

// Mock axios to avoid external BACEN requests
type AxiosGet = (url: string) => Promise<{ data: Array<{ data: string; valor: string }> }>

jest.mock("axios", () => {
    const mockGet: AxiosGet = async (url: string) => {
        if (url.includes("/432/")) {
            return { data: [{ data: "2025-09-30", valor: "10.50" }] }
        }
        if (url.includes("/12/")) {
            return { data: [{ data: "2025-09-30", valor: "10.10" }] }
        }
        if (url.includes("/433/")) {
            return { data: [{ data: "2025-09-30", valor: "0.35" }] }
        }

        return { data: [{ data: new Date().toISOString().split("T")[0], valor: "10.00" }] }
    }

    return {
        get: jest.fn(mockGet)
    }
})

jest.setTimeout(60_000)

medusaIntegrationTestRunner({
    inApp: true,
    env: {},
    testSuite: ({ api }) => {
        describe("Solar viability endpoint", () => {
            it("returns a full viability report using fallback model", async () => {
                const payload = {
                    location: {
                        latitude: -23.5505,
                        longitude: -46.6333,
                        uf: "SP",
                        altitude: 760,
                        timezone: "America/Sao_Paulo"
                    },
                    system: {
                        inverter_id: "Deye__SUN_2250G4_21",
                        panel_id: "Odex__585W",
                        modules_per_string: 10,
                        strings: 1,
                        surface_tilt: 23,
                        surface_azimuth: 0,
                        losses: {
                            soiling: 0.03,
                            shading: 0,
                            mismatch: 0.02,
                            wiring: 0.02,
                            connections: 0.005,
                            lid: 0.015,
                            nameplate: 0.01,
                            availability: 0.03
                        }
                    },
                    financial: {
                        investment: 23500,
                        periods: 60,
                        system: "PRICE" as const,
                        spread: 3.5
                    },
                    consumption: {
                        monthly_kwh: 450,
                        grupo: "B1" as const,
                        bandeira: "amarela" as const
                    }
                }

                const response = await api.post("/api/solar/viability", payload)

                expect(response.status).toBe(200)
                expect(response.data.success).toBe(true)

                const { energy, financial, mppt_validation, tariff_info } = response.data

                expect(energy.system_size_kwp).toBeCloseTo(5.85, 2)
                expect(energy.annual_generation_kwh).toBeGreaterThan(7000)
                expect(energy.monthly_generation).toHaveLength(12)

                expect(mppt_validation.compatible).toBe(true)
                expect(tariff_info.uf).toBe("SP")

                expect(financial.monthly_savings).toBeGreaterThan(0)
                expect(financial.payback_years).toBeGreaterThan(0)
                expect(financial.financing_simulation.summary.total_paid).toBeGreaterThan(0)
                expect(typeof financial.financing_simulation.net_monthly_cash_flow).toBe("number")
            })
        })
    }
})
