import '@testing-library/jest-dom'

// Configuração específica para React 19
import { configure } from '@testing-library/react'

// Configurar React Testing Library para React 19
configure({
    reactStrictMode: true,
})

// Importar TextEncoder/TextDecoder antes do JSDOM
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder as any
global.TextDecoder = TextDecoder as any

// Configuração manual do jsdom para React 19
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable',
})

global.window = dom.window as any
global.document = dom.window.document
global.navigator = dom.window.navigator
global.HTMLElement = dom.window.HTMLElement
global.HTMLInputElement = dom.window.HTMLInputElement
global.HTMLButtonElement = dom.window.HTMLButtonElement
global.HTMLDivElement = dom.window.HTMLDivElement

// Copiar propriedades do window para global
Object.keys(dom.window).forEach(key => {
    if (!(key in global)) {
        (global as any)[key] = (dom.window as any)[key]
    }
})

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