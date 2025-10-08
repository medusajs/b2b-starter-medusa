/**
 * SKU QR Code Component
 * Gera QR Code para SKUs em dispositivos móveis
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { clx } from '@medusajs/ui'

interface SKUQRCodeProps {
    sku: string
    size?: number
    productName?: string
    className?: string
}

/**
 * Componente que exibe QR Code para SKU
 * Usa API do QR Server (qr-server.com) - gratuita e sem necessidade de libs
 */
export function SKUQRCode({
    sku,
    size = 200,
    productName,
    className
}: SKUQRCodeProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Detecta se é mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // URL do QR Code (API gratuita)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(sku)}`

    // Dados para compartilhamento
    const shareData = {
        title: `SKU: ${sku}`,
        text: productName ? `${productName}\nSKU: ${sku}` : `SKU: ${sku}`,
        url: window.location.href,
    }

    // Compartilhar via Web Share API (mobile)
    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (error) {
                console.log('Erro ao compartilhar:', error)
            }
        }
    }

    // Download do QR Code
    const handleDownload = () => {
        const link = document.createElement('a')
        link.href = qrCodeUrl
        link.download = `qrcode-${sku}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Não renderiza se não for mobile (opcional - pode ser usado em desktop também)
    // if (!isMobile) return null

    return (
        <>
            {/* Botão para abrir QR Code */}
            <button
                onClick={() => setIsOpen(true)}
                className={clx(
                    'inline-flex items-center gap-2 px-3 py-2',
                    'bg-gray-100 hover:bg-gray-200',
                    'rounded-lg transition-colors',
                    'text-sm font-medium text-gray-700',
                    className
                )}
                title="Gerar QR Code do SKU"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>QR Code</span>
            </button>

            {/* Modal com QR Code */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                QR Code do SKU
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Fechar modal"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* QR Code Image */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                <Image
                                    src={qrCodeUrl}
                                    alt={`QR Code para SKU ${sku}`}
                                    width={size}
                                    height={size}
                                    className="w-full h-auto"
                                    unoptimized
                                />
                            </div>
                        </div>

                        {/* SKU Info */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">SKU:</p>
                            <code className="text-sm font-mono text-gray-900 break-all">
                                {sku}
                            </code>
                            {productName && (
                                <>
                                    <p className="text-xs text-gray-500 mt-2 mb-1">Produto:</p>
                                    <p className="text-sm text-gray-700">{productName}</p>
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownload}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Baixar</span>
                            </button>

                            {typeof window !== 'undefined' && 'share' in navigator && (
                                <button
                                    onClick={handleShare}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                    aria-label="Compartilhar QR Code"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    <span>Compartilhar</span>
                                </button>
                            )}
                        </div>

                        {/* Instructions */}
                        <p className="text-xs text-gray-500 text-center mt-4">
                            Escaneie o QR Code para copiar o SKU rapidamente
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}

/**
 * Versão compacta do botão QR Code (apenas ícone)
 */
export function SKUQRCodeButton({
    sku,
    productName,
    className
}: Omit<SKUQRCodeProps, 'size'>) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={clx(
                    'p-2 hover:bg-gray-100 rounded-lg transition-colors',
                    className
                )}
                title="Gerar QR Code"
                aria-label="Gerar QR Code do SKU"
            >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
            </button>

            {isOpen && (
                <SKUQRCode
                    sku={sku}
                    productName={productName}
                    size={200}
                />
            )}
        </>
    )
}

export default SKUQRCode
