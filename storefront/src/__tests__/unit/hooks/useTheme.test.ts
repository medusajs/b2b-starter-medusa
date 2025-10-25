import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../../../lib/hooks/useTheme'

// Mock do localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

// Mock do matchMedia
const matchMediaMock = jest.fn()
Object.defineProperty(window, 'matchMedia', {
    value: matchMediaMock
})

// Mock do document
const mockDocument = {
    documentElement: {
        classList: {
            add: jest.fn(),
            remove: jest.fn(),
        },
        setAttribute: jest.fn(),
    },
    querySelector: jest.fn(),
}
Object.defineProperty(document, 'documentElement', {
    value: mockDocument.documentElement
})
Object.defineProperty(document, 'querySelector', {
    value: mockDocument.querySelector
})

describe('useTheme', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset document mocks
        mockDocument.documentElement.classList.add.mockClear()
        mockDocument.documentElement.classList.remove.mockClear()
        mockDocument.documentElement.setAttribute.mockClear()
        mockDocument.querySelector.mockClear()
    })

    it('should initialize with light theme by default', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue(null)

        const { result } = renderHook(() => useTheme())

        expect(result.current.theme).toBe('light')
        expect(result.current.mounted).toBe(true) // mounted becomes true after useEffect runs
    })

    it('should load theme from localStorage', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue('dark')

        const { result } = renderHook(() => useTheme())

        expect(result.current.theme).toBe('dark')
        expect(localStorageMock.getItem).toHaveBeenCalledWith('theme')
    })

    it('should use system preference when no stored theme', () => {
        matchMediaMock.mockReturnValue({ matches: true })
        localStorageMock.getItem.mockReturnValue(null)

        const { result } = renderHook(() => useTheme())

        expect(result.current.theme).toBe('dark')
    })

    it('should apply dark theme to document', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue('dark')
        mockDocument.querySelector.mockReturnValue({
            setAttribute: jest.fn()
        })

        renderHook(() => useTheme())

        expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('dark')
        expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-mode', 'dark')
    })

    it('should apply light theme to document', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue('light')
        mockDocument.querySelector.mockReturnValue({
            setAttribute: jest.fn()
        })

        renderHook(() => useTheme())

        expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('dark')
        expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-mode', 'light')
    })

    it('should update theme color meta tag for dark theme', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue('dark')
        const mockMeta = { setAttribute: jest.fn() }
        mockDocument.querySelector.mockReturnValue(mockMeta)

        renderHook(() => useTheme())

        expect(mockMeta.setAttribute).toHaveBeenCalledWith('content', '#09090b')
    })

    it('should update theme color meta tag for light theme', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue('light')
        const mockMeta = { setAttribute: jest.fn() }
        mockDocument.querySelector.mockReturnValue(mockMeta)

        renderHook(() => useTheme())

        expect(mockMeta.setAttribute).toHaveBeenCalledWith('content', '#ffffff')
    })

    it('should toggle theme from light to dark', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue('light')
        mockDocument.querySelector.mockReturnValue({
            setAttribute: jest.fn()
        })

        const { result } = renderHook(() => useTheme())

        act(() => {
            result.current.toggleTheme()
        })

        expect(result.current.theme).toBe('dark')
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
        expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('dark')
    })

    it('should toggle theme from dark to light', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue('dark')
        mockDocument.querySelector.mockReturnValue({
            setAttribute: jest.fn()
        })

        const { result } = renderHook(() => useTheme())

        act(() => {
            result.current.toggleTheme()
        })

        expect(result.current.theme).toBe('light')
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
        expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('dark')
    })

    it('should set theme directly', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue('light')
        mockDocument.querySelector.mockReturnValue({
            setAttribute: jest.fn()
        })

        const { result } = renderHook(() => useTheme())

        act(() => {
            result.current.setTheme('dark')
        })

        expect(result.current.theme).toBe('dark')
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('should set mounted to true after effect runs', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue(null)

        const { result } = renderHook(() => useTheme())

        expect(result.current.mounted).toBe(true)
    })

    it('should handle missing theme-color meta tag gracefully', () => {
        matchMediaMock.mockReturnValue({ matches: false })
        localStorageMock.getItem.mockReturnValue('dark')
        mockDocument.querySelector.mockReturnValue(null)

        renderHook(() => useTheme())

        // Should not throw error when meta tag is not found
        expect(mockDocument.querySelector).toHaveBeenCalledWith('meta[name="theme-color"]')
    })
})