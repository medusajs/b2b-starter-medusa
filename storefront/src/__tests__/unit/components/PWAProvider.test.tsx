import React from 'react'
import { render, screen } from '@testing-library/react'
import { PWAProvider, usePWAInstall } from '../../../components/PWAProvider'

// Mock do navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
    value: {
        register: jest.fn().mockResolvedValue({
            addEventListener: jest.fn(),
        }),
    },
    writable: true,
})

// Mock do window.addEventListener
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()

Object.defineProperty(window, 'addEventListener', {
    value: mockAddEventListener,
    writable: true,
})

Object.defineProperty(window, 'removeEventListener', {
    value: mockRemoveEventListener,
    writable: true,
})

describe('PWAProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset environment
        process.env.NODE_ENV = 'production'
    })

    it('renders children correctly', () => {
        render(
            <PWAProvider>
                <div>Test Child</div>
            </PWAProvider>
        )

        expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('registers service worker in production', () => {
        render(
            <PWAProvider>
                <div>Test</div>
            </PWAProvider>
        )

        expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js')
    })

    it('does not register service worker in development', () => {
        process.env.NODE_ENV = 'development'

        render(
            <PWAProvider>
                <div>Test</div>
            </PWAProvider>
        )

        expect(navigator.serviceWorker.register).not.toHaveBeenCalled()
    })

    it('adds event listeners on mount', () => {
        render(
            <PWAProvider>
                <div>Test</div>
            </PWAProvider>
        )

        expect(mockAddEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function))
        expect(mockAddEventListener).toHaveBeenCalledWith('appinstalled', expect.any(Function))
        expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function))
        expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
    })

    it('removes event listeners on unmount', () => {
        const { unmount } = render(
            <PWAProvider>
                <div>Test</div>
            </PWAProvider>
        )

        unmount()

        expect(mockRemoveEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function))
        expect(mockRemoveEventListener).toHaveBeenCalledWith('appinstalled', expect.any(Function))
        expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function))
        expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
    })
})

describe('usePWAInstall', () => {
    it('returns initial state', () => {
        let result: any

        const TestComponent = () => {
            result = usePWAInstall()
            return null
        }

        render(<TestComponent />)

        expect(result.isInstallable).toBe(false)
        expect(result.deferredPrompt).toBeUndefined()
    })
})