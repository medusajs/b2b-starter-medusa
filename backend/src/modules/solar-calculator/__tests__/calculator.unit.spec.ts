/**
 * Solar Calculator Module - Unit Tests
 * 
 * Testes completos para funções de cálculo solar com cobertura de edge cases.
 */

import {
    calculatePanelToInverterRatio,
    estimateEnergyGeneration,
    validateSystemCompatibility,
    calculateTotalPanelPower,
    calculateTotalInverterPower,
    calculateDegradation,
    projectEnergyGeneration,
    SolarSystem,
    SolarPanel,
    SolarInverter,
    PANEL_TO_INVERTER_RATIO,
} from '../index';

describe('Solar Calculator - Power Calculations', () => {
    describe('calculateTotalPanelPower', () => {
        test('calcula potência total de painéis corretamente', () => {
            const panels: SolarPanel[] = [
                { id: 'p1', name: 'Panel 550W', power_w: 550, quantity: 10 },
                { id: 'p2', name: 'Panel 600W', power_w: 600, quantity: 5 },
            ];

            const totalKw = calculateTotalPanelPower(panels);
            expect(totalKw).toBe(8.5); // (550*10 + 600*5) / 1000 = 8.5kW
        });

        test('retorna zero para array vazio', () => {
            expect(calculateTotalPanelPower([])).toBe(0);
        });

        test('lida com quantidade zero', () => {
            const panels: SolarPanel[] = [
                { id: 'p1', name: 'Panel 550W', power_w: 550, quantity: 0 },
            ];
            expect(calculateTotalPanelPower(panels)).toBe(0);
        });
    });

    describe('calculateTotalInverterPower', () => {
        test('calcula potência total de inversores corretamente', () => {
            const inverters: SolarInverter[] = [
                { id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 },
                { id: 'i2', name: 'Inverter 3kW', power_kw: 3, quantity: 2 },
            ];

            const totalKw = calculateTotalInverterPower(inverters);
            expect(totalKw).toBe(11); // 5*1 + 3*2 = 11kW
        });

        test('retorna zero para array vazio', () => {
            expect(calculateTotalInverterPower([])).toBe(0);
        });
    });
});

describe('Solar Calculator - Ratio Analysis', () => {
    const panels: SolarPanel[] = [
        { id: 'p1', name: 'Panel 550W', power_w: 550, quantity: 10 },
    ];

    const inverters: SolarInverter[] = [
        { id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 },
    ];

    describe('calculatePanelToInverterRatio', () => {
        test('calcula ratio 1.10 (excellent)', () => {
            const result = calculatePanelToInverterRatio(panels, inverters);

            expect(result.ratio).toBe(1.1); // 5.5kW / 5kW = 1.1
            expect(result.totalPanelPowerKw).toBe(5.5);
            expect(result.totalInverterPowerKw).toBe(5);
            expect(result.status).toBe('excellent');
            expect(result.details.oversizingPercentage).toBe(10);
            expect(result.details.panelsPerInverter).toBe(10);
        });

        test('detecta ratio excellent (1.2x)', () => {
            const result = calculatePanelToInverterRatio(
                [{ id: 'p1', name: 'Panel 600W', power_w: 600, quantity: 10 }],
                [{ id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 }]
            );

            expect(result.ratio).toBe(1.2); // 6kW / 5kW
            expect(result.status).toBe('excellent');
        });

        test('detecta ratio good (1.05x)', () => {
            const result = calculatePanelToInverterRatio(
                [{ id: 'p1', name: 'Panel 525W', power_w: 525, quantity: 10 }],
                [{ id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 }]
            );

            expect(result.ratio).toBe(1.05); // 5.25kW / 5kW
            expect(result.status).toBe('good');
        });

        test('detecta ratio acceptable (0.9x)', () => {
            const result = calculatePanelToInverterRatio(
                [{ id: 'p1', name: 'Panel 450W', power_w: 450, quantity: 10 }],
                [{ id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 }]
            );

            expect(result.ratio).toBe(0.9); // 4.5kW / 5kW
            expect(result.status).toBe('acceptable');
            expect(result.recommendation).toBeDefined();
        });

        test('detecta ratio error (0.75x - subdimensionado)', () => {
            const result = calculatePanelToInverterRatio(
                [{ id: 'p1', name: 'Panel 375W', power_w: 375, quantity: 10 }],
                [{ id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 }]
            );

            expect(result.ratio).toBe(0.75); // 3.75kW / 5kW
            expect(result.status).toBe('error'); // 0.75 < WARNING_MIN (0.80)
            expect(result.recommendation).toContain('revise');
        }); test('detecta ratio warning (1.55x - oversizing alto)', () => {
            const result = calculatePanelToInverterRatio(
                [{ id: 'p1', name: 'Panel 775W', power_w: 775, quantity: 10 }],
                [{ id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 }]
            );

            expect(result.ratio).toBe(1.55); // 7.75kW / 5kW
            expect(result.status).toBe('warning');
        });

        test('detecta ratio error (0.5x)', () => {
            const result = calculatePanelToInverterRatio(
                [{ id: 'p1', name: 'Panel 250W', power_w: 250, quantity: 10 }],
                [{ id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 }]
            );

            expect(result.ratio).toBe(0.5); // 2.5kW / 5kW
            expect(result.status).toBe('error');
            expect(result.recommendation).toContain('revise');
        });

        test('lida com múltiplos painéis e inversores', () => {
            const result = calculatePanelToInverterRatio(
                [
                    { id: 'p1', name: 'Panel 550W', power_w: 550, quantity: 8 },
                    { id: 'p2', name: 'Panel 600W', power_w: 600, quantity: 4 },
                ],
                [
                    { id: 'i1', name: 'Inverter 3kW', power_kw: 3, quantity: 2 },
                    { id: 'i2', name: 'Inverter 2kW', power_kw: 2, quantity: 1 },
                ]
            );

            // Panels: (550*8 + 600*4) / 1000 = 6.8kW
            // Inverters: 3*2 + 2*1 = 8kW
            expect(result.totalPanelPowerKw).toBeCloseTo(6.8, 1);
            expect(result.totalInverterPowerKw).toBe(8);
            expect(result.ratio).toBeCloseTo(0.85, 2);
        });

        test('retorna erro quando potência é zero', () => {
            const result = calculatePanelToInverterRatio(
                [{ id: 'p1', name: 'Panel', power_w: 0, quantity: 10 }],
                inverters
            );

            expect(result.status).toBe('error');
            expect(result.message).toContain('potência zero');
        });

        test('considera max_input_power quando habilitado', () => {
            const result = calculatePanelToInverterRatio(
                [{ id: 'p1', name: 'Panel 600W', power_w: 600, quantity: 20 }], // 12kW
                [{ id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1, max_input_power_kw: 6 }],
                { considerMaxInputPower: true }
            );

            expect(result.status).toBe('error');
            expect(result.message).toContain('excede a potência máxima');
        });

        test('modo estrito aplica ranges mais apertados', () => {
            const result = calculatePanelToInverterRatio(
                [{ id: 'p1', name: 'Panel 525W', power_w: 525, quantity: 10 }], // 5.25kW, ratio 1.05
                [{ id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 }],
                { strictMode: true }
            );

            // Em modo estrito, 1.05 cai em 'acceptable' ao invés de 'good'
            expect(result.status).toBe('acceptable');
        });
    });
});

describe('Solar Calculator - Energy Generation', () => {
    const system: SolarSystem = {
        panels: [
            { id: 'p1', name: 'Panel 550W', power_w: 550, quantity: 10 },
        ],
        inverters: [
            { id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 },
        ],
    };

    describe('estimateEnergyGeneration', () => {
        test('calcula geração com HSP padrão (5.0h)', () => {
            const result = estimateEnergyGeneration(system);

            expect(result.systemSizeKwp).toBe(5.5); // 550W * 10
            expect(result.peakSunHours).toBe(5.0);
            expect(result.systemEfficiency).toBeCloseTo(0.76, 2); // 0.80 * 0.975 * 0.97

            // E = 5.5kWp * 5h * 0.7601 = 20.81kWh/dia
            expect(result.dailyKwh).toBeCloseTo(20.81, 1);
            expect(result.monthlyKwh).toBeCloseTo(633, 0); // 20.81 * 30.44
            expect(result.yearlyKwh).toBeCloseTo(7594, 0); // 20.81 * 365
        });

        test('usa HSP regional quando location fornecido', () => {
            const systemWithLocation: SolarSystem = {
                ...system,
                location: { state: 'BA' }, // Bahia: 5.8h
            };

            const result = estimateEnergyGeneration(systemWithLocation);
            expect(result.peakSunHours).toBe(5.8);
            expect(result.dailyKwh).toBeGreaterThan(24); // Maior que com HSP padrão
        });

        test('calcula geração para diferentes estados', () => {
            const sp = estimateEnergyGeneration({
                ...system,
                location: { state: 'SP' }, // 4.6h
            });

            const rn = estimateEnergyGeneration({
                ...system,
                location: { state: 'RN' }, // 5.9h
            });

            expect(sp.peakSunHours).toBe(4.6);
            expect(rn.peakSunHours).toBe(5.9);
            expect(rn.dailyKwh).toBeGreaterThan(sp.dailyKwh);
        });

        test('aplica configurações personalizadas', () => {
            const result = estimateEnergyGeneration(system, {
                config: {
                    performanceRatio: 0.85,
                    inverterEfficiency: 0.98,
                    cableAndOtherLosses: 0.02,
                },
            });

            // Eficiência: 0.85 * 0.98 * 0.98 = 0.816
            expect(result.systemEfficiency).toBeCloseTo(0.816, 3);
            expect(result.dailyKwh).toBeGreaterThan(22); // Melhor eficiência
        });

        test('assumptions contém valores corretos', () => {
            const result = estimateEnergyGeneration(system);

            expect(result.assumptions.peakSunHoursPerDay).toBe(5.0);
            expect(result.assumptions.performanceRatio).toBe(0.80);
            expect(result.assumptions.degradationFirstYear).toBe(0.005);
        });
    });
});

describe('Solar Calculator - System Compatibility', () => {
    describe('validateSystemCompatibility', () => {
        test('valida sistema correto', () => {
            const system: SolarSystem = {
                panels: [
                    { id: 'p1', name: 'Panel 550W', power_w: 550, quantity: 10 },
                ],
                inverters: [
                    { id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 },
                ],
            };

            const result = validateSystemCompatibility(system);

            expect(result.isCompatible).toBe(true);
            expect(result.issues).toHaveLength(0);
            expect(result.score).toBeGreaterThan(80);
        });

        test('detecta falta de painéis', () => {
            const system: SolarSystem = {
                panels: [],
                inverters: [
                    { id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 },
                ],
            };

            const result = validateSystemCompatibility(system);

            expect(result.isCompatible).toBe(false);
            expect(result.issues).toHaveLength(1);
            expect(result.issues[0].code).toBe('NO_PANELS');
            expect(result.issues[0].severity).toBe('critical');
            expect(result.score).toBe(0);
        });

        test('detecta falta de inversores', () => {
            const system: SolarSystem = {
                panels: [
                    { id: 'p1', name: 'Panel 550W', power_w: 550, quantity: 10 },
                ],
                inverters: [],
            };

            const result = validateSystemCompatibility(system);

            expect(result.isCompatible).toBe(false);
            expect(result.issues).toHaveLength(1);
            expect(result.issues[0].code).toBe('NO_INVERTERS');
            expect(result.score).toBe(0);
        });

        test('detecta sistema muito pequeno', () => {
            const system: SolarSystem = {
                panels: [
                    { id: 'p1', name: 'Panel 100W', power_w: 100, quantity: 2 }, // 0.2kWp
                ],
                inverters: [
                    { id: 'i1', name: 'Inverter 0.5kW', power_kw: 0.5, quantity: 1 },
                ],
            };

            const result = validateSystemCompatibility(system);

            expect(result.warnings.some(w => w.code === 'EFFICIENCY_CONCERN')).toBe(true);
        });

        test('detecta ratio inadequado', () => {
            const system: SolarSystem = {
                panels: [
                    { id: 'p1', name: 'Panel 250W', power_w: 250, quantity: 10 }, // 2.5kWp
                ],
                inverters: [
                    { id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 },
                ],
            };

            const result = validateSystemCompatibility(system);

            expect(result.isCompatible).toBe(false); // Ratio 0.5 = error
            expect(result.issues.some(i => i.code === 'INVALID_CONFIGURATION')).toBe(true);
        });

        test('detecta tecnologias mistas', () => {
            const system: SolarSystem = {
                panels: [
                    { id: 'p1', name: 'Mono 550W', power_w: 550, quantity: 5, technology: 'Monocristalino' },
                    { id: 'p2', name: 'Poli 500W', power_w: 500, quantity: 5, technology: 'Policristalino' },
                ],
                inverters: [
                    { id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 },
                ],
            };

            const result = validateSystemCompatibility(system);

            expect(result.warnings.some(w => w.code === 'MIXED_TECHNOLOGIES')).toBe(true);
        });

        test('calcula score corretamente', () => {
            const perfectSystem: SolarSystem = {
                panels: [
                    { id: 'p1', name: 'Panel 550W', power_w: 550, quantity: 10 },
                ],
                inverters: [
                    { id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 },
                ],
            };

            const result = validateSystemCompatibility(perfectSystem);
            expect(result.score).toBe(100);
        });
    });
});

describe('Solar Calculator - Degradation', () => {
    describe('calculateDegradation', () => {
        test('calcula degradação corretamente', () => {
            expect(calculateDegradation(0)).toBeCloseTo(1.0, 4); // Ano 0: sem degradação
            expect(calculateDegradation(1)).toBeCloseTo(0.995, 4); // Ano 1: 0.5%
            expect(calculateDegradation(5)).toBeCloseTo(0.975, 3); // Ano 5: ~2.5%
            expect(calculateDegradation(10)).toBeCloseTo(0.951, 3); // Ano 10: ~4.9%
            expect(calculateDegradation(25)).toBeCloseTo(0.882, 3); // Ano 25: ~11.8%
        });

        test('aceita taxa de degradação personalizada', () => {
            const highDegradation = calculateDegradation(10, 0.01); // 1% ao ano
            const lowDegradation = calculateDegradation(10, 0.003); // 0.3% ao ano

            expect(highDegradation).toBeLessThan(lowDegradation);
            expect(highDegradation).toBeCloseTo(0.904, 3);
        });
    });

    describe('projectEnergyGeneration', () => {
        test('projeta geração para 25 anos', () => {
            const projection = projectEnergyGeneration(10000, 25);

            expect(projection).toHaveLength(25);
            expect(projection[0].year).toBe(1);
            expect(projection[0].kWh).toBe(10000);
            expect(projection[0].degradationFactor).toBe(1.0);

            expect(projection[24].year).toBe(25);
            expect(projection[24].kWh).toBeCloseTo(8867, 0); // ~11.33% degradação
        });

        test('geração decresce a cada ano', () => {
            const projection = projectEnergyGeneration(10000, 10);

            for (let i = 1; i < projection.length; i++) {
                expect(projection[i].kWh).toBeLessThan(projection[i - 1].kWh);
            }
        });

        test('usa taxa de degradação personalizada', () => {
            const standard = projectEnergyGeneration(10000, 10, 0.005);
            const high = projectEnergyGeneration(10000, 10, 0.01);

            expect(high[9].kWh).toBeLessThan(standard[9].kWh);
        });
    });
});
