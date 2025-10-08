export type HelioEntry = { key: string; text: string }

export interface HelioCopy {
  locale: 'pt-BR'
  banners: HelioEntry[]
  cards_resumo: HelioEntry[]
  secoes_tecnicas: {
    sandia: HelioEntry[]
    cec: HelioEntry[]
    modelchain: HelioEntry[]
  }
  tooltips: Record<string, string>
  erros_validacoes: HelioEntry[]
  estados_vazios: HelioEntry[]
  ctas: string[]
  passo_a_passo: { step: number; text: string }[]
  compatibilidade_eletrica: HelioEntry[]
  resultados_resumo: HelioEntry[]
  disclaimers: string[]
  proximos_passos: string[]
  integracoes_time_tecnico: string[]
  sucesso_conclusao: string[]
  tom_ajuda: string[]
}

export const helioPtBR: HelioCopy = {
  locale: 'pt-BR',
  banners: [
    { key: 'pvlib_integrada_ok', text: '✅ Integração pvlib concluída. Todos os testes passaram — podemos seguir para as simulações reais.' },
    { key: 'dados_normalizados_ok', text: 'Dados normalizados com sucesso: inversores e módulos prontos para dimensionar.' },
    { key: 'simulacao_sp_validada', text: 'Simulação de São Paulo validada. Quer rodar para seu endereço agora?' },
    { key: 'pronto_para_proposta', text: 'Tudo certo por aqui. Se quiser, eu gero a proposta e o dossiê técnico em poucos minutos.' },
  ],
  cards_resumo: [
    { key: 'inversores_tratados', text: 'Inversores tratados: {qtd_inversores} itens prontos. Contaminações removidas.' },
    { key: 'modulos_prontos', text: 'Módulos prontos: {qtd_modulos} modelos com parâmetros essenciais.' },
    { key: 'cobertura_modelos', text: 'Cobertura de modelos: Sandia {pct_sandia}% • CEC {pct_cec}%.' },
    { key: 'testes_aprovados', text: 'Testes aprovados: Sandia, CEC e ModelChain. Base confiável para projetar.' },
  ],
  secoes_tecnicas: {
    sandia: [
      { key: 'sandia_ok', text: 'Modelo Sandia validado. Eficiência e perdas dentro do esperado.' },
      { key: 'sandia_mppt_check', text: 'Faixa MPPT verificada. Vamos checar compatibilidade de strings no próximo passo.' },
    ],
    cec: [
      { key: 'cec_ok', text: 'Parâmetros CEC conferidos. Corrente, tensão e coeficientes prontos para a simulação.' },
      { key: 'cec_ajustes', text: 'Ajustes elétricos estimados. Recomendo confirmar com o datasheet do fabricante.' },
    ],
    modelchain: [
      { key: 'modelchain_config', text: 'Cadeia de modelos pvlib configurada. Vou calcular a geração com seu clima local.' },
      { key: 'modelchain_tmy_ok', text: 'Resultado do dia típico validado. Partimos para sua série anual agora.' },
    ],
  },
  tooltips: {
    modelchain: 'ModelChain: pipeline padronizado pvlib do clima até a potência do sistema.',
    pvwatts_v8: 'PVWatts v8: checagem rápida de energia com base no NSRDB 2020.',
    nasa_power: 'NASA POWER: irradiância e clima públicos por coordenada.',
    pr: 'PR (Performance Ratio): quão perto o sistema opera do ideal, já descontando perdas.',
    stc: 'STC: 1000 W/m², 25 °C e AM 1.5 — base de comparação entre módulos.',
    mppt: 'Compatibilidade MPPT: tensão da string precisa ficar dentro do range do inversor.',
  },
  erros_validacoes: [
    { key: 'cep_invalido', text: 'Não consegui validar o CEP. Revise o formato “00000-000” ou use o mapa para marcar o ponto. (Ajudo você a completar)' },
    { key: 'consumo_fora_intervalo', text: 'Consumo fora do intervalo esperado. Informe a média mensal em kWh (ex.: 450).' },
    { key: 'diferenca_modelos_alta', text: 'Diferença > 8% entre pvlib e PVWatts. Pode haver sombreamento ou parâmetro faltando. Vamos revisar telhado/obstruções?' },
    { key: 'tarifa_nao_encontrada', text: 'Não encontrei TE/TUSD para sua classe. Posso usar um valor padrão B1 provisório ou você indica a distribuidora? (Você pode alterar depois)' },
    { key: 'campo_obrigatorio', text: 'Campo obrigatório. Conte pra mim o consumo médio mensal para eu dimensionar seu sistema.' },
  ],
  estados_vazios: [
    { key: 'sem_simulacoes', text: 'Você ainda não rodou nenhuma simulação. Toque em “Simular agora” para ver seu potencial solar.' },
    { key: 'sem_modulos_preferidos', text: 'Sem módulos preferidos ainda. Escolha um painel ou deixe que eu recomende o melhor custo-benefício.' },
    { key: 'sem_tarifa', text: 'Sem tarifa definida. Buscar TE/TUSD pela sua localização.' },
  ],
  ctas: ['Simular agora', 'Validar tarifa', 'Checar MPPT', 'Gerar proposta', 'Baixar dossiê', 'Falar com especialista'],
  passo_a_passo: [
    { step: 1, text: '1/5 — Onde fica o imóvel? (CEP ou pin no mapa)' },
    { step: 2, text: '2/5 — Qual seu consumo médio (kWh/mês)? Se tiver, envie 3 contas.' },
    { step: 3, text: '3/5 — Como é o telhado? (tipo, inclinação, orientação)' },
    { step: 4, text: '4/5 — Prefere menor investimento, maior economia ou balanceado?' },
    { step: 5, text: '5/5 — Pronto! Vou calcular geração, economia e payback.' },
  ],
  compatibilidade_eletrica: [
    { key: 'tensao_ok', text: 'Tensão de string OK para o range MPPT do inversor.' },
    { key: 'tensao_fria_atencao', text: 'Atenção: tensão máxima da string pode exceder o limite em clima frio. Recomendo reduzir módulos por string.' },
    { key: 'corrente_ok', text: 'Corrente dentro do limite do MPPT. Seguimos.' },
  ],
  resultados_resumo: [
    { key: 'sistema_recomendado', text: 'Sistema recomendado: {kwp} kWp • {kwh_ano} kWh/ano • economia ~R$ {economia_mes}/mês • payback {payback_anos} anos. Gerar proposta?' },
    { key: 'simulacao_pronta', text: 'Simulação pronta. Quer comparar {cen1}/{cen2}/{cen3} ou já validar tarifa?' },
  ],
  disclaimers: [
    'Estimativas sujeitas a homologação da distribuidora e variações de clima/consumo.',
    'A verificação cruzada usa PVWatts v8 com TMY 2020 do NSRDB quando disponível.',
    'Dados climáticos públicos (NASA POWER/NSRDB) — sem uso de informações pessoais.',
  ],
  proximos_passos: [
    'Quer a proposta formal? Eu gero o PDF com memória de cálculo, ROI e checklist de homologação.',
    'Posso acionar um especialista YSH para revisar telhado e sombreamento por foto ou visita.',
    'Deseja simular com bateria para backup? Eu recomendo a capacidade com base nas suas cargas críticas.',
  ],
  integracoes_time_tecnico: [
    'Enviei ao agente de tarifas para buscar TE/TUSD e bandeira da sua distribuidora.',
    'Cataloguei SKUs compatíveis com {kwp} kWp e {fase}. Pronto para montar o kit.',
    'Simulação finalizada. Quer exportar JSON/CSV técnico ou seguir para proposta?',
  ],
  sucesso_conclusao: [
    '✅ Tudo pronto! Seu projeto tem base técnica sólida. Vamos transformar em proposta?',
    '✅ Arquivos gerados e salvos. Você pode baixar agora ou receber por e-mail.',
    '✅ Dimensão validada com pvlib e conferida no PVWatts. Segurança e transparência no mesmo lugar.',
  ],
  tom_ajuda: [
    'Estou vendo uma diferença maior que o ideal entre os modelos. Posso detalhar isso com você agora ou acionar um especialista YSH.',
    'Não tem problema se não souber a inclinação/azimute. Eu uso padrões para começar e ajustamos depois.',
  ],
}

export type HelioSectionKey = keyof Pick<
  HelioCopy,
  | 'banners'
  | 'cards_resumo'
  | 'erros_validacoes'
  | 'estados_vazios'
  | 'compatibilidade_eletrica'
  | 'resultados_resumo'
>

export function getHelioText(section: HelioSectionKey, key: string): string | undefined {
  const list = helioPtBR[section] as HelioEntry[]
  const item = list.find((e) => e.key === key)
  return item?.text
}

export function getHelioTooltip(key: keyof typeof helioPtBR.tooltips): string {
  return helioPtBR.tooltips[key]
}

