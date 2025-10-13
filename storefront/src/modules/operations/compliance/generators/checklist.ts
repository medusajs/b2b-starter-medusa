/**
 * Gerador de Checklist ANEEL
 * Cria checklist personalizado conforme classe, potência e modalidade
 */

import { ChecklistANEEL, ChecklistItem, ComplianceInput, ClasseTarifaria, ModalidadeMMGD } from '../types'
import { detectarCategoriaGeracao } from '../validators/prodist'

/**
 * Gera checklist completo para homologação
 */
export function gerarChecklistANEEL(input: ComplianceInput): ChecklistANEEL {
    const categoria = detectarCategoriaGeracao(input.potencia_instalada_kwp)
    const itens: ChecklistItem[] = []

    // 1. DOCUMENTAÇÃO
    itens.push(...getDocumentacaoBasica(input.classe_tarifaria))
    itens.push(...getDocumentacaoEspecifica(categoria, input.modalidade_mmgd))

    // 2. DOCUMENTAÇÃO TÉCNICA
    itens.push(...getDocumentacaoTecnica(categoria))

    // 3. PROJETO ELÉTRICO
    itens.push(...getProjetoEletrico(categoria))

    // 4. SEGURANÇA
    itens.push(...getDocumentacaoSeguranca(categoria, input.classe_tarifaria))

    // 5. AMBIENTAL (se aplicável)
    if (categoria === 'minigeracao') {
        itens.push(...getDocumentacaoAmbiental(input.potencia_instalada_kwp))
    }

    // Calcular progresso
    const total = itens.length
    const concluidos = itens.filter(i => i.concluido).length
    const obrigatorios_pendentes = itens.filter(i => i.obrigatorio && !i.concluido).length
    const percent_completo = Math.round((concluidos / total) * 100)

    return {
        distribuidora: input.distribuidora,
        classe: input.classe_tarifaria,
        potencia_kwp: input.potencia_instalada_kwp,
        modalidade: input.modalidade_mmgd,
        itens,
        progresso: {
            total,
            concluidos,
            obrigatorios_pendentes,
            percent_completo
        }
    }
}

/**
 * Documentação Básica (todas as classes)
 */
function getDocumentacaoBasica(classe: ClasseTarifaria): ChecklistItem[] {
    const isPessoaFisica = classe === 'B1' || classe === 'B2'

    return [
        {
            id: 'doc_001',
            categoria: 'documentacao',
            titulo: isPessoaFisica ? 'CPF do Titular' : 'CNPJ da Empresa',
            descricao: 'Documento de identificação fiscal',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'doc_002',
            categoria: 'documentacao',
            titulo: isPessoaFisica ? 'RG ou CNH' : 'Contrato Social',
            descricao: isPessoaFisica
                ? 'Documento de identificação com foto'
                : 'Contrato social atualizado e registrado',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'doc_003',
            categoria: 'documentacao',
            titulo: 'Comprovante de Residência/Endereço',
            descricao: 'Conta de luz, água, telefone ou IPTU (máximo 90 dias)',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'doc_004',
            categoria: 'documentacao',
            titulo: 'Conta de Energia (últimos 12 meses)',
            descricao: 'Histórico de consumo para análise de dimensionamento',
            obrigatorio: false,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'doc_005',
            categoria: 'documentacao',
            titulo: 'Certidão Negativa de Débitos com a Distribuidora',
            descricao: 'Comprovante de que não há débitos pendentes',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        }
    ]
}

/**
 * Documentação Específica por Modalidade
 */
function getDocumentacaoEspecifica(
    categoria: 'microgeracao' | 'minigeracao',
    modalidade: ModalidadeMMGD
): ChecklistItem[] {
    const itens: ChecklistItem[] = []

    if (modalidade === 'geracao_compartilhada') {
        itens.push({
            id: 'doc_spec_001',
            categoria: 'documentacao',
            titulo: 'Lista de Participantes da Geração Compartilhada',
            descricao: 'Planilha com CPF/CNPJ, UC e percentual de rateio de cada participante',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        })

        itens.push({
            id: 'doc_spec_002',
            categoria: 'documentacao',
            titulo: 'Acordo de Compensação entre Participantes',
            descricao: 'Documento assinado por todos os participantes definindo rateio',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        })
    }

    if (modalidade.includes('autoconsumo_remoto')) {
        itens.push({
            id: 'doc_spec_003',
            categoria: 'documentacao',
            titulo: 'Comprovação de Titularidade das UCs',
            descricao: 'Provar que geração e consumo pertencem ao mesmo titular',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        })
    }

    if (modalidade.includes('multiplas_unidades')) {
        itens.push({
            id: 'doc_spec_004',
            categoria: 'documentacao',
            titulo: 'Ata de Assembleia do Condomínio',
            descricao: 'Aprovação da instalação do sistema por maioria simples',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        })
    }

    return itens
}

/**
 * Documentação Técnica
 */
function getDocumentacaoTecnica(categoria: 'microgeracao' | 'minigeracao'): ChecklistItem[] {
    return [
        {
            id: 'tec_001',
            categoria: 'tecnico',
            titulo: 'Certificado Inmetro dos Painéis Fotovoltaicos',
            descricao: 'Certificação Inmetro Classe A (obrigatório)',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'tec_002',
            categoria: 'tecnico',
            titulo: 'Certificado Inmetro dos Inversores',
            descricao: 'Certificação Inmetro para inversores conectados à rede',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'tec_003',
            categoria: 'tecnico',
            titulo: 'Datasheet dos Equipamentos',
            descricao: 'Especificações técnicas completas de painéis e inversores',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'tec_004',
            categoria: 'tecnico',
            titulo: 'Garantia dos Equipamentos',
            descricao: 'Certificados de garantia de fábrica (painéis e inversores)',
            obrigatorio: false,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'tec_005',
            categoria: 'tecnico',
            titulo: categoria === 'minigeracao' ? 'Laudo Estrutural do Telhado' : 'Análise de Capacidade Estrutural',
            descricao: categoria === 'minigeracao'
                ? 'Laudo de engenheiro civil atestando capacidade de suporte (obrigatório para mini)'
                : 'Verificação de capacidade de carga do telhado (recomendado)',
            obrigatorio: categoria === 'minigeracao',
            aplicavel: true,
            concluido: false
        }
    ]
}

/**
 * Projeto Elétrico
 */
function getProjetoEletrico(categoria: 'microgeracao' | 'minigeracao'): ChecklistItem[] {
    return [
        {
            id: 'elet_001',
            categoria: 'eletrico',
            titulo: 'ART/RRT do Responsável Técnico',
            descricao: 'Anotação de Responsabilidade Técnica do projeto elétrico (CREA/CAU)',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'elet_002',
            categoria: 'eletrico',
            titulo: 'Diagrama Unifilar do Sistema',
            descricao: 'Diagrama elétrico completo com todas as proteções e conexões',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'elet_003',
            categoria: 'eletrico',
            titulo: 'Layout dos Painéis no Telhado',
            descricao: 'Planta baixa mostrando disposição dos painéis e orientação',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'elet_004',
            categoria: 'eletrico',
            titulo: 'Memorial Descritivo do Sistema',
            descricao: 'Documento técnico descrevendo o sistema, cálculos e premissas',
            obrigatorio: categoria === 'minigeracao',
            aplicavel: true,
            concluido: false
        },
        {
            id: 'elet_005',
            categoria: 'eletrico',
            titulo: 'Memorial de Cálculo',
            descricao: 'Cálculos de dimensionamento, correntes, tensões e proteções',
            obrigatorio: categoria === 'minigeracao',
            aplicavel: true,
            concluido: false
        },
        {
            id: 'elet_006',
            categoria: 'eletrico',
            titulo: 'Lista de Materiais (BOM)',
            descricao: 'Relação completa de todos os componentes do sistema',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        }
    ]
}

/**
 * Documentação de Segurança
 */
function getDocumentacaoSeguranca(
    categoria: 'microgeracao' | 'minigeracao',
    classe: ClasseTarifaria
): ChecklistItem[] {
    const isComercialIndustrial = classe === 'B3' || classe.startsWith('A')

    return [
        {
            id: 'seg_001',
            categoria: 'seguranca',
            titulo: 'Projeto de SPDA (Proteção contra Descargas Atmosféricas)',
            descricao: 'Sistema de para-raios conforme NBR 5419',
            obrigatorio: categoria === 'minigeracao',
            aplicavel: true,
            concluido: false
        },
        {
            id: 'seg_002',
            categoria: 'seguranca',
            titulo: 'Sistema de Aterramento',
            descricao: 'Projeto de aterramento elétrico conforme NBR 5410',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'seg_003',
            categoria: 'seguranca',
            titulo: 'Dispositivos de Proteção (DPS)',
            descricao: 'Especificação de DPS CC e CA conforme NBR 5410',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        },
        {
            id: 'seg_004',
            categoria: 'seguranca',
            titulo: 'AVCB (Auto de Vistoria do Corpo de Bombeiros)',
            descricao: 'Vistoria de segurança contra incêndio',
            obrigatorio: isComercialIndustrial,
            aplicavel: isComercialIndustrial,
            concluido: false
        },
        {
            id: 'seg_005',
            categoria: 'seguranca',
            titulo: 'Proteção de Interface (relé de sub/sobre tensão e frequência)',
            descricao: 'Proteção anti-ilhamento conforme ABNT NBR 16149',
            obrigatorio: true,
            aplicavel: true,
            concluido: false
        }
    ]
}

/**
 * Documentação Ambiental (Minigeração)
 */
function getDocumentacaoAmbiental(potencia_kwp: number): ChecklistItem[] {
    const requerLicenca = potencia_kwp > 1000 // > 1 MWp geralmente requer

    return [
        {
            id: 'amb_001',
            categoria: 'ambiental',
            titulo: 'Licença Ambiental',
            descricao: 'Licença de instalação/operação conforme legislação estadual',
            obrigatorio: requerLicenca,
            aplicavel: requerLicenca,
            concluido: false
        },
        {
            id: 'amb_002',
            categoria: 'ambiental',
            titulo: 'Estudo de Impacto Ambiental (EIA/RIMA)',
            descricao: 'Obrigatório para sistemas acima de 10 MWp',
            obrigatorio: potencia_kwp > 10000,
            aplicavel: potencia_kwp > 10000,
            concluido: false
        },
        {
            id: 'amb_003',
            categoria: 'ambiental',
            titulo: 'Autorização de Uso de Área',
            descricao: 'Para sistemas em solo (não telhado)',
            obrigatorio: false,
            aplicavel: true,
            concluido: false
        }
    ]
}

/**
 * Marcar item como concluído
 */
export function marcarItemConcluido(
    checklist: ChecklistANEEL,
    itemId: string,
    observacoes?: string,
    arquivo_anexo?: string
): ChecklistANEEL {
    const itemIndex = checklist.itens.findIndex(i => i.id === itemId)

    if (itemIndex === -1) {
        throw new Error(`Item ${itemId} não encontrado no checklist`)
    }

    checklist.itens[itemIndex].concluido = true
    if (observacoes) checklist.itens[itemIndex].observacoes = observacoes
    if (arquivo_anexo) checklist.itens[itemIndex].arquivo_anexo = arquivo_anexo

    // Recalcular progresso
    const total = checklist.itens.length
    const concluidos = checklist.itens.filter(i => i.concluido).length
    const obrigatorios_pendentes = checklist.itens.filter(i => i.obrigatorio && !i.concluido).length

    checklist.progresso = {
        total,
        concluidos,
        obrigatorios_pendentes,
        percent_completo: Math.round((concluidos / total) * 100)
    }

    return checklist
}
