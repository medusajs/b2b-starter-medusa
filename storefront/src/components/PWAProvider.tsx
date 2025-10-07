'use client'

import { useEffect, useState } from 'react'

export function PWAProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Verificar se estamos no browser
        if (typeof window === 'undefined') return

        // Register service worker
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration)

                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available, notify user
                                    if (confirm('Nova versão disponível! Recarregar para atualizar?')) {
                                        window.location.reload()
                                    }
                                }
                            })
                        }
                    })
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError)
                })
        }

        // Handle PWA install prompt
        let deferredPrompt: any

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            deferredPrompt = e
            console.log('PWA install prompt available')
        }

        const handleAppInstalled = () => {
            console.log('PWA was installed')
            deferredPrompt = null
        }

        // Handle online/offline status
        const handleOnline = () => {
            console.log('App is online')
        }

        const handleOffline = () => {
            console.log('App is offline')
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return <>{children}</>
}

// Hook para instalar PWA
export function usePWAInstall() {
    const [isInstallable, setIsInstallable] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

    useEffect(() => {
        // Verificar se estamos no browser
        if (typeof window === 'undefined') return

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setIsInstallable(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const install = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt')
        } else {
            console.log('User dismissed the install prompt')
        }

        setDeferredPrompt(null)
        setIsInstallable(false)
    }

    return { isInstallable, install }
}