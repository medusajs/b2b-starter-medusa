'use client'

/**
 * Validation Results Component
 * 
 * Exibe resultados detalhados da validação PRODIST
 * com score, não conformidades e recomendações
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@medusajs/ui'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, AlertCircle, AlertTriangle, Download, FileText } from 'lucide-react'
import type { ProdistValidation } from '../types'

interface ValidationResultsProps {
    validation: ProdistValidation
    onExportDossie?: () => void
    onNewValidation?: () => void
}

export default function ValidationResults({
    validation,
    onExportDossie,
    onNewValidation
}: ValidationResultsProps) {
    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600'
        if (score >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBgColor = (score: number) => {
        if (score >= 90) return 'bg-green-50'
        if (score >= 70) return 'bg-yellow-50'
        return 'bg-red-50'
    }

    const getSeverityIcon = (score: number) => {
        if (score >= 90) return <CheckCircle2 className="h-5 w-5 text-green-600" />
        if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />
        return <AlertCircle className="h-5 w-5 text-red-600" />
    }

    return (
        <div className="space-y-6">
            {/* Header with Overall Score */}
            <Card>
                <CardHeader className={getScoreBgColor(validation.scoreGeral)}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getSeverityIcon(validation.scoreGeral)}
                            <div>
                                <CardTitle className={getScoreColor(validation.scoreGeral)}>
                                    {validation.conforme ? 'Sistema Conforme' : 'Não Conformidades Detectadas'}
                                </CardTitle>
                                <CardDescription>
                                    Score Geral: {validation.scoreGeral}/100
                                </CardDescription>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-bold ${getScoreColor(validation.scoreGeral)}`}>
                                {validation.scoreGeral}
                            </div>
                            <div className="text-sm text-muted-foreground">pontos</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <Progress value={validation.scoreGeral} className="h-3" />
                </CardContent>
            </Card>

            {/* Validation Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(validation.validacoes).map(([key, val]: [string, any]) => {
                    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1)

                    return (
                        <Card key={key}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{capitalizedKey}</CardTitle>
                                    {val.conforme ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Score</span>
                                        <span className={`font-semibold ${getScoreColor(val.score)}`}>
                                            {val.score}/100
                                        </span>
                                    </div>
                                    <Progress value={val.score} className="h-2" />

                                    {val.detalhes && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                {Object.entries(val.detalhes).map(([k, v]) => (
                                                    <div key={k} className="flex justify-between">
                                                        <span className="capitalize">{k.replace(/_/g, ' ')}:</span>
                                                        <span className="font-medium">
                                                            {typeof v === 'number' ? v.toFixed(2) : String(v)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Non-Conformities */}
            {validation.naoConformidades.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <CardTitle className="text-red-900">Não Conformidades</CardTitle>
                        </div>
                        <CardDescription>
                            {validation.naoConformidades.length} problema(s) detectado(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {validation.naoConformidades.map((nc, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span>{nc}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Recommendations */}
            {validation.recomendacoes.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <CardTitle className="text-yellow-900">Recomendações</CardTitle>
                        </div>
                        <CardDescription>
                            {validation.recomendacoes.length} recomendação(ões) para melhorias
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {validation.recomendacoes.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={onNewValidation}>
                    Nova Validação
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onExportDossie}>
                        <FileText className="h-4 w-4 mr-2" />
                        Visualizar Dossiê
                    </Button>
                    <Button onClick={onExportDossie}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Relatório
                    </Button>
                </div>
            </div>

            {/* Technical Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumo Técnico</CardTitle>
                    <CardDescription>Dados do sistema validado</CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt className="text-muted-foreground">Data da Validação</dt>
                            <dd className="font-medium">{new Date().toLocaleDateString('pt-BR')}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Status</dt>
                            <dd className={`font-medium ${validation.conforme ? 'text-green-600' : 'text-red-600'}`}>
                                {validation.conforme ? 'Conforme' : 'Não Conforme'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Score Geral</dt>
                            <dd className={`font-medium ${getScoreColor(validation.scoreGeral)}`}>
                                {validation.scoreGeral}/100
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Validações Realizadas</dt>
                            <dd className="font-medium">{Object.keys(validation.validacoes).length}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </div>
    )
}
