"use client"

import { motion } from "framer-motion"
import { clx } from "@medusajs/ui"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg" | "xl"
    color?: "primary" | "secondary" | "white"
    className?: string
}

export function LoadingSpinner({
    size = "md",
    color = "primary",
    className
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12"
    }

    const colorClasses = {
        primary: "border-yellow-500 border-t-transparent",
        secondary: "border-gray-500 border-t-transparent",
        white: "border-white border-t-transparent"
    }

    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }}
            className={clx(
                "rounded-full border-2 border-solid",
                sizeClasses[size],
                colorClasses[color],
                className
            )}
        />
    )
}

interface LoadingSkeletonProps {
    className?: string
    lines?: number
    height?: string
    animate?: boolean
}

export function LoadingSkeleton({
    className,
    lines = 1,
    height = "h-4",
    animate = true
}: LoadingSkeletonProps) {
    const skeletonLines = Array.from({ length: lines }, (_, i) => (
        <motion.div
            key={i}
            initial={{ opacity: 0.5 }}
            animate={animate ? {
                opacity: [0.5, 1, 0.5],
            } : {}}
            transition={animate ? {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1
            } : {}}
            className={clx(
                "bg-gray-200 rounded",
                height,
                i < lines - 1 ? "mb-2" : "",
                className
            )}
        />
    ))

    return <div>{skeletonLines}</div>
}

interface LoadingCardProps {
    className?: string
    showAvatar?: boolean
    lines?: number
}

export function LoadingCard({
    className,
    showAvatar = false,
    lines = 3
}: LoadingCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clx(
                "bg-white border border-gray-200 rounded-lg p-6 shadow-sm",
                className
            )}
        >
            {showAvatar && (
                <div className="flex items-center mb-4">
                    <LoadingSkeleton className="w-10 h-10 rounded-full" height="h-10" />
                    <div className="ml-3 flex-1">
                        <LoadingSkeleton className="w-24" height="h-4" />
                        <LoadingSkeleton className="w-16 mt-1" height="h-3" />
                    </div>
                </div>
            )}

            <LoadingSkeleton lines={lines} />

            <div className="flex justify-between items-center mt-4">
                <LoadingSkeleton className="w-20" height="h-8" />
                <LoadingSkeleton className="w-16" height="h-8" />
            </div>
        </motion.div>
    )
}

interface LoadingGridProps {
    count?: number
    className?: string
    cardClassName?: string
}

export function LoadingGrid({
    count = 6,
    className,
    cardClassName
}: LoadingGridProps) {
    return (
        <div className={clx(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            className
        )}>
            {Array.from({ length: count }, (_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <LoadingCard className={cardClassName} />
                </motion.div>
            ))}
        </div>
    )
}

// Specialized loading component for solar calculator
export function SolarCalculatorLoading() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <LoadingSkeleton className="w-64 mx-auto" height="h-6" />
                <LoadingSkeleton className="w-48 mx-auto mt-2" height="h-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LoadingCard lines={4} />
                <LoadingCard lines={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <LoadingCard key={i} lines={2} />
                ))}
            </div>
        </div>
    )
}

// Loading component for hero section
export function HeroLoading() {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl">
            <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:py-20">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <LoadingSkeleton className="w-24 h-24 rounded-full mx-auto" height="h-24" />
                    <LoadingSkeleton className="w-96 mx-auto" height="h-8" />
                    <LoadingSkeleton className="w-80 mx-auto" height="h-6" />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        {Array.from({ length: 3 }, (_, i) => (
                            <LoadingSkeleton key={i} className="w-full" height="h-16" />
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <LoadingSkeleton className="w-48" height="h-12" />
                        <LoadingSkeleton className="w-48" height="h-12" />
                    </div>
                </div>
            </div>
        </div>
    )
}