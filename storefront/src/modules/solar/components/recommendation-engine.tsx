"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, TrendingUp, Users, Award, Zap, Shield, Leaf, CheckCircle } from "lucide-react"
import { Card, Button } from "@/lib/design-system"
import { sendEvent } from "@/modules/common/analytics/events"
import Link from "next/link"

interface UserProfile {
    location?: {
        lat: number
        lon: number
        irradiance: number
    }
    consumption?: {
        monthly_kwh: number
        pattern: 'residential' | 'commercial' | 'industrial'
    }
    preferences?: {
        budget?: number
        priority?: 'cost' | 'performance' | 'sustainability'
        installation_type?: 'roof' | 'ground' | 'carport'
    }
    history?: {
        viewed_products: string[]
        calculated_systems: Array<{
            kwp: number
            savings: number
            payback_years: number
        }>
    }
}

interface ProductRecommendation {
    id: string
    name: string
    type: 'panel' | 'inverter' | 'battery' | 'kit'
    price: number
    efficiency: number
    warranty: number
    score: number
    reasons: string[]
    badges: string[]
    image: string
}

interface RecommendationEngineProps {
    userProfile?: Partial<UserProfile>
    maxRecommendations?: number
    className?: string
}

export function RecommendationEngine({
    userProfile = {},
    maxRecommendations = 6,
    className
}: RecommendationEngineProps) {
    const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'panels' | 'inverters' | 'kits'>('all')

    // Mock recommendation engine - in production, this would call an AI service
    const generateRecommendations = useMemo(() => {
        const baseRecommendations: ProductRecommendation[] = [
            {
                id: 'panel-premium-450w',
                name: 'Painel Solar Premium 450W',
                type: 'panel',
                price: 850,
                efficiency: 21.5,
                warranty: 25,
                score: 95,
                reasons: [
                    'Alta eficiência para máxima geração',
                    'Garantia de 25 anos',
                    'Ideal para sua irradiação solar'
                ],
                badges: ['Premium', 'Alta Eficiência', '25 anos'],
                image: '/images/products/panel-450w.jpg'
            },
            {
                id: 'inverter-hybrid-5kw',
                name: 'Inversor Híbrido 5kW',
                type: 'inverter',
                price: 3200,
                efficiency: 97.5,
                warranty: 10,
                score: 92,
                reasons: [
                    'Compatível com baterias',
                    'Monitoramento inteligente',
                    'Eficiência superior a 97%'
                ],
                badges: ['Híbrido', 'Inteligente', '10 anos'],
                image: '/images/products/inverter-5kw.jpg'
            },
            {
                id: 'kit-residential-3kw',
                name: 'Kit Residencial 3kW Completo',
                type: 'kit',
                price: 18500,
                efficiency: 20.8,
                warranty: 25,
                score: 88,
                reasons: [
                    'Sistema completo plug & play',
                    'Instalação profissional incluída',
                    'Economia de R$ 280/mês'
                ],
                badges: ['Completo', 'Instalação', '25 anos'],
                image: '/images/products/kit-3kw.jpg'
            },
            {
                id: 'battery-5kwh',
                name: 'Bateria 5kWh Li-ion',
                type: 'battery',
                price: 4800,
                efficiency: 95,
                warranty: 10,
                score: 90,
                reasons: [
                    'Armazenamento para energia noturna',
                    'Tecnologia Li-ion de longa duração',
                    'Integração perfeita com inversor'
                ],
                badges: ['Li-ion', '5kWh', '10 anos'],
                image: '/images/products/battery-5kwh.jpg'
            }
        ]

        // Apply user profile filters
        let filtered = baseRecommendations

        if (userProfile.preferences?.budget) {
            filtered = filtered.filter(r => r.price <= userProfile.preferences!.budget! * 1.2)
        }

        if (userProfile.preferences?.priority === 'sustainability') {
            filtered = filtered.sort((a, b) => b.efficiency - a.efficiency)
        }

        if (userProfile.consumption?.monthly_kwh) {
            // Adjust recommendations based on consumption
            const estimatedKwp = userProfile.consumption.monthly_kwh / 120 // Rough estimate
            filtered = filtered.filter(r =>
                r.type === 'kit' ? Math.abs((r.price / 6000) - estimatedKwp) < 1 : true
            )
        }

        // Sort by score and limit
        return filtered
            .sort((a, b) => b.score - a.score)
            .slice(0, maxRecommendations)
    }, [userProfile, maxRecommendations])

    useEffect(() => {
        const loadRecommendations = async () => {
            setIsLoading(true)

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            setRecommendations(generateRecommendations)
            setIsLoading(false)

            sendEvent?.('recommendations_loaded', {
                count: generateRecommendations.length,
                user_profile_complete: Object.keys(userProfile).length > 0
            })
        }

        loadRecommendations()
    }, [generateRecommendations, userProfile])

    const filteredRecommendations = recommendations.filter(r => {
        if (selectedCategory === 'all') return true
        if (selectedCategory === 'panels') return r.type === 'panel'
        if (selectedCategory === 'inverters') return r.type === 'inverter'
        if (selectedCategory === 'kits') return r.type === 'kit'
        return true
    })

    const handleProductClick = (product: ProductRecommendation) => {
        sendEvent?.('product_recommended_clicked', {
            product_id: product.id,
            product_type: product.type,
            score: product.score,
            position: recommendations.indexOf(product) + 1
        })
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analisando seu perfil para recomendações personalizadas...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }, (_, i) => (
                        <Card key={i} className="p-4 animate-pulse">
                            <div className="h-32 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4"
                >
                    <Award className="w-4 h-4" />
                    Recomendações Personalizadas
                </motion.div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Produtos Ideais Para Você
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Baseado no seu perfil e necessidades, selecionamos os melhores produtos
                    com as melhores condições do mercado.
                </p>
            </div>

            {/* Category Filter */}
            <div className="flex justify-center">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                    {[
                        { id: 'all', label: 'Todos', count: recommendations.length },
                        { id: 'panels', label: 'Painéis', count: recommendations.filter(r => r.type === 'panel').length },
                        { id: 'inverters', label: 'Inversores', count: recommendations.filter(r => r.type === 'inverter').length },
                        { id: 'kits', label: 'Kits', count: recommendations.filter(r => r.type === 'kit').length },
                    ].map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id as any)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedCategory === category.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {category.label} ({category.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Recommendations Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredRecommendations.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                                {/* Product Image */}
                                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-6xl opacity-20">
                                            {product.type === 'panel' && '☀️'}
                                            {product.type === 'inverter' && '⚡'}
                                            {product.type === 'battery' && '🔋'}
                                            {product.type === 'kit' && '📦'}
                                        </div>
                                    </div>

                                    {/* Score Badge */}
                                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                        {product.score}% Match
                                    </div>

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                        {product.badges.slice(0, 2).map(badge => (
                                            <span
                                                key={badge}
                                                className="bg-white/90 text-gray-700 px-2 py-1 rounded text-xs font-medium"
                                            >
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </h3>

                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="text-2xl font-bold text-green-600">
                                            R$ {product.price.toLocaleString('pt-BR')}
                                        </div>
                                        {product.efficiency && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Zap className="w-4 h-4" />
                                                {product.efficiency}%
                                            </div>
                                        )}
                                    </div>

                                    {/* Reasons */}
                                    <ul className="space-y-1 mb-4">
                                        {product.reasons.slice(0, 2).map((reason, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Link href={`/products/${product.id}`}>
                                        <Button
                                            onClick={() => handleProductClick(product)}
                                            className="w-full group-hover:scale-105 transition-transform"
                                        >
                                            Ver Detalhes
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Why These Recommendations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center"
            >
                <div className="max-w-3xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Por que essas recomendações?
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Análise Técnica</h4>
                            <p className="text-sm text-gray-600">
                                Consideramos dados solares da sua região, eficiência dos produtos e compatibilidade técnica.
                            </p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Perfil do Usuário</h4>
                            <p className="text-sm text-gray-600">
                                Analisamos seu consumo, orçamento e preferências para encontrar a melhor combinação.
                            </p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Qualidade Garantida</h4>
                            <p className="text-sm text-gray-600">
                                Apenas produtos certificados, com garantia e das melhores marcas do mercado.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

// Hook for using recommendations in other components
export function useRecommendations(userProfile?: Partial<UserProfile>) {
    const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!userProfile) return

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            const mockRecs: ProductRecommendation[] = [
                {
                    id: 'premium-kit',
                    name: 'Kit Solar Premium 5kW',
                    type: 'kit',
                    price: 28500,
                    efficiency: 21.2,
                    warranty: 25,
                    score: 96,
                    reasons: ['Máxima eficiência', 'Garantia estendida', 'Instalação incluída'],
                    badges: ['Premium', 'Completo'],
                    image: '/images/products/kit-5kw.jpg'
                }
            ]

            setRecommendations(mockRecs)
            setIsLoading(false)
        }, 500)
    }, [userProfile])

    return { recommendations, isLoading }
}