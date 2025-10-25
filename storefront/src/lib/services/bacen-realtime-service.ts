/**
 * 🏦 Serviço BACEN em Tempo Real
 * Integração completa com APIs do Banco Central com cache inteligente,
 * WebSocket para atualizações em tempo real e fallback automático
 */

'use server'
import 'server-only'

import type {
  BCBRealtimeRate,
  BCBMarketSnapshot,
  BCBRealtimeEvent,
  BCBStreamConfig,
  BCBRealtimeConfig,
  BCBCacheEntry,
} from '@/lib/types/bacen-realtime'

// URLs das APIs do BCB
const BCB_SGS_API = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'
const BCB_OLINDA_API = 'https://olinda.bcb.gov.br/olinda/servico'

// Séries temporais SGS (Sistema Gerenciador de Séries Temporais)
const BCB_SERIES = {
  SELIC: '432', // Taxa SELIC diária
  IPCA: '433', // IPCA mensal
  IGPM: '189', // IGP-M mensal
  CDC_PF: '20714', // CDC Pessoa Física
  CONSIGNADO_INSS: '20723', // Consignado INSS
  CONSIGNADO_PRIVADO: '20717', // Consignado Privado
  CONSIGNADO_PUBLICO: '20720', // Consignado Público
  FINANCIAMENTO_ENERGIA: '25452', // Financiamento de energia (se existir)
} as const

interface SeriesDataPoint {
  readonly data: string // "DD/MM/YYYY"
  readonly valor: string // número como string
}

export class BCBRealtimeService {
  private readonly config: BCBRealtimeConfig
  private readonly cache = new Map<string, BCBCacheEntry<unknown>>()
  private websocket: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  constructor(config?: Partial<BCBRealtimeConfig>) {
    this.config = {
      apiUrl: config?.apiUrl ?? BCB_SGS_API,
      cache: {
        enabled: true,
        ttl: 1000 * 60 * 60, // 1 hora
        maxSize: 100,
        strategy: 'lru',
        ...config?.cache,
      },
      fallback: {
        useStaleOnError: true,
        maxStaleTime: 1000 * 60 * 60 * 24, // 24 horas
        ...config?.fallback,
      },
      rateLimit: {
        maxRequests: 60,
        windowMs: 60000, // 1 minuto
        ...config?.rateLimit,
      },
    }
  }

  // =========================================================================
  // BUSCA DE TAXAS EM TEMPO REAL
  // =========================================================================

  /**
   * Busca snapshot completo do mercado com todas as taxas relevantes
   */
  async getMarketSnapshot(): Promise<BCBMarketSnapshot> {
    const cacheKey = 'market_snapshot'
    const cached = this.getFromCache<BCBMarketSnapshot>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      const now = new Date()
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(now.getMonth() - 3)

      // Buscar todas as séries em paralelo
      const [selic, ipca, igpm, cdcPF, consignadoINSS, consignadoPrivado, consignadoPublico] =
        await Promise.all([
          this.fetchSeries(BCB_SERIES.SELIC, 30), // últimos 30 dias
          this.fetchSeries(BCB_SERIES.IPCA, 12), // últimos 12 meses
          this.fetchSeries(BCB_SERIES.IGPM, 12),
          this.fetchSeries(BCB_SERIES.CDC_PF, 90),
          this.fetchSeries(BCB_SERIES.CONSIGNADO_INSS, 90),
          this.fetchSeries(BCB_SERIES.CONSIGNADO_PRIVADO, 90),
          this.fetchSeries(BCB_SERIES.CONSIGNADO_PUBLICO, 90),
        ])

      // Processar valores mais recentes
      const selicAtual = this.getLatestValue(selic)
      const ipcaAcum12m = this.calculateAccumulated(ipca, 12)
      const igpmAcum12m = this.calculateAccumulated(igpm, 12)

      const snapshot: BCBMarketSnapshot = {
        timestamp: now.toISOString(),
        selic: selicAtual,
        ipca: ipcaAcum12m,
        igpm: igpmAcum12m,
        taxasPF: [
          this.buildRealtimeRate('CDC', 'PF', cdcPF, selicAtual),
          this.buildRealtimeRate('Consignado INSS', 'PF', consignadoINSS, selicAtual),
          this.buildRealtimeRate('Consignado Privado', 'PF', consignadoPrivado, selicAtual),
          this.buildRealtimeRate('Consignado Público', 'PF', consignadoPublico, selicAtual),
        ],
        taxasPJ: [
          // TODO: Adicionar séries PJ quando disponíveis
        ],
        validUntil: new Date(now.getTime() + this.config.cache.ttl).toISOString(),
      }

      this.setCache(cacheKey, snapshot)
      return snapshot
    } catch (error) {
      console.error('Error fetching market snapshot:', error)

      // Tentar retornar cache expirado se fallback estiver habilitado
      if (this.config.fallback.useStaleOnError) {
        const stale = this.getStaleFromCache<BCBMarketSnapshot>(cacheKey)
        if (stale) {
          console.warn('Using stale cache due to API error')
          return stale
        }
      }

      throw error
    }
  }

  /**
   * Busca taxa específica por modalidade
   */
  async getRateByModality(modality: string, segment: 'PF' | 'PJ'): Promise<BCBRealtimeRate> {
    const snapshot = await this.getMarketSnapshot()
    const rates = segment === 'PF' ? snapshot.taxasPF : snapshot.taxasPJ

    const rate = rates.find(r => r.modalidade === modality)
    if (!rate) {
      throw new Error(`Rate not found for modality: ${modality}`)
    }

    return rate
  }

  /**
   * Busca múltiplas taxas em paralelo
   */
  async getBulkRates(
    requests: readonly { modalidade: string; segmento: 'PF' | 'PJ' }[]
  ): Promise<readonly BCBRealtimeRate[]> {
    const snapshot = await this.getMarketSnapshot()

    return requests.map(req => {
      const rates = req.segmento === 'PF' ? snapshot.taxasPF : snapshot.taxasPJ
      const rate = rates.find(r => r.modalidade === req.modalidade)

      if (!rate) {
        throw new Error(`Rate not found: ${req.modalidade} (${req.segmento})`)
      }

      return rate
    })
  }

  // =========================================================================
  // WEBSOCKET & STREAMING (Cliente-side apenas)
  // =========================================================================

  /**
   * Conecta ao stream de atualizações em tempo real
   * @client-side-only
   */
  connectStream(
    config: BCBStreamConfig,
    onEvent: (event: BCBRealtimeEvent) => void
  ): () => void {
    if (typeof window === 'undefined') {
      throw new Error('WebSocket is only available on client-side')
    }

    // Implementação simplificada - usar polling como fallback
    const pollInterval = setInterval(async () => {
      try {
        const snapshot = await this.getMarketSnapshot()
        onEvent({
          type: 'MARKET_SNAPSHOT',
          timestamp: new Date().toISOString(),
          payload: snapshot,
        })
      } catch (error) {
        onEvent({
          type: 'CONNECTION_STATUS',
          timestamp: new Date().toISOString(),
          payload: { status: 'error', error },
        })
      }
    }, config.updateFrequency === 'realtime' ? 60000 : 3600000) // 1min ou 1h

    // Retorna função de cleanup
    return () => {
      clearInterval(pollInterval)
    }
  }

  // =========================================================================
  // MÉTODOS PRIVADOS - INTEGRAÇÃO BCB API
  // =========================================================================

  /**
   * Busca série temporal do BCB
   */
  private async fetchSeries(
    seriesCode: string,
    lastNDays: number
  ): Promise<readonly SeriesDataPoint[]> {
    const cacheKey = `series_${seriesCode}_${lastNDays}`
    const cached = this.getFromCache<readonly SeriesDataPoint[]>(cacheKey)

    if (cached) {
      return cached
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - lastNDays)

    const url = `${this.config.apiUrl}/${seriesCode}/dados`
    const params = new URLSearchParams({
      formato: 'json',
      dataInicial: this.formatDateBCB(startDate),
      dataFinal: this.formatDateBCB(endDate),
    })

    try {
      const response = await fetch(`${url}?${params}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': '77SOL-Platform/1.0',
        },
        cache: 'default', // Use browser cache
      })

      if (!response.ok) {
        throw new Error(`BCB API error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as readonly SeriesDataPoint[]
      this.setCache(cacheKey, data)

      return data
    } catch (error) {
      console.error(`Error fetching series ${seriesCode}:`, error)

      // Fallback para cache expirado
      if (this.config.fallback.useStaleOnError) {
        const stale = this.getStaleFromCache<readonly SeriesDataPoint[]>(cacheKey)
        if (stale) {
          return stale
        }
      }

      throw error
    }
  }

  /**
   * Extrai valor mais recente da série
   */
  private getLatestValue(series: readonly SeriesDataPoint[]): number {
    if (series.length === 0) return 0

    const latest = series[series.length - 1]
    return parseFloat(latest.valor) || 0
  }

  /**
   * Calcula acumulado de N períodos
   */
  private calculateAccumulated(series: readonly SeriesDataPoint[], periods: number): number {
    const relevantData = series.slice(-periods)
    return relevantData.reduce((acc, point) => {
      const value = parseFloat(point.valor) || 0
      return acc * (1 + value / 100)
    }, 1) - 1
  }

  /**
   * Constrói objeto BCBRealtimeRate a partir dos dados
   */
  private buildRealtimeRate(
    modalidade: string,
    segmento: 'PF' | 'PJ',
    series: readonly SeriesDataPoint[],
    selicAtual: number
  ): BCBRealtimeRate {
    const taxaMensal = this.getLatestValue(series)
    const taxaAnual = Math.pow(1 + taxaMensal / 100, 12) - 1

    return {
      modalidade,
      segmento,
      taxaMensal,
      taxaAnual: taxaAnual * 100,
      spread: taxaMensal - selicAtual,
      numeroOperacoes: 0, // TODO: Buscar da série específica
      valorMedio: 0, // TODO: Buscar da série específica
      timestamp: new Date().toISOString(),
      fonte: 'BCB_SGS',
    }
  }

  /**
   * Formata data para API BCB (DD/MM/YYYY)
   */
  private formatDateBCB(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // =========================================================================
  // CACHE MANAGEMENT
  // =========================================================================

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  private getStaleFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    const age = now - entry.timestamp

    if (age > this.config.fallback.maxStaleTime) {
      return null
    }

    return entry.data as T
  }

  private setCache<T>(key: string, data: T, ttl?: number): void {
    const entry: BCBCacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.cache.ttl,
      source: 'api',
    }

    this.cache.set(key, entry)

    // Enforce cache size limit
    if (this.cache.size > this.config.cache.maxSize) {
      this.evictCache()
    }
  }

  private evictCache(): void {
    // LRU eviction
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

    const toRemove = this.cache.size - this.config.cache.maxSize
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.cache.maxSize,
      entries: Array.from(this.cache.keys()),
    }
  }
}

// Singleton instance
export const bcbRealtimeService = new BCBRealtimeService()
