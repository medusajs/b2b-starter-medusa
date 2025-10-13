/**
 * WebSocket Server for Real-Time Solar Monitoring
 * 
 * Endpoint: ws://backend:9000/ws/monitoring/:system_id
 * Protocol: WebSocket upgrade com autenticação via query param
 * 
 * Envia métricas de geração solar em tempo real para clientes conectados.
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { WebSocketServer, WebSocket } from "ws";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// Store WebSocket server instance globally
let wss: WebSocketServer | null = null;

// Map de conexões ativas: system_id -> Set<WebSocket>
const activeConnections = new Map<string, Set<WebSocket>>();

/**
 * GET handler - Retorna informações sobre conexões ativas
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const stats = {
        total_connections: Array.from(activeConnections.values()).reduce(
            (acc, set) => acc + set.size,
            0
        ),
        active_systems: activeConnections.size,
        systems: Array.from(activeConnections.keys()).map((system_id) => ({
            system_id,
            connections: activeConnections.get(system_id)?.size || 0,
        })),
    };

    res.json({
        status: "WebSocket Server Running",
        endpoint: "/ws/monitoring/:system_id",
        stats,
    });
};

/**
 * Inicializa servidor WebSocket (chamado pelo Medusa na inicialização)
 */
export const initializeWebSocketServer = (server: any) => {
    if (wss) {
        console.log("WebSocket server already initialized");
        return wss;
    }

    wss = new WebSocketServer({
        noServer: true,
        path: "/ws/monitoring",
    });

    wss.on("connection", (ws: WebSocket, req: any) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const system_id = url.pathname.split("/").pop();

        if (!system_id || system_id === "monitoring") {
            ws.close(1008, "Missing system_id in URL");
            return;
        }

        console.log(`[WebSocket] New connection for system: ${system_id}`);

        // Adicionar conexão ao map
        if (!activeConnections.has(system_id)) {
            activeConnections.set(system_id, new Set());
        }
        activeConnections.get(system_id)?.add(ws);

        // Enviar dados iniciais
        sendMonitoringData(ws, system_id);

        // Enviar atualizações a cada 5 segundos
        const interval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                sendMonitoringData(ws, system_id);
            }
        }, 5000);

        ws.on("close", () => {
            console.log(`[WebSocket] Connection closed for system: ${system_id}`);
            clearInterval(interval);
            activeConnections.get(system_id)?.delete(ws);
            if (activeConnections.get(system_id)?.size === 0) {
                activeConnections.delete(system_id);
            }
        });

        ws.on("error", (error) => {
            console.error(`[WebSocket] Error for system ${system_id}:`, error);
            clearInterval(interval);
        });
    });

    // Handle WebSocket upgrade
    server.on("upgrade", (request: any, socket: any, head: any) => {
        const url = new URL(request.url, `http://${request.headers.host}`);

        if (url.pathname.startsWith("/ws/monitoring")) {
            wss?.handleUpgrade(request, socket, head, (ws) => {
                wss?.emit("connection", ws, request);
            });
        } else {
            socket.destroy();
        }
    });

    console.log("[WebSocket] Server initialized on /ws/monitoring");
    return wss;
};

/**
 * Envia dados de monitoramento para um cliente WebSocket
 */
async function sendMonitoringData(ws: WebSocket, system_id: string) {
    try {
        // TODO: Substituir por dados reais do MonitoringSubscription module
        // Por ora, gerar dados simulados realistas

        const now = new Date();
        const hour = now.getHours();

        // Simular curva de geração solar (0 à noite, máximo ao meio-dia)
        const sunIntensity = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
        const baseGeneration = 5.5; // 5.5 kW sistema
        const currentGeneration = baseGeneration * sunIntensity * (0.85 + Math.random() * 0.15);

        // Calcular geração do dia (acumulado até agora)
        const todayGeneration = currentGeneration * (hour - 6) * 0.8; // Aproximação

        // Dados de monitoramento
        const monitoringData = {
            system_id,
            status: "online",
            current_generation_kw: Math.max(0, currentGeneration),
            today_generation_kwh: Math.max(0, todayGeneration),
            monthly_generation_kwh: todayGeneration * 22, // ~22 dias úteis
            total_generation_kwh: todayGeneration * 365, // Simulação anual

            // Cálculos financeiros (tarifa média R$ 0.85/kWh)
            today_savings: Math.max(0, todayGeneration) * 0.85,
            monthly_savings: todayGeneration * 22 * 0.85,
            total_savings: todayGeneration * 365 * 0.85,

            // Impacto ambiental (0.5 kg CO2/kWh no Brasil)
            co2_offset_kg: todayGeneration * 365 * 0.5,
            trees_planted_equivalent: Math.floor(todayGeneration * 365 * 0.5 / 21), // 21kg CO2/árvore/ano

            last_updated: now.toISOString(),

            // Dados para gráfico (últimas 24h)
            chart_data: {
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                values: Array.from({ length: 24 }, (_, i) => {
                    const hourIntensity = Math.max(0, Math.sin(((i - 6) / 12) * Math.PI));
                    return baseGeneration * hourIntensity * (0.85 + Math.random() * 0.15);
                }),
            },
        };

        ws.send(JSON.stringify(monitoringData));
    } catch (error) {
        console.error(`[WebSocket] Error sending data for ${system_id}:`, error);
    }
}

/**
 * Broadcast para todos os clientes de um sistema específico
 */
export function broadcastToSystem(system_id: string, data: any) {
    const connections = activeConnections.get(system_id);
    if (!connections) return;

    const message = JSON.stringify(data);
    connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
}

/**
 * Broadcast para todos os sistemas
 */
export function broadcastToAll(data: any) {
    const message = JSON.stringify(data);
    activeConnections.forEach((connections) => {
        connections.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            }
        });
    });
}
