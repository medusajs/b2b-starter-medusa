/**
 * PVLib Integration Module - Type Definitions
 * 
 * Integração com serviços externos de dados fotovoltaicos:
 * - Irradiância solar (W/m²)
 * - Eficiência de módulos (%)
 * - Dados meteorológicos
 * 
 * Design Principles:
 * - Provider-agnostic: Normaliza dados de múltiplos providers
 * - Unit normalization: Converte todas unidades para padrão SI
 * - Resilience: Circuit breaker, retry, cache
 */

/**
 * Providers suportados
 */
export enum PVDataProvider {
  PVGIS = "pvgis", // EU Joint Research Centre
  NREL = "nrel", // National Renewable Energy Laboratory (US)
  SOLCAST = "solcast", // Solcast API
  METEONORM = "meteonorm", // Meteonorm Database
}

/**
 * Tipos de dados solicitáveis
 */
export enum DataType {
  IRRADIANCE = "irradiance", // Irradiância (W/m²)
  EFFICIENCY = "efficiency", // Eficiência do módulo (%)
  TEMPERATURE = "temperature", // Temperatura ambiente (°C)
  WEATHER = "weather", // Dados meteorológicos completos
}

/**
 * Unidades suportadas (input de providers)
 */
export enum Unit {
  // Irradiância
  W_PER_M2 = "W/m²",
  KW_PER_M2 = "kW/m²",
  MJ_PER_M2 = "MJ/m²",
  
  // Energia
  WH = "Wh",
  KWH = "kWh",
  MWH = "MWh",
  
  // Temperatura
  CELSIUS = "°C",
  FAHRENHEIT = "°F",
  KELVIN = "K",
  
  // Eficiência
  PERCENT = "%",
  DECIMAL = "decimal", // 0.15 instead of 15%
}

/**
 * Configuração de cache
 */
export interface CacheConfig {
  enabled: boolean;
  ttl_seconds: number; // Time-to-live em segundos
  key_prefix: string;
}

/**
 * Configuração de retry
 */
export interface RetryConfig {
  max_attempts: number;
  initial_delay_ms: number;
  max_delay_ms: number;
  backoff_multiplier: number; // Exponential backoff
  retryable_status_codes: number[]; // 429, 503, etc.
}

/**
 * Configuração de timeout
 */
export interface TimeoutConfig {
  connect_timeout_ms: number;
  request_timeout_ms: number;
  total_timeout_ms: number; // Inclui retries
}

/**
 * Configuração de circuit breaker
 */
export interface CircuitBreakerConfig {
  enabled: boolean;
  failure_threshold: number; // Falhas consecutivas para abrir circuito
  success_threshold: number; // Sucessos consecutivos para fechar circuito
  timeout_ms: number; // Tempo em OPEN antes de tentar HALF_OPEN
}

/**
 * Estado do circuit breaker
 */
export enum CircuitState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Rejecting requests
  HALF_OPEN = "half_open", // Testing if service recovered
}

/**
 * Configuração completa do cliente HTTP
 */
export interface PVClientConfig {
  provider: PVDataProvider;
  base_url: string;
  api_key?: string;
  cache: CacheConfig;
  retry: RetryConfig;
  timeout: TimeoutConfig;
  circuit_breaker: CircuitBreakerConfig;
}

/**
 * Requisição normalizada (agnóstica de provider)
 */
export interface PVDataRequest {
  latitude: number;
  longitude: number;
  data_types: DataType[];
  start_date?: string; // ISO 8601
  end_date?: string; // ISO 8601
  timezone?: string; // e.g., "America/Sao_Paulo"
}

/**
 * Resposta normalizada de irradiância
 */
export interface IrradianceData {
  timestamp: string; // ISO 8601
  ghi: number; // Global Horizontal Irradiance (W/m²)
  dni: number; // Direct Normal Irradiance (W/m²)
  dhi: number; // Diffuse Horizontal Irradiance (W/m²)
  unit: Unit.W_PER_M2;
}

/**
 * Resposta normalizada de eficiência
 */
export interface EfficiencyData {
  timestamp: string;
  module_efficiency: number; // % (0-100)
  system_efficiency: number; // % (0-100)
  temperature_coefficient: number; // %/°C
  unit: Unit.PERCENT;
}

/**
 * Resposta normalizada completa
 */
export interface PVDataResponse {
  provider: PVDataProvider;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  irradiance?: IrradianceData[];
  efficiency?: EfficiencyData[];
  metadata: {
    requested_at: string;
    cache_hit: boolean;
    response_time_ms: number;
  };
}

/**
 * Métricas de resilience
 */
export interface ResilienceMetrics {
  provider: PVDataProvider;
  circuit_state: CircuitState;
  total_requests: number;
  failed_requests: number;
  cached_responses: number;
  average_response_time_ms: number;
  p95_response_time_ms: number;
  p99_response_time_ms: number;
  last_failure_at?: string;
  last_success_at?: string;
}

/**
 * Fallback data (quando todos providers falham)
 */
export interface FallbackData {
  used_fallback: true;
  fallback_type: "average" | "interpolated" | "default";
  source_period?: string; // e.g., "last_30_days_average"
  confidence: number; // 0-1
}

/**
 * Erro customizado para falhas de provider
 */
export class PVProviderError extends Error {
  constructor(
    message: string,
    public provider: PVDataProvider,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = "PVProviderError";
  }
}

/**
 * Erro de circuit breaker
 */
export class CircuitBreakerOpenError extends Error {
  constructor(
    public provider: PVDataProvider,
    public openedAt: Date,
    public willRetryAt: Date
  ) {
    super(`Circuit breaker is OPEN for provider ${provider}`);
    this.name = "CircuitBreakerOpenError";
  }
}
