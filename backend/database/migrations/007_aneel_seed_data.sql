-- =============================================
-- MIGRATION 007: ANEEL TARIFF SEED DATA
-- =============================================
-- Data: 2025-01-10
-- Objetivo: Popular dados iniciais de concessionárias e tarifas

-- =============================================
-- 1. CONCESSIONARIAS
-- =============================================

INSERT INTO concessionarias
    (nome, sigla, uf, website, is_active, is_verified, codigo_aneel)
VALUES
    ('CPFL Paulista', 'CPFL', ARRAY
['SP'], 'https://www.cpfl.com.br', true, true, '0002'),
('Enel Distribuição São Paulo', 'ENEL-SP', ARRAY['SP'], 'https://www.enel.com.br/sp', true, true, '0001'),
('Light', 'LIGHT', ARRAY['RJ'], 'https://www.light.com.br', true, true, '0003'),
('Enel Distribuição Rio', 'ENEL-RJ', ARRAY['RJ'], 'https://www.enel.com.br/rj', true, true, '0004'),
('CEMIG Distribuição', 'CEMIG', ARRAY['MG'], 'https://www.cemig.com.br', true, true, '0005'),
('Copel Distribuição', 'COPEL', ARRAY['PR'], 'https://www.copel.com', true, true, '0006'),
('Celesc Distribuição', 'CELESC', ARRAY['SC'], 'https://www.celesc.com.br', true, true, '0007'),
('RGE Sul', 'RGE', ARRAY['RS'], 'https://www.rgesul.com.br', true, true, '0008'),
('Coelba', 'COELBA', ARRAY['BA'], 'https://www.neoenergia.com/ba', true, true, '0009'),
('Celpe', 'CELPE', ARRAY['PE'], 'https://www.neoenergia.com/pe', true, true, '0010'),
('Celg Distribuição', 'CELG-D', ARRAY['GO', 'DF'], 'https://www.celgd.com.br', true, true, '0011'),
('Enel Distribuição Ceará', 'ENEL-CE', ARRAY['CE'], 'https://www.enel.com.br/ce', true, true, '0012'),
('Energisa Mato Grosso do Sul', 'EMS', ARRAY['MS'], 'https://www.energisa.com.br/ms', true, true, '0013'),
('Energisa Mato Grosso', 'EMT', ARRAY['MT'], 'https://www.energisa.com.br/mt', true, true, '0014'),
('Eletropaulo (Enel)', 'ELETROPAULO', ARRAY['SP'], 'https://www.enel.com.br/sp', true, true, '0015'),
('Elektro', 'ELEKTRO', ARRAY['SP', 'MS'], 'https://www.elektro.com.br', true, true, '0016'),
('Energisa Sergipe', 'ESE', ARRAY['SE'], 'https://www.energisa.com.br/se', true, true, '0017'),
('Energisa Paraíba', 'EPB', ARRAY['PB'], 'https://www.energisa.com.br/pb', true, true, '0018'),
('Ceron (Energisa Rondônia)', 'CERON', ARRAY['RO'], 'https://www.energisa.com.br/ro', true, true, '0019'),
('Celpa', 'CELPA', ARRAY['PA'], 'https://www.celpa.com.br', true, true, '0020'),
('Amazonas Energia', 'AME', ARRAY['AM'], 'https://www.amazonasenergia.com.br', true, true, '0021'),
('Boa Vista Energia', 'BOA_VISTA', ARRAY['RR'], 'https://www.boavistaenergia.com.br', true, true, '0022'),
('Equatorial Piauí', 'CEPISA', ARRAY['PI'], 'https://www.equatorialenergia.com.br/pi', true, true, '0023'),
('Equatorial Maranhão', 'CEMAR', ARRAY['MA'], 'https://www.equatorialenergia.com.br/ma', true, true, '0024'),
('Equatorial Alagoas', 'CEAL', ARRAY['AL'], 'https://www.equatorialenergia.com.br/al', true, true, '0025');

-- =============================================
-- 2. TARIFAS B1 (Residencial) - 2024/2025
-- =============================================
-- Baseado em service.ts

INSERT INTO tarifas
    (
    concessionaria_id,
    uf,
    grupo,
    classe,
    tarifa_kwh,
    tarifa_tusd,
    tarifa_te,
    bandeira_verde,
    bandeira_amarela,
    bandeira_vermelha_1,
    bandeira_vermelha_2,
    vigencia_inicio,
    is_active,
    is_current,
    fonte,
    resolucao_aneel
    )
VALUES
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'CPFL'),
        'SP',
        'B1',
        'residencial',
        0.72,
        0.42,
        0.30,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3234/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'ENEL-SP'),
        'SP',
        'B1',
        'residencial',
        0.68,
        0.39,
        0.29,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3235/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'LIGHT'),
        'RJ',
        'B1',
        'residencial',
        0.89,
        0.51,
        0.38,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3236/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'ENEL-RJ'),
        'RJ',
        'B1',
        'residencial',
        0.85,
        0.49,
        0.36,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3237/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'CEMIG'),
        'MG',
        'B1',
        'residencial',
        0.78,
        0.45,
        0.33,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3238/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'COPEL'),
        'PR',
        'B1',
        'residencial',
        0.62,
        0.36,
        0.26,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3239/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'CELESC'),
        'SC',
        'B1',
        'residencial',
        0.65,
        0.38,
        0.27,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3240/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'RGE'),
        'RS',
        'B1',
        'residencial',
        0.70,
        0.41,
        0.29,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3241/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'COELBA'),
        'BA',
        'B1',
        'residencial',
        0.76,
        0.44,
        0.32,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3242/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'CELPE'),
        'PE',
        'B1',
        'residencial',
        0.74,
        0.43,
        0.31,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3243/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'CELG-D'),
        'GO',
        'B1',
        'residencial',
        0.69,
        0.40,
        0.29,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3244/2024'
),
    (
        (SELECT id
        FROM concessionarias
        WHERE sigla = 'ENEL-CE'),
        'CE',
        'B1',
        'residencial',
        0.73,
        0.42,
        0.31,
        0,
        0.02,
        0.04,
        0.06,
        '2024-07-01',
        true,
        true,
        'ANEEL',
        'REH 3245/2024'
);

-- =============================================
-- 3. BANDEIRAS TARIFARIAS HISTORICO
-- =============================================

INSERT INTO bandeiras_historico
    (mes, ano, bandeira, valor_adicional, valor_100kwh, regiao, subsistema)
VALUES
    (1, 2024, 'verde', 0, 0, 'nacional', 'S/SE/CO/NE/N'),
    (2, 2024, 'verde', 0, 0, 'nacional', 'S/SE/CO/NE/N'),
    (3, 2024, 'amarela', 0.02, 2.00, 'nacional', 'S/SE/CO/NE/N'),
    (4, 2024, 'amarela', 0.02, 2.00, 'nacional', 'S/SE/CO/NE/N'),
    (5, 2024, 'vermelha_1', 0.04, 4.00, 'nacional', 'S/SE/CO/NE/N'),
    (6, 2024, 'vermelha_1', 0.04, 4.00, 'nacional', 'S/SE/CO/NE/N'),
    (7, 2024, 'verde', 0, 0, 'nacional', 'S/SE/CO/NE/N'),
    (8, 2024, 'verde', 0, 0, 'nacional', 'S/SE/CO/NE/N'),
    (9, 2024, 'amarela', 0.02, 2.00, 'nacional', 'S/SE/CO/NE/N'),
    (10, 2024, 'vermelha_1', 0.04, 4.00, 'nacional', 'S/SE/CO/NE/N'),
    (11, 2024, 'vermelha_2', 0.06, 6.00, 'nacional', 'S/SE/CO/NE/N'),
    (12, 2024, 'vermelha_1', 0.04, 4.00, 'nacional', 'S/SE/CO/NE/N'),
    (1, 2025, 'verde', 0, 0, 'nacional', 'S/SE/CO/NE/N'),
    (2, 2025, 'verde', 0, 0, 'nacional', 'S/SE/CO/NE/N');

-- =============================================
-- 4. MMGD CLASSES (Lei 14.300/2022)
-- =============================================

INSERT INTO mmgd_classes
    (
    codigo,
    nome,
    descricao,
    tipo_mmgd,
    modalidade,
    potencia_min_kwp,
    potencia_max_kwp,
    credito_validade_meses,
    transferencia_permitida,
    autoconsumo_remoto,
    oversizing_min_pct,
    oversizing_max_pct,
    oversizing_recomendado_pct,
    fio_b_aplicavel,
    desconto_tusd_pct,
    is_active
    )
VALUES
    (
        'MMGD_MICRO_LOCAL',
        'Microgeração - Consumo no Local',
        'Sistema de até 75kWp instalado no mesmo local de consumo',
        'microgeracao',
        'consumo_proprio',
        0.01,
        75.00,
        60,
        false,
        false,
        114.00,
        160.00,
        130.00,
        true,
        NULL,
        true
),
    (
        'MMGD_MINI_LOCAL',
        'Minigeração - Consumo no Local',
        'Sistema de 75kWp a 5MWp instalado no mesmo local de consumo',
        'minigeracao',
        'consumo_proprio',
        75.01,
        5000.00,
        60,
        false,
        false,
        114.00,
        160.00,
        130.00,
        true,
        NULL,
        true
),
    (
        'MMGD_MICRO_REMOTO',
        'Microgeração - Autoconsumo Remoto',
        'Sistema de até 75kWp com consumo em outro local (mesma CPF/CNPJ)',
        'microgeracao',
        'consumo_proprio',
        0.01,
        75.00,
        60,
        true,
        true,
        114.00,
        160.00,
        130.00,
        true,
        NULL,
        true
),
    (
        'MMGD_GERACAO_COMPARTILHADA',
        'Geração Compartilhada',
        'Sistema com créditos compartilhados entre múltiplos consumidores',
        'minigeracao',
        'geracao_compartilhada',
        75.01,
        5000.00,
        60,
        true,
        true,
        114.00,
        145.00,
        130.00,
        true,
        NULL,
        true
),
    (
        'MMGD_COOPERATIVA',
        'Cooperativa de Geração',
        'Sistema gerido por cooperativa de consumidores',
        'minigeracao',
        'cooperativa',
        75.01,
        5000.00,
        60,
        true,
        true,
        114.00,
        145.00,
        130.00,
        true,
        NULL,
        true
),
    (
        'MMGD_CONSORCIO',
        'Consórcio de Geração',
        'Sistema gerido por consórcio empresarial',
        'minigeracao',
        'consorcio',
        75.01,
        5000.00,
        60,
        true,
        true,
        114.00,
        145.00,
        130.00,
        true,
        NULL,
        true
),
    (
        'MMGD_BAIXA_RENDA',
        'Baixa Renda (Tarifa Social)',
        'Microgeração para consumidores de baixa renda com benefícios especiais',
        'microgeracao',
        'consumo_proprio',
        0.01,
        75.00,
        60,
        false,
        false,
        100.00,
        130.00,
        114.00,
        true,
        100.00,
        true
);

-- =============================================
-- FIM DA MIGRATION 007
-- =============================================
