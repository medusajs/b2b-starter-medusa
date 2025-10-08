import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SKUAutocomplete } from '../../../components/SKUAutocomplete'

// Mock do Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

// Mock do fetch global
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('SKUAutocomplete', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    const mockProducts = [
        {
            id: '1',
            title: 'Produto Teste 1',
            sku: 'SKU001',
            thumbnail: 'image1.jpg',
            variants: [{ prices: [{ amount: 10000 }] }],
            categories: [{ name: 'Categoria 1' }]
        },
        {
            id: '2',
            title: 'Produto Teste 2',
            sku: 'SKU002',
            thumbnail: 'image2.jpg',
            variants: [{ prices: [{ amount: 20000 }] }],
            categories: [{ name: 'Categoria 2' }]
        }
    ]

    it('renders input field correctly', () => {
        render(<SKUAutocomplete />)

        const input = screen.getByPlaceholderText('Buscar por SKU...')
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('type', 'text')
    })

    it('shows custom placeholder', () => {
        render(<SKUAutocomplete placeholder="Digite o SKU..." />)

        expect(screen.getByPlaceholderText('Digite o SKU...')).toBeInTheDocument()
    })

    it('does not search for queries shorter than 3 characters', () => {
        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'SK' } })

        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('searches for queries with 3 or more characters', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ products: mockProducts })
        } as Response)

        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'SKU' } })

        // Wait for debounce
        jest.advanceTimersByTime(300)

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/products/search-sku?q=SKU')
        })
    })

    it('displays loading state while searching', async () => {
        mockFetch.mockImplementation(() => new Promise(() => { })) // Never resolves

        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'SKU001' } })

        // Wait for debounce
        jest.advanceTimersByTime(300)

        await waitFor(() => {
            // Check for loading spinner (aria-label or specific class)
            const loadingElement = document.querySelector('.animate-spin')
            expect(loadingElement).toBeInTheDocument()
        })
    })

    it('displays suggestions when search returns results', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ products: mockProducts })
        } as Response)

        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'SKU' } })

        // Wait for debounce and API call
        jest.advanceTimersByTime(300)
        await waitFor(() => {
            expect(screen.getByText('Produto Teste 1')).toBeInTheDocument()
            expect(screen.getByText('Produto Teste 2')).toBeInTheDocument()
        })

        // Check SKU codes
        expect(screen.getByText('SKU: SKU001')).toBeInTheDocument()
        expect(screen.getByText('SKU: SKU002')).toBeInTheDocument()

        // Check prices
        expect(screen.getByText('R$ 100,00')).toBeInTheDocument()
        expect(screen.getByText('R$ 200,00')).toBeInTheDocument()
    })

    it('navigates to product page when suggestion is clicked', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ products: mockProducts })
        } as Response)

        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'SKU' } })

        // Wait for suggestions to appear
        jest.advanceTimersByTime(300)
        await waitFor(() => {
            expect(screen.getByText('Produto Teste 1')).toBeInTheDocument()
        })

        // Click on first suggestion
        const firstSuggestion = screen.getByText('Produto Teste 1').closest('button')
        fireEvent.click(firstSuggestion!)

        expect(mockPush).toHaveBeenCalledWith('/produtos/Categoria 1/1')
    })

    it('calls onSelect callback when provided', async () => {
        const mockOnSelect = jest.fn()
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ products: mockProducts })
        } as Response)

        render(<SKUAutocomplete onSelect={mockOnSelect} />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'SKU' } })

        // Wait for suggestions
        jest.advanceTimersByTime(300)
        await waitFor(() => {
            expect(screen.getByText('Produto Teste 1')).toBeInTheDocument()
        })

        // Click on suggestion
        const firstSuggestion = screen.getByText('Produto Teste 1').closest('button')
        fireEvent.click(firstSuggestion!)

        expect(mockOnSelect).toHaveBeenCalledWith({
            id: '1',
            name: 'Produto Teste 1',
            sku: 'SKU001',
            image_url: 'image1.jpg',
            price: 10000,
            category: 'Categoria 1'
        })
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('handles keyboard navigation', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ products: mockProducts })
        } as Response)

        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'SKU' } })

        // Wait for suggestions
        jest.advanceTimersByTime(300)
        await waitFor(() => {
            expect(screen.getByText('Produto Teste 1')).toBeInTheDocument()
        })

        // Navigate down
        fireEvent.keyDown(input, { key: 'ArrowDown' })
        expect(input).toHaveFocus()

        // Select with Enter
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(mockPush).toHaveBeenCalledWith('/produtos/Categoria 1/1')
    })

    it('closes dropdown on Escape key', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ products: mockProducts })
        } as Response)

        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'SKU' } })

        // Wait for suggestions
        jest.advanceTimersByTime(300)
        await waitFor(() => {
            expect(screen.getByText('Produto Teste 1')).toBeInTheDocument()
        })

        // Close with Escape
        fireEvent.keyDown(input, { key: 'Escape' })

        await waitFor(() => {
            expect(screen.queryByText('Produto Teste 1')).not.toBeInTheDocument()
        })
    })

    it('closes dropdown when clicking outside', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ products: mockProducts })
        } as Response)

        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'SKU' } })

        // Wait for suggestions
        jest.advanceTimersByTime(300)
        await waitFor(() => {
            expect(screen.getByText('Produto Teste 1')).toBeInTheDocument()
        })

        // Click outside
        fireEvent.mouseDown(document.body)

        await waitFor(() => {
            expect(screen.queryByText('Produto Teste 1')).not.toBeInTheDocument()
        })
    })

    it('shows no results message when search returns empty', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ products: [] })
        } as Response)

        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'NONEXISTENT' } })

        // Wait for search
        jest.advanceTimersByTime(300)
        await waitFor(() => {
            expect(screen.getByText('Nenhum produto encontrado para "NONEXISTENT"')).toBeInTheDocument()
        })
    })

    it('handles API errors gracefully', async () => {
        mockFetch.mockRejectedValueOnce(new Error('API Error'))

        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        fireEvent.change(input, { target: { value: 'SKU' } })

        // Wait for search
        jest.advanceTimersByTime(300)

        // Should not crash and should clear suggestions
        await waitFor(() => {
            expect(screen.queryByText('Produto Teste 1')).not.toBeInTheDocument()
        })
    })

    it('debounces search requests', () => {
        render(<SKUAutocomplete />)
        const input = screen.getByPlaceholderText('Buscar por SKU...')

        // Type multiple times quickly
        fireEvent.change(input, { target: { value: 'S' } })
        fireEvent.change(input, { target: { value: 'SK' } })
        fireEvent.change(input, { target: { value: 'SKU' } })

        // Only one API call should be made after debounce
        jest.advanceTimersByTime(300)
        expect(mockFetch).toHaveBeenCalledTimes(1)
    })
})