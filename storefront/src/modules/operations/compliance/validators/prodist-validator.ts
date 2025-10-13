// @ts-nocheck - Types need cleanup (frequencia properties)
/**
 * Validador de Conformidade PRODIST Módulo 3
 * 
 * Valida se os parâmetros técnicos do sistema fotovoltaico
 * estão em conformidade com os requisitos da ANEEL/PRODIST
 */

import limitesData from '../data/limites-prodist.json';
import type {
    ComplianceInput,
    ProdistValidation,
    TensaoValidation,
    FrequenciaValidation,
    THDValidation,
    FatorPotenciaValidation,
    ProtecoesValidation
} from '../types';

export class ProdistValidator {
    private limites = limitesData.prodist_modulo_3;

    /**
     * Validação completa de conformidade PRODIST
     */
    public validarCompleto(input: ComplianceInput): ProdistValidation {
        const validacoes = {
            tensao: this.validarTensao(input),
            frequencia: this.validarFrequencia(input),
            thd: this.validarTHD(input),
            fatorPotencia: this.validarFatorPotencia(input),
            protecoes: this.validarProtecoes(input),
            desequilibrio: this.validarDesequilibrio(input),
            aterramento: this.validarAterramento(input)
        };

        // Determinar conformidade geral
        const conforme = Object.values(validacoes).every(v => v.conforme);

        // Calcular score de conformidade (0-100)
        const scores = Object.values(validacoes).map(v => v.score || 100);
        const scoreGeral = scores.reduce((a, b) => a + b, 0) / scores.length;

        // Coletar todas as não conformidades
        const naoConformidades = Object.values(validacoes)
            .flatMap(v => v.naoConformidades || []);

        // Coletar todas as recomendações
        const recomendacoes = Object.values(validacoes)
            .flatMap(v => v.recomendacoes || []);

        return {
            conforme,
            scoreGeral: Math.round(scoreGeral),
            validacoes,
            naoConformidades,
            recomendacoes,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Validar níveis de tensão conforme PRODIST
     */
    private validarTensao(input: ComplianceInput): TensaoValidation {
        const { tensaoNominal, tensaoOperacao } = input.dadosEletricos;

        // Determinar categoria (BT, MT, AT)
        let categoria: 'baixa_tensao' | 'media_tensao' | 'alta_tensao';
        let limitesTensao: any;

        if (tensaoNominal <= 1000) {
            categoria = 'baixa_tensao';
            limitesTensao = this.limites.limites_tensao.baixa_tensao.tensao_nominal;
        } else if (tensaoNominal < 69000) {
            categoria = 'media_tensao';
            limitesTensao = this.limites.limites_tensao.media_tensao.tensao_nominal;
        } else {
            categoria = 'alta_tensao';
            limitesTensao = this.limites.limites_tensao.alta_tensao.tensao_nominal;
        }

        // Encontrar faixa de tensão correspondente
        const tensaoKey = this.encontrarFaixaTensao(tensaoNominal, limitesTensao);
        const faixa = limitesTensao[tensaoKey];

        if (!faixa) {
            return {
                conforme: false,
                categoria,
                tensaoNominal,
                tensaoOperacao,
                limites: null,
                faixaOperacao: 'critica',
                score: 0,
                naoConformidades: [
                    `Tensão nominal ${tensaoNominal}V não encontrada nas tabelas PRODIST`
                ],
                recomendacoes: [
                    'Verificar se a tensão nominal está correta',
                    'Consultar a distribuidora local para tensões não padronizadas'
                ]
            };
        }

        // Determinar faixa de operação
        let faixaOperacao: 'adequada' | 'precaria' | 'critica';

        if (tensaoOperacao >= faixa.adequada_min && tensaoOperacao <= faixa.adequada_max) {
            faixaOperacao = 'adequada';
        } else if (tensaoOperacao >= faixa.precaria_min && tensaoOperacao <= faixa.precaria_max) {
            faixaOperacao = 'precaria';
        } else {
            faixaOperacao = 'critica';
        }

        const conforme = faixaOperacao === 'adequada';
        const score = faixaOperacao === 'adequada' ? 100 :
            faixaOperacao === 'precaria' ? 60 : 0;

        const naoConformidades: string[] = [];
        const recomendacoes: string[] = [];

        if (!conforme) {
            if (faixaOperacao === 'precaria') {
                naoConformidades.push(
                    `Tensão de operação ${tensaoOperacao}V está em faixa precária (adequada: ${faixa.adequada_min}V - ${faixa.adequada_max}V)`
                );
                recomendacoes.push(
                    'Instalar regulador de tensão',
                    'Verificar dimensionamento de cabos',
                    'Considerar conexão em tensão superior'
                );
            } else {
                naoConformidades.push(
                    `Tensão de operação ${tensaoOperacao}V está em faixa crítica (mínimo: ${faixa.min}V, máximo: ${faixa.max}V)`
                );
                recomendacoes.push(
                    'URGENTE: Sistema não pode ser conectado nesta condição',
                    'Revisar completamente o projeto elétrico',
                    'Consultar engenheiro eletricista responsável'
                );
            }
        }

        return {
            conforme,
            categoria,
            tensaoNominal,
            tensaoOperacao,
            limites: faixa,
            faixaOperacao,
            score,
            naoConformidades,
            recomendacoes
        };
    }

    /**
     * Validar frequência conforme PRODIST
     */
    private validarFrequencia(input: ComplianceInput): FrequenciaValidation {
        const { frequenciaOperacao } = input.dadosEletricos;
        const limites = this.limites.limites_frequencia;

        let faixaOperacao: 'normal' | 'permitida' | 'critica';

        if (frequenciaOperacao >= limites.faixa_normal.min &&
            frequenciaOperacao <= limites.faixa_normal.max) {
            faixaOperacao = 'normal';
        } else if (frequenciaOperacao >= limites.faixa_permitida.min &&
            frequenciaOperacao <= limites.faixa_permitida.max) {
            faixaOperacao = 'permitida';
        } else {
            faixaOperacao = 'critica';
        }

        const conforme = faixaOperacao !== 'critica';
        const score = faixaOperacao === 'normal' ? 100 :
            faixaOperacao === 'permitida' ? 70 : 0;

        const naoConformidades: string[] = [];
        const recomendacoes: string[] = [];

        if (faixaOperacao === 'permitida') {
            naoConformidades.push(
                `Frequência ${frequenciaOperacao}Hz fora da faixa normal (${limites.faixa_normal.min}-${limites.faixa_normal.max}Hz)`
            );
            recomendacoes.push(
                'Monitorar frequência da rede continuamente',
                'Configurar proteções de sub/sobrefrequência'
            );
        } else if (faixaOperacao === 'critica') {
            naoConformidades.push(
                `Frequência ${frequenciaOperacao}Hz em nível crítico (permitido: ${limites.faixa_permitida.min}-${limites.faixa_permitida.max}Hz)`
            );
            recomendacoes.push(
                'CRÍTICO: Inversor deve desconectar automaticamente',
                'Verificar proteção ANSI 81 (sub/sobrefrequência)',
                'Consultar distribuidora sobre qualidade da rede'
            );
        }

        // Determinar tempo de desconexão necessário
        let tempoDesconexao = limites.tempo_desconexao.f_59_5_a_59;
        if (frequenciaOperacao < 57.5) {
            tempoDesconexao = limites.tempo_desconexao.f_menor_57_5;
        } else if (frequenciaOperacao >= 57.5 && frequenciaOperacao < 58) {
            tempoDesconexao = limites.tempo_desconexao.f_57_5_a_58;
        } else if (frequenciaOperacao >= 58 && frequenciaOperacao < 58.5) {
            tempoDesconexao = limites.tempo_desconexao.f_58_a_58_5;
        } else if (frequenciaOperacao >= 58.5 && frequenciaOperacao < 59) {
            tempoDesconexao = limites.tempo_desconexao.f_58_5_a_59;
        } else if (frequenciaOperacao > 60.5 && frequenciaOperacao <= 61) {
            tempoDesconexao = limites.tempo_desconexao.f_60_5_a_61;
        } else if (frequenciaOperacao > 61 && frequenciaOperacao <= 61.5) {
            tempoDesconexao = limites.tempo_desconexao.f_61_a_61_5;
        } else if (frequenciaOperacao > 61.5 && frequenciaOperacao <= 62) {
            tempoDesconexao = limites.tempo_desconexao.f_61_5_a_62;
        } else if (frequenciaOperacao > 62) {
            tempoDesconexao = limites.tempo_desconexao.f_maior_62;
        }

        return {
            conforme,
            frequenciaOperacao,
            limites,
            faixaOperacao,
            tempoDesconexao,
            score,
            naoConformidades,
            recomendacoes
        };
    }

    /**
     * Validar Distorção Harmônica Total (THD)
     */
    private validarTHD(input: ComplianceInput): THDValidation {
        const { tensaoNominal, thdTensao } = input.dadosEletricos;

        // Determinar limites baseado na tensão
        let categoria: 'baixa_tensao' | 'media_tensao' | 'alta_tensao';
        let limitesTHD: any;

        if (tensaoNominal <= 1000) {
            categoria = 'baixa_tensao';
            limitesTHD = this.limites.limites_thd.tensao.baixa_tensao;
        } else if (tensaoNominal < 69000) {
            categoria = 'media_tensao';
            limitesTHD = this.limites.limites_thd.tensao.media_tensao;
        } else {
            categoria = 'alta_tensao';
            limitesTHD = this.limites.limites_thd.tensao.alta_tensao;
        }

        const thdMax = limitesTHD.thd_max;
        const conforme = thdTensao <= thdMax;

        // Score baseado em quão próximo está do limite
        const percentualLimite = (thdTensao / thdMax) * 100;
        let score: number;
        if (percentualLimite <= 50) {
            score = 100;
        } else if (percentualLimite <= 80) {
            score = 80;
        } else if (percentualLimite <= 100) {
            score = 60;
        } else {
            score = 0;
        }

        const naoConformidades: string[] = [];
        const recomendacoes: string[] = [];

        if (!conforme) {
            naoConformidades.push(
                `THD de tensão ${thdTensao}% excede limite de ${thdMax}% para ${categoria}`
            );
            recomendacoes.push(
                'Instalar filtros harmônicos',
                'Verificar inversores certificados',
                'Considerar transformador de isolação',
                'Revisar cabeamento e aterramento'
            );
        } else if (score < 100) {
            recomendacoes.push(
                'THD próximo ao limite - monitorar continuamente',
                'Considerar medidas preventivas de filtragem'
            );
        }

        return {
            conforme,
            categoria,
            thdMedido: thdTensao,
            thdLimite: thdMax,
            percentualLimite: Math.round(percentualLimite),
            score,
            naoConformidades,
            recomendacoes,
            harmonicasIndividuais: limitesTHD.harmonicas_individuais
        };
    }

    /**
     * Validar Fator de Potência
     */
    private validarFatorPotencia(input: ComplianceInput): FatorPotenciaValidation {
        const { fatorPotencia } = input.dadosEletricos;
        const limites = this.limites.fator_potencia;
        const fpMinimo = limites.minimo_exigido;

        const conforme = fatorPotencia >= fpMinimo;

        // Score baseado no FP
        let score: number;
        if (fatorPotencia >= 0.95) {
            score = 100;
        } else if (fatorPotencia >= fpMinimo) {
            score = 80;
        } else if (fatorPotencia >= 0.90) {
            score = 50;
        } else {
            score = 0;
        }

        const naoConformidades: string[] = [];
        const recomendacoes: string[] = [];

        if (!conforme) {
            naoConformidades.push(
                `Fator de potência ${fatorPotencia.toFixed(2)} abaixo do mínimo ${fpMinimo}`
            );

            if (fatorPotencia >= 0.90) {
                recomendacoes.push(
                    'Instalar banco de capacitores para correção',
                    'Configurar inversores para controle de FP',
                    'Haverá cobrança de energia reativa excedente'
                );
            } else {
                recomendacoes.push(
                    'CRÍTICO: Fator de potência muito baixo',
                    'Cobrança elevada de energia reativa',
                    'Instalar banco de capacitores urgentemente',
                    'Revisar dimensionamento do sistema'
                );
            }
        } else if (fatorPotencia < 0.95) {
            recomendacoes.push(
                'Fator de potência pode ser melhorado',
                'Considerar ajuste fino do banco de capacitores'
            );
        }

        return {
            conforme,
            fatorPotenciaMedido: fatorPotencia,
            fatorPotenciaMinimo: fpMinimo,
            score,
            naoConformidades,
            recomendacoes,
            penalidades: !conforme ? limites.penalidades : undefined
        };
    }

    /**
     * Validar proteções exigidas
     */
    private validarProtecoes(input: ComplianceInput): ProtecoesValidation {
        const { potenciaInstalada, tensaoNominal } = input.dadosEletricos;

        // Determinar categoria e proteções necessárias
        let categoria: 'microgeracao_bt' | 'minigeracao_mt' | 'geracao_distribuida';
        let protecoesNecessarias: any[];

        if (potenciaInstalada <= 75 && tensaoNominal <= 1000) {
            categoria = 'microgeracao_bt';
            protecoesNecessarias = this.limites.protecoes_exigidas.microgeracao_bt;
        } else if (potenciaInstalada <= 5000 && tensaoNominal >= 1000) {
            categoria = 'minigeracao_mt';
            protecoesNecessarias = this.limites.protecoes_exigidas.minigeracao_mt;
        } else {
            categoria = 'geracao_distribuida';
            protecoesNecessarias = this.limites.protecoes_exigidas.geracao_distribuida;
        }

        const protecoesInstaladas = input.protecoes || [];

        // Verificar proteções faltantes
        const protecoesFaltantes = protecoesNecessarias.filter(necessaria =>
            !protecoesInstaladas.some(instalada =>
                instalada.codigo === necessaria.codigo
            )
        );

        // Verificar proteções incorretas
        const protecoesIncorretas = protecoesInstaladas.filter(instalada => {
            const necessaria = protecoesNecessarias.find(n => n.codigo === instalada.codigo);
            return necessaria && instalada.ajuste !== necessaria.ajuste;
        });

        const conforme = protecoesFaltantes.length === 0 && protecoesIncorretas.length === 0;

        const totalNecessarias = protecoesNecessarias.length;
        const totalInstaladas = protecoesInstaladas.filter(i =>
            protecoesNecessarias.some(n => n.codigo === i.codigo && i.ajuste === n.ajuste)
        ).length;

        const score = Math.round((totalInstaladas / totalNecessarias) * 100);

        const naoConformidades: string[] = [];
        const recomendacoes: string[] = [];

        if (protecoesFaltantes.length > 0) {
            naoConformidades.push(
                `Faltam ${protecoesFaltantes.length} proteções obrigatórias para ${categoria}`
            );
            protecoesFaltantes.forEach(p => {
                naoConformidades.push(`- ${p.codigo} (${p.nome}): ${p.ajuste}`);
            });
            recomendacoes.push(
                'Instalar todas as proteções obrigatórias',
                'Consultar norma técnica da distribuidora',
                'Contratar profissional habilitado para ajustes'
            );
        }

        if (protecoesIncorretas.length > 0) {
            naoConformidades.push(
                `${protecoesIncorretas.length} proteções com ajustes incorretos`
            );
            protecoesIncorretas.forEach(p => {
                const necessaria = protecoesNecessarias.find(n => n.codigo === p.codigo);
                naoConformidades.push(
                    `- ${p.codigo}: Atual "${p.ajuste}", Necessário "${necessaria?.ajuste}"`
                );
            });
            recomendacoes.push(
                'Reajustar proteções conforme PRODIST',
                'Realizar testes funcionais após ajuste'
            );
        }

        return {
            conforme,
            categoria,
            protecoesNecessarias,
            protecoesInstaladas,
            protecoesFaltantes,
            protecoesIncorretas,
            score,
            naoConformidades,
            recomendacoes
        };
    }

    /**
     * Validar desequilíbrio de tensão/corrente
     */
    private validarDesequilibrio(input: ComplianceInput): any {
        const { desequilibrioTensao = 0, desequilibrioCorrente = 0 } = input.dadosEletricos;
        const limites = this.limites.limites_desequilibrio;

        const desequilibrioTensaoOK = desequilibrioTensao <= limites.tensao.max;
        const desequilibrioCorrenteOK = desequilibrioCorrente <= limites.corrente.max;

        const conforme = desequilibrioTensaoOK && desequilibrioCorrenteOK;

        const score = conforme ? 100 :
            (desequilibrioTensaoOK || desequilibrioCorrenteOK) ? 50 : 0;

        const naoConformidades: string[] = [];
        const recomendacoes: string[] = [];

        if (!desequilibrioTensaoOK) {
            naoConformidades.push(
                `Desequilíbrio de tensão ${desequilibrioTensao}% excede limite de ${limites.tensao.max}%`
            );
            recomendacoes.push(
                'Verificar distribuição de carga entre fases',
                'Balancear módulos fotovoltaicos entre fases',
                'Consultar distribuidora sobre qualidade da rede'
            );
        }

        if (!desequilibrioCorrenteOK) {
            naoConformidades.push(
                `Desequilíbrio de corrente ${desequilibrioCorrente}% excede limite de ${limites.corrente.max}%`
            );
            recomendacoes.push(
                'Redistribuir inversores entre as fases',
                'Verificar conexões e cabeamento',
                'Considerar inversores trifásicos balanceados'
            );
        }

        return {
            conforme,
            desequilibrioTensao,
            desequilibrioCorrente,
            limites,
            score,
            naoConformidades,
            recomendacoes
        };
    }

    /**
     * Validar sistema de aterramento
     */
    private validarAterramento(input: ComplianceInput): any {
        const { aterramento } = input;
        const limites = this.limites.aterramento;

        if (!aterramento) {
            return {
                conforme: false,
                score: 0,
                naoConformidades: ['Dados de aterramento não fornecidos'],
                recomendacoes: [
                    'Realizar medição de resistência de aterramento',
                    'Documentar tipo de sistema de aterramento',
                    'Seguir NBR 5410:2004'
                ]
            };
        }

        const { sistema, resistencia, tensaoNominal } = aterramento;

        // Verificar sistema permitido
        const sistemaPermitido = sistema === 'TN-S' || sistema === 'TT';

        // Determinar resistência máxima permitida
        let resistenciaMax: number;
        if (tensaoNominal <= 1000) {
            resistenciaMax = limites.resistencia_maxima.bt;
        } else if (tensaoNominal < 69000) {
            resistenciaMax = limites.resistencia_maxima.mt;
        } else {
            resistenciaMax = limites.resistencia_maxima.at;
        }

        const resistenciaOK = resistencia <= resistenciaMax;
        const conforme = sistemaPermitido && resistenciaOK;

        const score = conforme ? 100 : sistemaPermitido ? 50 : 0;

        const naoConformidades: string[] = [];
        const recomendacoes: string[] = [];

        if (!sistemaPermitido) {
            naoConformidades.push(
                `Sistema de aterramento ${sistema} não recomendado para GD`
            );
            recomendacoes.push(
                'Adotar sistema TN-S (recomendado)',
                'Ou sistema TT com restrições',
                'Consultar NBR 5410:2004 seção 5.1'
            );
        }

        if (!resistenciaOK) {
            naoConformidades.push(
                `Resistência de aterramento ${resistencia}Ω excede máximo de ${resistenciaMax}Ω`
            );
            recomendacoes.push(
                'Melhorar sistema de aterramento',
                'Adicionar hastes/malha de aterramento',
                'Aplicar tratamento químico no solo',
                'Considerar aterramento profundo'
            );
        }

        return {
            conforme,
            sistema,
            resistencia,
            resistenciaMax,
            sistemaPermitido,
            resistenciaOK,
            limites,
            score,
            naoConformidades,
            recomendacoes
        };
    }

    /**
     * Encontrar faixa de tensão correspondente
     */
    private encontrarFaixaTensao(tensao: number, limites: any): string {
        const tensoes = Object.keys(limites);

        // Encontrar tensão nominal mais próxima
        let menorDiferenca = Infinity;
        let tensaoEncontrada = '';

        for (const tensaoStr of tensoes) {
            const tensaoNum = parseFloat(tensaoStr.replace(/[^0-9.]/g, ''));
            const diferenca = Math.abs(tensaoNum - tensao);

            if (diferenca < menorDiferenca) {
                menorDiferenca = diferenca;
                tensaoEncontrada = tensaoStr;
            }
        }

        return tensaoEncontrada;
    }
}

// Exportar instância singleton
export const prodistValidator = new ProdistValidator();

// Funções auxiliares exportadas
export const validarCompleto = (input: ComplianceInput) =>
    prodistValidator.validarCompleto(input);

export const validarTensao = (input: ComplianceInput) =>
    prodistValidator['validarTensao'](input);

export const validarFrequencia = (input: ComplianceInput) =>
    prodistValidator['validarFrequencia'](input);

export const validarTHD = (input: ComplianceInput) =>
    prodistValidator['validarTHD'](input);

export const validarFatorPotencia = (input: ComplianceInput) =>
    prodistValidator['validarFatorPotencia'](input);

export const validarProtecoes = (input: ComplianceInput) =>
    prodistValidator['validarProtecoes'](input);
