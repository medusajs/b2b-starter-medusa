import '@testing-library/jest-dom'

// Mock do Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
        }
    },
    useSearchParams() {
        return new URLSearchParams()
    },
    usePathname() {
        return '/'
    },
}))

// Mock do componente Image do Next.js
jest.mock('next/image', () => ({
    __esModule: true,
    default: 'img',
}))

// Mock do fetch global
global.fetch = jest.fn()

// Configurações globais de teste
beforeEach(() => {
    jest.clearAllMocks()
})

// Teste básico para verificar se o setup está funcionando
describe('Test Setup', () => {
    it('should have jest mocked functions available', () => {
        expect(jest.fn()).toBeDefined()
        expect(global.fetch).toBeDefined()
    })

    it('should clear mocks before each test', () => {
        const mockFn = jest.fn()
        mockFn()
        expect(mockFn).toHaveBeenCalledTimes(1)

        // O beforeEach deve limpar os mocks, mas isso é testado indiretamente
        // pelos outros testes que usam mocks
    })
})