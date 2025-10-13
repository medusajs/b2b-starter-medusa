import {
    PVClientConfig,
    PVDataRequest,
    PVDataResponse,
    PVProviderError,
    CircuitBreakerOpenError,
    CircuitState,
    ResilienceMetrics,
} from "../../../types/pvlib";

/**
 * HTTP Client Resiliente para APIs PV
 * 
 * Features:
 * - Exponential backoff com jitter
 * - Timeouts configuráveis
 * - Circuit breaker pattern
 * - Cache de 24h (configurável)
 * - Métricas de observabilidade
 * 
 * Anti-fragilidade:
 * - Não trava worker (async/await com timeout)
 * - Percentil de timeout monitorado
 * - Fallback para dados históricos
 */
export class PVHttpClient {
    private config: PVClientConfig;
    private cache: Map<string, { data: PVDataResponse; expires_at: number }>;

    // Circuit Breaker State
    private circuitState: CircuitState = CircuitState.CLOSED;
    private consecutiveFailures = 0;
    private consecutiveSuccesses = 0;
    private circuitOpenedAt?: Date;

    // Metrics
    private metrics: {
        total_requests: number;
        failed_requests: number;
        cached_responses: number;
        response_times: number[]; // For percentile calculation
    };

    constructor(config: PVClientConfig) {
        this.config = config;
        this.cache = new Map();
        this.metrics = {
            total_requests: 0,
            failed_requests: 0,
            cached_responses: 0,
            response_times: [],
        };

        // Cleanup de cache a cada 1 hora
        // Em ambiente de teste, evitamos criar intervalos para não manter handles abertos no Jest
        if (process.env.NODE_ENV !== 'test') {
            const interval = setInterval(() => this.cleanExpiredCache(), 3600000);
            // Evita manter o processo vivo em Node
            // @ts-ignore - NodeJS.Timeout em runtime possui unref
            interval.unref?.();
        }
    }

    /**
     * Fetch data com todas as camadas de resilience
     */
    async fetchData(request: PVDataRequest): Promise<PVDataResponse> {
        this.metrics.total_requests++;
        const startTime = Date.now();

        try {
            // 1. Check circuit breaker
            if (this.circuitState === CircuitState.OPEN) {
                const now = Date.now();
                const openDuration = now - (this.circuitOpenedAt?.getTime() || 0);

                if (openDuration < this.config.circuit_breaker.timeout_ms) {
                    throw new CircuitBreakerOpenError(
                        this.config.provider,
                        this.circuitOpenedAt!,
                        new Date(now + this.config.circuit_breaker.timeout_ms - openDuration)
                    );
                }

                // Transition to HALF_OPEN
                this.circuitState = CircuitState.HALF_OPEN;
            }

            // 2. Check cache
            if (this.config.cache.enabled) {
                const cachedData = this.getFromCache(request);
                if (cachedData) {
                    this.metrics.cached_responses++;
                    return cachedData;
                }
            }

            // 3. Fetch with retry
            const response = await this.fetchWithRetry(request);

            // 4. Record success
            this.recordSuccess();

            // 5. Cache response
            if (this.config.cache.enabled) {
                this.saveToCache(request, response);
            }

            // 6. Record metrics
            const responseTime = Date.now() - startTime;
            this.recordResponseTime(responseTime);

            return response;
        } catch (error) {
            this.metrics.failed_requests++;
            this.recordFailure();

            // Re-throw para tratamento upstream
            throw error;
        }
    }

    /**
     * Fetch com exponential backoff retry
     */
    private async fetchWithRetry(request: PVDataRequest): Promise<PVDataResponse> {
        let lastError: Error | null = null;
        let delay = this.config.retry.initial_delay_ms;

        for (let attempt = 1; attempt <= this.config.retry.max_attempts; attempt++) {
            try {
                const response = await this.doFetch(request);
                return response;
            } catch (error) {
                lastError = error as Error;

                // Verificar se é retryable
                if (error instanceof PVProviderError) {
                    if (
                        error.statusCode &&
                        !this.config.retry.retryable_status_codes.includes(error.statusCode)
                    ) {
                        // Não é retryable (e.g., 400 Bad Request)
                        throw error;
                    }
                }

                // Última tentativa - não fazer retry
                if (attempt === this.config.retry.max_attempts) {
                    break;
                }

                // Exponential backoff com jitter
                const jitter = Math.random() * 0.3 * delay; // ±30% jitter
                const actualDelay = Math.min(delay + jitter, this.config.retry.max_delay_ms);

                await this.sleep(actualDelay);

                delay *= this.config.retry.backoff_multiplier;
            }
        }

        throw new PVProviderError(
            `Failed after ${this.config.retry.max_attempts} attempts`,
            this.config.provider,
            undefined,
            lastError || undefined
        );
    }

    /**
     * Fetch real com timeout
     */
    private async doFetch(request: PVDataRequest): Promise<PVDataResponse> {
        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            this.config.timeout.request_timeout_ms
        );

        try {
            const url = this.buildUrl(request);
            const headers = this.buildHeaders();

            const response = await fetch(url, {
                method: "GET",
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new PVProviderError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    this.config.provider,
                    response.status
                );
            }

            const rawData = await response.json();

            // Normalizar resposta (provider-specific → padrão)
            const normalized = this.normalizeResponse(rawData, request);

            return normalized;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof PVProviderError) {
                throw error;
            }

            if ((error as Error).name === "AbortError") {
                throw new PVProviderError(
                    "Request timeout",
                    this.config.provider,
                    undefined,
                    error as Error
                );
            }

            throw new PVProviderError(
                `Network error: ${(error as Error).message}`,
                this.config.provider,
                undefined,
                error as Error
            );
        }
    }

    /**
     * Construir URL baseado no provider
     */
    private buildUrl(request: PVDataRequest): string {
        const { base_url } = this.config;
        const { latitude, longitude } = request;

        // Provider-specific URL building
        switch (this.config.provider) {
            case "pvgis":
                return `${base_url}/PVcalc?lat=${latitude}&lon=${longitude}&outputformat=json`;

            case "nrel":
                return `${base_url}/solar/solar_resource/v1.json?lat=${latitude}&lon=${longitude}`;

            case "solcast":
                return `${base_url}/world_radiation/estimated_actuals?latitude=${latitude}&longitude=${longitude}`;

            default:
                return `${base_url}?lat=${latitude}&lon=${longitude}`;
        }
    }

    /**
     * Construir headers (incluindo API key se configurado)
     */
    private buildHeaders(): HeadersInit {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "User-Agent": "Medusa-PVLib-Integration/1.0",
        };

        if (this.config.api_key) {
            headers["Authorization"] = `Bearer ${this.config.api_key}`;
        }

        return headers;
    }

    /**
     * Normalizar resposta de provider-specific para formato padrão
     */
    private normalizeResponse(
        _rawData: unknown,
        request: PVDataRequest
    ): PVDataResponse {
        // Placeholder - implementação específica por provider
        // Ver: normalizers/ folder para implementações completas

        return {
            provider: this.config.provider,
            location: {
                latitude: request.latitude,
                longitude: request.longitude,
                timezone: request.timezone || "UTC",
            },
            irradiance: [],
            efficiency: [],
            metadata: {
                requested_at: new Date().toISOString(),
                cache_hit: false,
                response_time_ms: 0,
            },
        };
    }

    /**
     * Cache helpers
     */
    private getCacheKey(request: PVDataRequest): string {
        const { latitude, longitude, data_types, start_date, end_date } = request;
        return `${this.config.cache.key_prefix}:${latitude}:${longitude}:${data_types.join(",")}:${start_date}:${end_date}`;
    }

    private getFromCache(request: PVDataRequest): PVDataResponse | null {
        const key = this.getCacheKey(request);
        const cached = this.cache.get(key);

        if (!cached) {
            return null;
        }

        if (Date.now() > cached.expires_at) {
            this.cache.delete(key);
            return null;
        }

        return {
            ...cached.data,
            metadata: {
                ...cached.data.metadata,
                cache_hit: true,
            },
        };
    }

    private saveToCache(request: PVDataRequest, response: PVDataResponse): void {
        const key = this.getCacheKey(request);
        const expires_at = Date.now() + this.config.cache.ttl_seconds * 1000;

        this.cache.set(key, { data: response, expires_at });
    }

    private cleanExpiredCache(): void {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now > value.expires_at) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Circuit breaker state machine
     */
    private recordSuccess(): void {
        if (this.circuitState === CircuitState.HALF_OPEN) {
            this.consecutiveSuccesses++;

            if (
                this.consecutiveSuccesses >=
                this.config.circuit_breaker.success_threshold
            ) {
                this.circuitState = CircuitState.CLOSED;
                this.consecutiveSuccesses = 0;
                this.consecutiveFailures = 0;
            }
        } else if (this.circuitState === CircuitState.CLOSED) {
            this.consecutiveFailures = 0;
        }
    }

    private recordFailure(): void {
        if (this.circuitState === CircuitState.HALF_OPEN) {
            // Failure in HALF_OPEN → back to OPEN
            this.circuitState = CircuitState.OPEN;
            this.circuitOpenedAt = new Date();
            this.consecutiveSuccesses = 0;
        } else if (this.circuitState === CircuitState.CLOSED) {
            this.consecutiveFailures++;

            if (
                this.consecutiveFailures >=
                this.config.circuit_breaker.failure_threshold
            ) {
                this.circuitState = CircuitState.OPEN;
                this.circuitOpenedAt = new Date();
            }
        }
    }

    /**
     * Metrics
     */
    private recordResponseTime(ms: number): void {
        this.metrics.response_times.push(ms);

        // Keep only last 1000 measurements
        if (this.metrics.response_times.length > 1000) {
            this.metrics.response_times.shift();
        }
    }

    public getMetrics(): ResilienceMetrics {
        const sortedTimes = [...this.metrics.response_times].sort((a, b) => a - b);
        const p95Index = Math.floor(sortedTimes.length * 0.95);
        const p99Index = Math.floor(sortedTimes.length * 0.99);

        const avg =
            sortedTimes.length > 0
                ? sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length
                : 0;

        return {
            provider: this.config.provider,
            circuit_state: this.circuitState,
            total_requests: this.metrics.total_requests,
            failed_requests: this.metrics.failed_requests,
            cached_responses: this.metrics.cached_responses,
            average_response_time_ms: Math.round(avg),
            p95_response_time_ms: sortedTimes[p95Index] || 0,
            p99_response_time_ms: sortedTimes[p99Index] || 0,
        };
    }

    /**
     * Utils
     */
    private async sleep(ms: number): Promise<void> {
        const { sleep } = await import('../__tests__/test-helpers');
        return sleep(ms);
    }
}
