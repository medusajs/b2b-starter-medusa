'use client'

import React, { useEffect } from 'react'

export function PWAProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
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

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            deferredPrompt = e

            // Show install button or notification
            console.log('PWA install prompt available')
        })

        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed')
            deferredPrompt = null
        })

        // Handle online/offline status
        const handleOnline = () => {
            console.log('App is online')
            // You can dispatch custom events or update state here
        }

        const handleOffline = () => {
            console.log('App is offline')
            // Show offline notification or update UI
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return <>{children}</>
}

// Hook para instalar PWA
export function usePWAInstall() {
    const [isInstallable, setIsInstallable] = React.useState(false)
    const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)

    useEffect(() => {
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