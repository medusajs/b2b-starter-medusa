'use client'

/**
 * VideoPlayer Component
 * 
 * Player de vídeo reutilizável com overlay do Helio
 * Destaca vídeos de forma eficaz no onboarding
 */

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoPlayerProps {
  videoUrl: string
  thumbnail?: string
  title?: string
  description?: string
  autoPlay?: boolean
  showControls?: boolean
  hostName?: string // Nome do apresentador (ex: "Helio")
  hostAvatar?: string // Avatar do apresentador
  onComplete?: () => void
  className?: string
}

export default function VideoPlayer({
  videoUrl,
  thumbnail,
  title,
  description,
  autoPlay = false,
  showControls = true,
  hostName = 'Helio',
  hostAvatar = '/images/helio-avatar.png',
  onComplete,
  className = ''
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showThumbnail, setShowThumbnail] = useState(!autoPlay)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100
      setProgress(progress)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setShowThumbnail(true)
      onComplete?.()
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [onComplete])

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      if (!hasStarted) {
        setHasStarted(true)
        setShowThumbnail(false)
      }
      video.play()
    }
  }

  const handleMuteToggle = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    video.currentTime = percentage * video.duration
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const handleThumbnailClick = () => {
    setShowThumbnail(false)
    setHasStarted(true)
    handlePlayPause()
  }

  return (
    <div className={`relative rounded-xl overflow-hidden bg-black shadow-2xl ${className}`}>
      {/* Host Badge - Destaque do Helio */}
      {hostName && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
          {hostAvatar && (
            <img 
              src={hostAvatar} 
              alt={hostName}
              className="w-8 h-8 rounded-full border-2 border-white"
            />
          )}
          <span className="font-bold text-sm">
            🎥 {hostName} te explica
          </span>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video object-cover"
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
      />

      {/* Thumbnail Overlay */}
      {showThumbnail && thumbnail && (
        <div 
          className="absolute inset-0 cursor-pointer group"
          onClick={handleThumbnailClick}
        >
          <img 
            src={thumbnail} 
            alt={title || 'Video thumbnail'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <Play className="w-10 h-10 text-orange-500 ml-1" fill="currentColor" />
            </button>
          </div>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-white font-bold text-xl mb-1">{title}</h3>
              {description && (
                <p className="text-white/90 text-sm">{description}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom Controls */}
      {showControls && hasStarted && !showThumbnail && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all group-hover:h-1.5"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="small"
                onClick={handlePlayPause}
                className="text-white hover:text-yellow-400"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="small"
                onClick={handleMuteToggle}
                className="text-white hover:text-yellow-400"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="small"
              onClick={handleFullscreen}
              className="text-white hover:text-yellow-400"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>

          {/* Video Info */}
          {title && (
            <div className="mt-2">
              <p className="text-white text-sm font-medium">{title}</p>
            </div>
          )}
        </div>
      )}

      {/* Loading Spinner */}
      {!hasStarted && !showThumbnail && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      )}
    </div>
  )
}

/**
 * VideoModal Component
 * 
 * Modal para exibir vídeos em destaque
 */
interface VideoModalProps extends VideoPlayerProps {
  isOpen: boolean
  onClose: () => void
}

export function VideoModal({
  isOpen,
  onClose,
  ...videoProps
}: VideoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl">
        <Button
          variant="ghost"
          size="small"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-yellow-400"
        >
          <X className="w-6 h-6" />
        </Button>
        <VideoPlayer {...videoProps} autoPlay />
      </div>
    </div>
  )
}
