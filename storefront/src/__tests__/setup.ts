import '@testing-library/jest-dom'

// Configuração específica para React 19
import { configure } from '@testing-library/react'

// Configurar React Testing Library para React 19
configure({
    reactStrictMode: false,
})

// Importar TextEncoder/TextDecoder para compatibilidade
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder as any
global.TextDecoder = TextDecoder as any

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

// Mock do @medusajs/ui completamente para evitar problemas de DOM
jest.mock('@medusajs/ui', () => ({
    clx: (...classes: any[]) => classes.filter(Boolean).join(' '),
    // Mock other components if needed
}))

// Configurações globais de teste
beforeEach(() => {
    jest.clearAllMocks()
})