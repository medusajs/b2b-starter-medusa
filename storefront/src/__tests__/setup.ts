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

// Mock do fetch global
global.fetch = jest.fn()

// Configurações globais de teste
beforeEach(() => {
    jest.clearAllMocks()
})