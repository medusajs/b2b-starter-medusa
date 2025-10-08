/**
 * PDF Generator Utility
 * 
 * Provides functions to generate PDF documents for:
 * - Finance calculations
 * - Financing simulations
 */

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Generate PDF from HTML element
 */
export async function generatePDFFromElement(
    elementId: string,
    filename: string
): Promise<void> {
    const element = document.getElementById(elementId)
    if (!element) {
        throw new Error(`Element with id "${elementId}" not found`)
    }

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    })

    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(filename)
}

/**
 * Generate Finance Calculation PDF
 */
export async function generateFinancePDF(data: {
    projectName: string
    systemPower: number
    totalCost: number
    capex: number
    monthlyRevenue: number
    monthlyExpense: number
    netMonthlyCashFlow: number
    paybackPeriod: number
    roi: number
    bacenRate: number
    generatedAt: Date
}): Promise<Blob> {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    })

    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Análise Financeira do Projeto Solar', 105, 20, { align: 'center' })

    // Project Info
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Projeto: ${data.projectName}`, 20, 40)
    pdf.text(`Data: ${data.generatedAt.toLocaleDateString('pt-BR')}`, 20, 47)
    pdf.text(`Potência do Sistema: ${data.systemPower.toFixed(2)} kWp`, 20, 54)

    // Financial Summary
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Resumo Financeiro', 20, 70)

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const financialData = [
        ['CAPEX Total:', `R$ ${data.capex.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Custo Total do Projeto:', `R$ ${data.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Receita Mensal:', `R$ ${data.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Despesa Mensal:', `R$ ${data.monthlyExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Fluxo de Caixa Líquido:', `R$ ${data.netMonthlyCashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
    ]

    let yPos = 80
    financialData.forEach(([label, value]) => {
        pdf.text(label, 20, yPos)
        pdf.text(value, 120, yPos)
        yPos += 7
    })

    // ROI & Payback
    yPos += 10
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Indicadores de Retorno', 20, yPos)

    yPos += 10
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`ROI (Retorno sobre Investimento): ${data.roi.toFixed(2)}%`, 20, yPos)
    yPos += 7
    pdf.text(`Payback: ${data.paybackPeriod.toFixed(1)} meses`, 20, yPos)
    yPos += 7
    pdf.text(`Taxa BACEN: ${data.bacenRate.toFixed(2)}% a.a.`, 20, yPos)

    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(128)
    pdf.text('Gerado por YSH Store - Sistema de Energia Solar', 105, 285, { align: 'center' })

    return pdf.output('blob')
}

/**
 * Generate Financing Simulation PDF
 */
export async function generateFinancingPDF(data: {
    productName: string
    productPrice: number
    downPayment: number
    financedAmount: number
    installments: number
    installmentValue: number
    totalAmount: number
    interestRate: number
    effectiveRate: number
    generatedAt: Date
}): Promise<Blob> {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    })

    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Simulação de Financiamento', 105, 20, { align: 'center' })

    // Product Info
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Produto: ${data.productName}`, 20, 40)
    pdf.text(`Data: ${data.generatedAt.toLocaleDateString('pt-BR')}`, 20, 47)

    // Financing Details
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Detalhes do Financiamento', 20, 65)

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const financingData = [
        ['Preço do Produto:', `R$ ${data.productPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Entrada:', `R$ ${data.downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Valor Financiado:', `R$ ${data.financedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Número de Parcelas:', `${data.installments}x`],
        ['Valor da Parcela:', `R$ ${data.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Valor Total:', `R$ ${data.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
    ]

    let yPos = 75
    financingData.forEach(([label, value]) => {
        pdf.text(label, 20, yPos)
        pdf.text(value, 120, yPos)
        yPos += 7
    })

    // Interest Rates
    yPos += 10
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Taxas de Juros', 20, yPos)

    yPos += 10
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Taxa de Juros: ${data.interestRate.toFixed(2)}% a.m.`, 20, yPos)
    yPos += 7
    pdf.text(`Taxa Efetiva: ${data.effectiveRate.toFixed(2)}% a.a.`, 20, yPos)

    // Payment Schedule Preview
    yPos += 15
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Cronograma de Pagamentos (Primeiras 12 Parcelas)', 20, yPos)

    yPos += 10
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Parcela', 20, yPos)
    pdf.text('Valor', 70, yPos)
    pdf.text('Juros', 110, yPos)
    pdf.text('Amortização', 145, yPos)

    yPos += 5
    pdf.setFont('helvetica', 'normal')
    const maxParcelas = Math.min(data.installments, 12)

    for (let i = 1; i <= maxParcelas; i++) {
        // Simplified calculation (real calculation would use Price formula)
        const juros = (data.financedAmount * data.interestRate / 100)
        const amortizacao = data.installmentValue - juros

        pdf.text(`${i}`, 20, yPos)
        pdf.text(`R$ ${data.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 70, yPos)
        pdf.text(`R$ ${juros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 110, yPos)
        pdf.text(`R$ ${amortizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 145, yPos)
        yPos += 6
    }

    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(128)
    pdf.text('Gerado por YSH Store - Sistema de Energia Solar', 105, 285, { align: 'center' })
    pdf.text('Esta é uma simulação e não constitui oferta de crédito', 105, 290, { align: 'center' })

    return pdf.output('blob')
}

/**
 * Download PDF blob
 */
export function downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
