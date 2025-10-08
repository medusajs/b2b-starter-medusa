'use client'

/**
 * HelioVideo Component
 * 
 * Componente de vídeo animado do Hélio (mascote YSH Solar)
 * Vídeo animado que torna o onboarding mais envolvente e amigável
 */

import React, { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface HelioVideoProps {
  variant?: 'welcome' | 'compact' | 'celebration'
  autoPlay?: boolean
  loop?: boolean
  className?: string
  showControls?: boolean
}

export default function HelioVideo({ 
  variant = 'welcome',
  autoPlay = true,
  loop = true,
  className = '',
  showControls = true
}: HelioVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (videoRef.current && autoPlay) {
      // Tentar reproduzir automaticamente
      videoRef.current.play().catch(error => {
        console.log('Autoplay prevented:', error)
      })
    }
  }, [autoPlay])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const getVideoSize = () => {
    switch (variant) {
      case 'welcome':
        return 'w-full max-w-2xl mx-auto'
      case 'compact':
        return 'w-32 h-32'
      case 'celebration':
        return 'w-full max-w-xl mx-auto'
      default:
        return 'w-full'
    }
  }

  const getVideoUrl = () => {
    // URLs dos vídeos do Hélio (ajustar conforme necessário)
    switch (variant) {
      case 'welcome':
        return '/videos/helio-welcome.mp4'
      case 'compact':
        return '/videos/helio-idle.mp4'
      case 'celebration':
        return '/videos/helio-celebration.mp4'
      default:
        return '/videos/helio-welcome.mp4'
    }
  }

  return (
    <div className={`relative ${getVideoSize()} ${className}`}>
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full rounded-lg object-contain"
        autoPlay={autoPlay}
        loop={loop}
        muted={isMuted}
        playsInline
        preload="auto"
        onLoadedData={() => setIsLoaded(true)}
        poster="/images/helio-poster.png"
      >
        <source src={getVideoUrl()} type="video/mp4" />
        <source src={getVideoUrl().replace('.mp4', '.webm')} type="video/webm" />
        <track kind="captions" />
        Seu navegador não suporta reprodução de vídeo.
      </video>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Audio Toggle (apenas para variante welcome) */}
      {showControls && variant === 'welcome' && isLoaded && (
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
          aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-gray-700" />
          ) : (
            <Volume2 className="h-5 w-5 text-gray-700" />
          )}
        </button>
      )}

      {/* Animated Border (apenas para variante welcome) */}
      {variant === 'welcome' && (
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-lg opacity-75 blur-sm animate-pulse -z-10"></div>
      )}
    </div>
  )
}
