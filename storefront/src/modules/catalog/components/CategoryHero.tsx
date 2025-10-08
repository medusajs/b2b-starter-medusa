"use client"

import { ArrowRight, Zap, Award, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"

export interface CategoryHeroProps {
    title: string
    subtitle: string
    cta_primary?: string
    cta_secondary?: string
    benefits?: string[]
    stats?: Array<{ label: string; value: string }>
    background_image?: string
}

export default function CategoryHero({
    title,
    subtitle,
    cta_primary = "Explorar Produtos",
    cta_secondary = "Comparar Modelos",
    benefits = [],
    stats = [],
    background_image,
}: CategoryHeroProps) {
    const iconMap: Record<string, React.ReactNode> = {
        "Eficiência": <Zap className="w-5 h-5" />,
        "Garantia": <Shield className="w-5 h-5" />,
        "Certificação": <Award className="w-5 h-5" />,
        "Performance": <TrendingUp className="w-5 h-5" />,
    }

    const getIconForBenefit = (benefit: string) => {
        const key = Object.keys(iconMap).find((k) => benefit.includes(k))
        return key ? iconMap[key] : <Zap className="w-5 h-5" />
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white mb-8">
            {/* Background Pattern */}
            {background_image ? (
                <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center"
                    style={{ backgroundImage: `url(${background_image})` }}
                />
            ) : (
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_60%)]" />
                </div>
            )}

            <div className="relative z-10 px-8 py-12 lg:px-12 lg:py-16">
                <div className="max-w-5xl">
                    {/* Main Content */}
                    <div className="mb-8">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            {title}
                        </h1>
                        <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl">
                            {subtitle}
                        </p>
                    </div>

                    {/* Benefits */}
                    {benefits.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {benefits.map((benefit, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20"
                                >
                                    <div className="flex-shrink-0 text-yellow-300">
                                        {getIconForBenefit(benefit)}
                                    </div>
                                    <span className="text-sm font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    {stats.length > 0 && (
                        <div className="flex flex-wrap gap-6 mb-8">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <span className="text-3xl font-bold text-yellow-300">
                                        {stat.value}
                                    </span>
                                    <span className="text-sm text-blue-200">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-4">
                        <button className="ysh-btn-primary bg-yellow-400 text-gray-900 hover:bg-yellow-500 px-6 py-3 font-semibold inline-flex items-center gap-2 shadow-lg transition-all hover:shadow-xl">
                            {cta_primary}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <Link href="#comparacao">
                            <button className="ysh-btn-outline border-white text-white hover:bg-white/10 px-6 py-3 font-semibold">
                                {cta_secondary}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    className="w-full h-12 fill-current text-white"
                >
                    <path d="M0,0 Q300,80 600,40 T1200,0 L1200,120 L0,120 Z" />
                </svg>
            </div>
        </div>
    )
}
