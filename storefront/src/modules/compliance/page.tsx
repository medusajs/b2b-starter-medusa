'use client'

/**
 * Compliance Page
 * 
 * Página principal do módulo de conformidade PRODIST
 * Flow: Wizard → Validation Results → Dossie Preview
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ComplianceWizard from './components/ComplianceWizard'
import ValidationResults from './components/ValidationResults'
import DossiePreview from './components/DossiePreview'
import type { ComplianceInput, ProdistValidation } from './types'

type FlowStep = 'wizard' | 'results' | 'dossie'

export default function CompliancePage() {
    const [currentStep, setCurrentStep] = useState<FlowStep>('wizard')
    const [complianceInput, setComplianceInput] = useState<ComplianceInput | null>(null)
    const [validation, setValidation] = useState<ProdistValidation | null>(null)

    // Handle wizard completion
    const handleWizardComplete = (validationResult: ProdistValidation) => {
        setValidation(validationResult)
        setCurrentStep('results')
    }

    // Handle wizard cancel
    const handleWizardCancel = () => {
        // Could redirect to dashboard or show confirmation dialog
        if (window.confirm('Deseja cancelar a validação? Os dados não serão salvos.')) {
            setCurrentStep('wizard')
            setComplianceInput(null)
            setValidation(null)
        }
    }

    // Handle new validation from results
    const handleNewValidation = () => {
        setCurrentStep('wizard')
        setComplianceInput(null)
        setValidation(null)
    }

    // Handle export dossie (navigate to dossie preview)
    const handleExportDossie = () => {
        setCurrentStep('dossie')
    }

    // Handle actual export (PDF/DOCX)
    const handleDossieExport = async (format: 'pdf' | 'docx') => {
        if (!complianceInput || !validation) return

        try {
            // Call backend API to generate document
            const response = await fetch('/api/compliance/dossie/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: complianceInput,
                    validation: validation,
                    format: format
                })
            })

            if (!response.ok) {
                throw new Error('Failed to export dossie')
            }

            // Download the file
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `dossie-tecnico-${new Date().getTime()}.${format}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Export error:', error)
            alert('Erro ao exportar dossiê. Tente novamente.')
        }
    }

    // Handle back navigation
    const handleBack = () => {
        if (currentStep === 'results') {
            setCurrentStep('wizard')
        } else if (currentStep === 'dossie') {
            setCurrentStep('results')
        }
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header with back button */}
            {currentStep !== 'wizard' && (
                <div className="mb-6">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                </div>
            )}

            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Validação de Conformidade PRODIST
                </h1>
                <p className="text-muted-foreground">
                    {currentStep === 'wizard' && 'Preencha os dados do sistema fotovoltaico para validação'}
                    {currentStep === 'results' && 'Resultados da validação de conformidade'}
                    {currentStep === 'dossie' && 'Dossiê técnico de conformidade'}
                </p>
            </div>

            {/* Flow Steps */}
            {currentStep === 'wizard' && (
                <ComplianceWizard
                    onComplete={handleWizardComplete}
                    onCancel={handleWizardCancel}
                />
            )}

            {currentStep === 'results' && validation && (
                <ValidationResults
                    validation={validation}
                    onExportDossie={handleExportDossie}
                    onNewValidation={handleNewValidation}
                />
            )}

            {currentStep === 'dossie' && complianceInput && validation && (
                <DossiePreview
                    input={complianceInput}
                    validation={validation}
                    onExport={handleDossieExport}
                />
            )}
        </div>
    )
}
