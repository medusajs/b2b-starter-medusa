'use client'

/**
 * Dossie Preview Component
 * 
 * Gera e exibe preview do dossiê técnico de conformidade
 * com opção de exportação em PDF
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Printer, FileText } from 'lucide-react'
import type { ComplianceInput, ProdistValidation } from '../types'

interface DossiePreviewProps {
    input: ComplianceInput
    validation: ProdistValidation
    onExport?: (format: 'pdf' | 'docx') => void
    onPrint?: () => void
}

export default function DossiePreview({
    input,
    validation,
    onExport,
    onPrint
}: DossiePreviewProps) {
    const handleExport = (format: 'pdf' | 'docx') => {
        onExport?.(format)
    }

    const handlePrint = () => {
        if (onPrint) {
            onPrint()
        } else {
            window.print()
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Dossiê Técnico de Conformidade</h2>
                    <p className="text-sm text-muted-foreground">
                        Sistema Fotovoltaico - Validação PRODIST Módulo 3
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('docx')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Word
                    </Button>
                    <Button onClick={() => handleExport('pdf')}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                </div>
            </div>

            {/* Dossie Content */}
            <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none" id="dossie-content">
                {/* Cover Page */}
                <div className="mb-8 pb-8 border-b">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold mb-2">
                            Dossiê Técnico de Conformidade
                        </h1>
                        <h2 className="text-xl text-muted-foreground mb-4">
                            Sistema de Micro/Minigeração Distribuída
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Conforme PRODIST Módulo 3 - Revisão 11/2023
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong>Data de Emissão:</strong>
                            <p>{new Date().toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })}</p>
                        </div>
                        <div>
                            <strong>Status de Conformidade:</strong>
                            <p className={validation.conforme ? 'text-green-600' : 'text-red-600'}>
                                {validation.conforme ? 'CONFORME' : 'NÃO CONFORME'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 1. Dados do Sistema */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4 border-b pb-2">
                        1. Dados do Sistema Fotovoltaico
                    </h3>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-semibold mb-3">1.1 Informações Gerais</h4>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-muted-foreground">Potência Instalada:</dt>
                                    <dd className="font-medium">{input.potencia_instalada_kwp} kWp</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Tensão de Conexão:</dt>
                                    <dd className="font-medium">{input.tensao_conexao_kv} kV</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Tipo de Conexão:</dt>
                                    <dd className="font-medium capitalize">{input.tipo_conexao}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Modalidade:</dt>
                                    <dd className="font-medium">{input.modalidade_mmgd?.replace(/_/g, ' ')}</dd>
                                </div>
                            </dl>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">1.2 Distribuidora</h4>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-muted-foreground">Distribuidora:</dt>
                                    <dd className="font-medium">{input.distribuidora}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">UF:</dt>
                                    <dd className="font-medium">{input.uf}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Classe Tarifária:</dt>
                                    <dd className="font-medium">{input.classe_tarifaria}</dd>
                                </div>
                                {input.consumo_anual_kwh && (
                                    <div>
                                        <dt className="text-muted-foreground">Consumo Anual:</dt>
                                        <dd className="font-medium">{input.consumo_anual_kwh.toLocaleString('pt-BR')} kWh</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </section>

                {/* 2. Parâmetros Elétricos */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4 border-b pb-2">
                        2. Parâmetros Elétricos
                    </h3>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-semibold mb-3">2.1 Tensão e Frequência</h4>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-muted-foreground">Tensão Nominal:</dt>
                                    <dd className="font-medium">{input.dadosEletricos?.tensaoNominal} V</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Tensão de Operação:</dt>
                                    <dd className="font-medium">{input.dadosEletricos?.tensaoOperacao} V</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Frequência:</dt>
                                    <dd className="font-medium">{input.dadosEletricos?.frequenciaOperacao} Hz</dd>
                                </div>
                            </dl>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">2.2 Qualidade da Energia</h4>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-muted-foreground">THD Tensão:</dt>
                                    <dd className="font-medium">{input.dadosEletricos?.thdTensao}%</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Fator de Potência:</dt>
                                    <dd className="font-medium">{input.dadosEletricos?.fatorPotencia}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Desequilíbrio Tensão:</dt>
                                    <dd className="font-medium">{input.dadosEletricos?.desequilibrioTensao}%</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Desequilíbrio Corrente:</dt>
                                    <dd className="font-medium">{input.dadosEletricos?.desequilibrioCorrente}%</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section>

                {/* 3. Proteções */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4 border-b pb-2">
                        3. Dispositivos de Proteção
                    </h3>

                    <div className="text-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Código ANSI</th>
                                    <th className="text-left py-2">Nome</th>
                                    <th className="text-left py-2">Status</th>
                                    <th className="text-left py-2">Ajuste</th>
                                </tr>
                            </thead>
                            <tbody>
                                {input.protecoes?.map((prot, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="py-2">{prot.codigo}</td>
                                        <td className="py-2">{prot.nome}</td>
                                        <td className="py-2">
                                            <span className={prot.instalada ? 'text-green-600' : 'text-red-600'}>
                                                {prot.instalada ? 'Instalada' : 'Não Instalada'}
                                            </span>
                                        </td>
                                        <td className="py-2">{prot.ajuste || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 4. Aterramento */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4 border-b pb-2">
                        4. Sistema de Aterramento
                    </h3>

                    <div className="text-sm space-y-2">
                        <div>
                            <strong>Sistema:</strong> {input.aterramento?.sistema}
                        </div>
                        <div>
                            <strong>Resistência de Aterramento:</strong> {input.aterramento?.resistencia} Ω
                        </div>
                        <div>
                            <strong>Tensão Nominal:</strong> {input.aterramento?.tensaoNominal} V
                        </div>
                    </div>
                </section>

                {/* 5. Resultados da Validação */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4 border-b pb-2">
                        5. Resultados da Validação
                    </h3>

                    <div className="mb-6">
                        <div className={`p-4 rounded-md ${validation.conforme ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="font-bold text-lg mb-2">
                                Score Geral: {validation.scoreGeral}/100
                            </div>
                            <div className={validation.conforme ? 'text-green-700' : 'text-red-700'}>
                                Status: {validation.conforme ? 'CONFORME' : 'NÃO CONFORME'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                        {Object.entries(validation.validacoes).map(([key, val]: [string, any]) => (
                            <div key={key} className="p-3 border rounded">
                                <div className="font-semibold capitalize mb-1">{key}</div>
                                <div className="text-muted-foreground">
                                    Score: {val.score}/100 - {val.conforme ? 'Conforme' : 'Não Conforme'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {validation.naoConformidades.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-semibold mb-2 text-red-900">5.1 Não Conformidades</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                {validation.naoConformidades.map((nc, i) => (
                                    <li key={i}>{nc}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {validation.recomendacoes.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 text-yellow-900">5.2 Recomendações</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                                {validation.recomendacoes.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* 6. Conclusão */}
                <section className="mb-8">
                    <h3 className="text-xl font-bold mb-4 border-b pb-2">
                        6. Conclusão
                    </h3>

                    <p className="text-sm leading-relaxed">
                        {validation.conforme ? (
                            <>
                                O sistema fotovoltaico analisado encontra-se em conformidade com os requisitos
                                estabelecidos no PRODIST Módulo 3, Revisão 11/2023, da ANEEL. Todos os parâmetros
                                técnicos avaliados atendem aos limites e critérios definidos pela norma, sendo
                                o sistema considerado apto para conexão à rede de distribuição.
                            </>
                        ) : (
                            <>
                                O sistema fotovoltaico analisado apresenta não conformidades em relação aos
                                requisitos estabelecidos no PRODIST Módulo 3, Revisão 11/2023, da ANEEL.
                                As não conformidades identificadas devem ser corrigidas antes da solicitação
                                de parecer de acesso junto à distribuidora de energia.
                            </>
                        )}
                    </p>
                </section>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t text-sm text-center text-muted-foreground">
                    <p>Documento gerado automaticamente pela plataforma YSH Solar</p>
                    <p>Este documento não substitui o parecer técnico da distribuidora</p>
                </div>
            </div>
        </div>
    )
}
