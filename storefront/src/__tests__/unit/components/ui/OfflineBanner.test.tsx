import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OfflineBanner, FallbackBadge } from '../../../../components/ui/offline-banner'

// Mock do fetch global
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('OfflineBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders nothing when online', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ healthy: true, fallback: { active: false } })
        } as Response)

        render(<OfflineBanner />)

        await waitFor(() => {
            expect(screen.queryByText('Modo Offline Ativo')).not.toBeInTheDocument()
        })
    })

    it('renders banner when offline', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ healthy: false })
        } as Response)

        render(<OfflineBanner />)

        await waitFor(() => {
            expect(screen.getByText('Modo Offline Ativo')).toBeInTheDocument()
            expect(screen.getByText(/Estamos com problemas de conexão/)).toBeInTheDocument()
        })
    })

    it('renders banner when in fallback mode', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ healthy: true, fallback: { active: true } })
        } as Response)

        render(<OfflineBanner />)

        await waitFor(() => {
            expect(screen.getByText('Modo Offline Ativo')).toBeInTheDocument()
        })
    })

    it('handles fetch error gracefully', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        render(<OfflineBanner />)

        await waitFor(() => {
            expect(screen.getByText('Modo Offline Ativo')).toBeInTheDocument()
        })
    })

    it('dismisses banner when close button is clicked', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ healthy: false })
        } as Response)

        render(<OfflineBanner />)

        await waitFor(() => {
            expect(screen.getByText('Modo Offline Ativo')).toBeInTheDocument()
        })

        const closeButton = screen.getByLabelText('Dispensar aviso')
        fireEvent.click(closeButton)

        expect(screen.queryByText('Modo Offline Ativo')).not.toBeInTheDocument()
    })

    it('retries connection when retry button is clicked', async () => {
        mockFetch
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ healthy: false })
            } as Response)
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ healthy: true })
            } as Response)

        render(<OfflineBanner />)

        await waitFor(() => {
            expect(screen.getByText('Modo Offline Ativo')).toBeInTheDocument()
        })

        const retryButton = screen.getByText('Reconectar')
        fireEvent.click(retryButton)

        expect(screen.getByText('Verificando...')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.queryByText('Modo Offline Ativo')).not.toBeInTheDocument()
        })
    })

    it('checks health periodically', async () => {
        mockFetch.mockResolvedValue({
            json: () => Promise.resolve({ healthy: false })
        } as Response)

        render(<OfflineBanner />)

        // Initial check
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/health', { cache: 'no-store' })
        })

        // Advance timer by 30 seconds
        jest.advanceTimersByTime(30000)

        expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('shows loading state during retry', async () => {
        mockFetch
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ healthy: false })
            } as Response)
            .mockResolvedValueOnce({
                json: () => new Promise(resolve => setTimeout(() => resolve({ healthy: true }), 100))
            } as Response)

        render(<OfflineBanner />)

        await waitFor(() => {
            expect(screen.getByText('Modo Offline Ativo')).toBeInTheDocument()
        })

        const retryButton = screen.getByText('Reconectar')
        fireEvent.click(retryButton)

        expect(screen.getByText('Verificando...')).toBeInTheDocument()
    })
})

describe('FallbackBadge', () => {
    it('renders correctly', () => {
        render(<FallbackBadge />)

        expect(screen.getByText('Catálogo Local')).toBeInTheDocument()
        // Check for the alert circle icon (Lucide React AlertCircle)
        const icon = document.querySelector('.lucide-circle-alert')
        expect(icon).toBeInTheDocument()
    })
})
