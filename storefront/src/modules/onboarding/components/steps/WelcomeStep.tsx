'use client'

/**
 * WelcomeStep Component
 * 
 * Tela de boas-vindas com HÉLIO EM DESTAQUE
 * Vídeo animado do Hélio como protagonista da experiência
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Sun, TrendingDown } from 'lucide-react'
import HelioVideo from '../HelioVideo'

interface WelcomeStepProps {
  onContinue: () => void
  onSkip?: () => void
}

export default function WelcomeStep({ onContinue, onSkip }: WelcomeStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Hélio Video (DESTAQUE PRINCIPAL) */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-white/30 rounded-3xl blur-3xl"></div>
              
              {/* Video Container */}
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <HelioVideo
                  variant="welcome"
                  autoPlay={true}
                  loop={true}
                  showControls={true}
                />
                
                {/* Hélio Speech Bubble */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 max-w-xs animate-bounce">
                  <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white transform rotate-45"></div>
                  <p className="text-sm font-medium text-gray-800">
                    Olá! Eu sou o Hélio, vou te ajudar a encontrar o sistema solar perfeito! ☀️
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="order-1 lg:order-2 text-white space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Bem-vindo à<br />
                <span className="text-yellow-200">YSH Solar</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-yellow-100 font-light">
                Transforme energia solar em economia real para seu negócio
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Zap className="h-6 w-6 text-yellow-200" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Rápido e Fácil</p>
                  <p className="text-yellow-100 text-sm">Apenas 3 minutos para seu orçamento</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sun className="h-6 w-6 text-yellow-200" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Sistema Personalizado</p>
                  <p className="text-yellow-100 text-sm">Calculado especialmente para você</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <TrendingDown className="h-6 w-6 text-yellow-200" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Economia Garantida</p>
                  <p className="text-yellow-100 text-sm">Reduza até 95% na conta de luz</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={onContinue}
                size="large"
                className="w-full bg-white text-orange-600 hover:bg-yellow-100 text-lg font-semibold py-6 shadow-xl"
              >
                Começar Agora com o Hélio
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              {onSkip && (
                <button
                  onClick={onSkip}
                  className="w-full text-white/80 hover:text-white text-sm py-2 transition-colors"
                >
                  Já tenho conta, fazer login
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 pt-4 text-yellow-100 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-bold text-2xl">4.9</span>
                <span>★★★★★</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div>
                <span className="font-semibold">500+</span> clientes atendidos
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div>
                <span className="font-semibold">15 anos</span> de experiência
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center text-white/70 text-sm">
          <p>
            🔒 Seus dados estão seguros conosco • 
            ⚡ Processo 100% online • 
            🎯 Sem compromisso
          </p>
        </div>
      </div>
    </div>
  )
}
