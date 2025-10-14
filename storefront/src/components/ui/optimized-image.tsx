"use client"

import { useState } from "react"
import Image from "next/image"
import { clx } from "@medusajs/ui"

interface OptimizedImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    priority?: boolean
    placeholder?: "blur" | "empty"
    blurDataURL?: string
    sizes?: string
    quality?: number
    loading?: "lazy" | "eager"
    onLoad?: () => void
    onError?: () => void
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    placeholder = "empty",
    blurDataURL,
    sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality = 75,
    loading = "lazy",
    onLoad,
    onError,
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const handleLoad = () => {
        setIsLoading(false)
        onLoad?.()
    }

    const handleError = () => {
        setIsLoading(false)
        setHasError(true)
        onError?.()
    }

    if (hasError) {
        return (
            <div
                className={clx(
                    "flex items-center justify-center bg-gray-100 text-gray-400 text-sm",
                    className
                )}
                style={{ width: width || 'auto', height: height || 'auto' }}
            >
                <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 opacity-50">📷</div>
                    <div>Imagem não disponível</div>
                </div>
            </div>
        )
    }

    return (
        <div className={clx("relative overflow-hidden", className)}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                priority={priority}
                placeholder={placeholder}
                blurDataURL={blurDataURL}
                sizes={sizes}
                quality={quality}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
                className={clx(
                    "transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100"
                )}
            />

            {isLoading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                </div>
            )}
        </div>
    )
}

// Specialized component for solar product images
export function SolarProductImage({
    src,
    alt,
    className,
    priority = false,
}: Omit<OptimizedImageProps, 'width' | 'height' | 'sizes' | 'quality'>) {
    return (
        <OptimizedImage
            src={src}
            alt={alt}
            width={400}
            height={300}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            quality={80}
            className={clx("rounded-lg shadow-sm", className)}
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
        />
    )
}

// Hero image component with special optimizations
export function HeroImage({
    src,
    alt,
    className,
}: Omit<OptimizedImageProps, 'width' | 'height' | 'sizes' | 'quality' | 'priority'>) {
    return (
        <OptimizedImage
            src={src}
            alt={alt}
            width={1920}
            height={1080}
            sizes="100vw"
            quality={85}
            priority={true}
            loading="eager"
            className={clx("w-full h-full object-cover", className)}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
        />
    )
}