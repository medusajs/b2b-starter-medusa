# YSH Solar as a Service Journeys

## Personas e Classes Consumidoras

- Residencial Urbana (Classe B1) – famílias em centros urbanos com consumo médio 300-500 kWh/mês.
- Residencial Rural (Classe B2) – propriedades rurais com consumo sazonal e área disponível.
- Comercial Varejo (Classe B3) – lojas e franquias, demanda até 75 kW.
- Comercial Serviços (Classe B4) – escritórios, escolas privadas, hospitais de médio porte.
- Industrial Leve (Classe A4 azul/verde) – pequenas indústrias com carga trifásica.
- Industrial Pesada (Classe A3/A2) – plantas com demanda contratada alta e uso 24/7.
- Setor Público (Classe Poder Público) – prefeituras, escolas públicas, postos de saúde.
- Agronegócio (Classe Rural Produtor) – pivôs de irrigação, frigoríficos rurais.

## User Journeys

### 1. Descoberta (Top funnel)

1. Pesquisa benefícios energia solar (Google, redes sociais).
2. Acesso landing page YSH (conteúdo educacional por persona).
3. Consumo de calculadora rápida (insere UF, consumo, perfil).
4. Recebe estimativa CAPEX/OPEX, tempo de payback, economia.
5. CTA personalizado (falar com consultor, baixar relatório, simular financiamento).

### 2. Consideração (Middle funnel)

1. Usuário cria conta B2B (ou usa login corporativo).
2. Dashboard mostra consumo histórico e metas ESG.
3. Simulação detalhada (inserir curva de carga, tipo telhado, deslocamento).
4. Visualiza kits recomendados e comparação entre cenários.
5. Integra dados externos (ANEEL, mapa solarimétrico, tarifas distribuidoras).

### 3. Decisão (Bottom funnel)

1. Envia cotação formal (workflow quotes module).
2. Agenda inspeção técnica (integração logística).
3. Recebe proposta customizada (compliance + financing).
4. Ação final: assinatura digital contrato solar as a service.
5. Kickoff onboarding e acompanhamento instalação.

### 4. Pós-venda e Expansão

1. Portal de monitoramento (KPIs geração, redução CO₂).
2. Solicita serviço de manutenção preventiva (operations-maintenance).
3. Simula expansão ou retrofit (nova jornada com dados históricos).
4. Geração de relatórios para auditoria ESG e certificados.

## Buyer Journeys por Persona

### Residencial Urbana

- Trigger: conta de energia alta, incentivo fiscal local.
- Touchpoints: blog YSH, simulador rápido, WhatsApp.
- Key Actions: inserção consumo kWh, upload conta, escolha financiamento.
- Outputs: economia mensal, parcelamento, kit recomendado.

### Comercial Varejo

- Trigger: metas ESG, custo fixo alto.
- Touchpoints: webinar, calculadora B2B, consultor.
- Actions: comparar múltiplas lojas, selecionar modelo assinatura.
- Outputs: ROI consolidado, cronograma rollout, documentação fiscal.

### Industrial Leve

- Trigger: estabilidade tarifária, auto produção.
- Touchpoints: visita técnica, integração ERP, API consumo.
- Actions: enviar curva carga 15 min, definir demanda contratada.
- Outputs: dimensionamento trifásico, impacto demanda ponta/fora ponta.

### Poder Público

- Trigger: licitação sustentabilidade.
- Touchpoints: área governamental, formulário compliance.
- Actions: validar enquadramento legal, simular consórcio municipal.
- Outputs: laudos técnicos, indicadores ESG, plano fiscal.

### Agronegócio

- Trigger: irrigação sazonal, diesel caro.
- Touchpoints: consultor campo, app offline, integração agro.
- Actions: registrar pivôs, períodos produção, área disponível.
- Outputs: plano híbrido solar + storage, economia safra.

## Autosserviço Solar as a Service

- Portal único com login empresa/cliente.
- Fluxos self-service:
  - Solicitar estudo inicial (API ANEEL + calculadora YSH).
  - Acompanhar instalação (status, documentos, fotos).
  - Solicitar manutenção (SLA, agenda, checklists).
  - Gerar fatura serviço (assinatura, rateio multi filial).
  - Gestão contratos: renovação, upgrade de capacidade.

## Jobs To Be Done (JTBD)

| Persona | Job Principal | Contexto | Resultado Desejado |
|---------|---------------|----------|---------------------|
| Residencial | "Reduzir minha conta sem complicação" | Alta tarifa, espaço telhado | Economia 50+%, payback <5 anos |
| Comercial | "Cumprir metas ESG e reduzir custo" | Meeting board, orçamento anual | Plano CAPEX/OPEX com ROI comprovado |
| Industrial | "Garantir estabilidade energética" | Expansão produção, tarifa ponta | Sistema confiável, demanda firme |
| Público | "Projetos sustentáveis auditáveis" | Licitação, compliance TCU | Documentação completa e KPIs |
| Agronegócio | "Diminuir dependência diesel" | Safra seca, diesel caro | Solução híbrida com payback safra |

## User Inputs por Jornada

1. **Cadastro rápido**: email, CPF/CNPJ, UF, consumo médio.
2. **Simulação avançada**: curva carga, tarifas, tipo telhado, área disponível.
3. **Cotação formal**: dados fiscais, planta baixa, fotos telhado, histórico consumo.
4. **Financiamento**: rating financeiro, garantias, prazo desejado.
5. **Instalação**: autorizações, documentos concessionária, agendamento.
6. **Monitoramento**: leituras medidor, alertas manutenção.

## System Outputs Correspondentes

- Relatórios dimensionamento (kWp, número painéis, espaço necessário).
- Projeções financeiras: CAPEX, OPEX, economia mensal/anual, payback, TIR.
- Planos de financiamento (parcela, total financiado, taxa juros).
- Documentação compliance MMGD, parecer técnico, licenças.
- Dashboards tempo real (produção, emissão CO₂ evitada, alarmes).
- Notificações automáticas (manutenção, KPIs abaixo meta, economia acumulada).

## Perfis Energéticos Brasileiros

- **Baixa Tensão Residencial**: monofásico/bifásico até 10 kW.
- **Baixa Tensão Comercial**: trifásico 10-75 kW.
- **Média Tensão**: 13,8 kV (demanda contratada), classes A4/A3.
- **Alta Tensão**: A2/A1 com subestações próprias.
- **Rural Irrigante**: sazonal, demanda pico nas safras.
- **Serviços Essenciais**: hospitais, escolas, data centers com redundância.

## Experiência Omnicanal

- Web App Next.js (desktop/tablet) para simulações e dashboards.
- Aplicativo mobile (PWA) para inspeção técnica e manutenção.
- Integração CRM (cadastro leads, distribuição consultores).
- API pública para parceiros (dados consumo, status projetos).
- Automação marketing (journeys baseada em persona, trigger eventos).

---

Este mapa serve como guia para migrar fluxos do `storefront` para `client`, alinhando jornadas, dados solicitados e saídas esperadas para cada perfil energético atendido pela Yello Solar Hub.
