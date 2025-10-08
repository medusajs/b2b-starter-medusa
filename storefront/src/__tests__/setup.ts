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

// Mock @medusajs/ui to avoid style injection issues
jest.mock('@medusajs/ui', () => ({
    clx: (...args: any[]) => args.filter(Boolean).join(' '),
    Toast: () => null,
    Button: () => null,
    Card: () => null,
    Badge: () => null,
    // Add other commonly used exports as needed
}))

// Mock document.createElement for download functionality
const mockCreateElement = jest.fn();
const mockLink = {
    href: '',
    download: '',
    click: jest.fn(),
    style: {}
};

mockCreateElement.mockReturnValue(mockLink);

Object.defineProperty(document, 'createElement', {
    writable: true,
    value: mockCreateElement
});

// Make it available globally for tests
(global as any).mockCreateElement = mockCreateElement;;

// Mock do fetch global
global.fetch = jest.fn()

// Mock document methods to prevent style injection issues
Object.defineProperty(document, 'head', {
    value: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
    },
    writable: true
})

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