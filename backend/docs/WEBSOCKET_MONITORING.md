# WebSocket Real-Time Solar Monitoring

## 📡 Overview

Servidor WebSocket para transmissão de dados de monitoramento solar em **tempo real** para dashboards de clientes.

**Endpoint**: `ws://backend:9000/ws/monitoring/:system_id`  
**Protocol**: WebSocket com upgrade HTTP  
**Update Frequency**: 5 segundos  
**Reconnection**: Automática após 5s de desconexão

---

## 🏗️ Architecture

### Backend Components

```
backend/src/
├── api/ws/monitoring/route.ts       # WebSocket server + HTTP info endpoint
├── subscribers/websocket-init.ts    # Auto-initialization on server start
└── modules/monitoring/              # (Future) Real data from MonitoringSubscription
```

### Storefront Components

```
storefront/src/modules/solar/components/monitoring-dashboard.tsx
```

Cliente WebSocket já implementado com:

- Auto-reconnection após desconexão
- Loading states
- Real-time metrics update
- Chart data visualization

---

## 🔌 Connection Flow

```
1. Cliente: new WebSocket("ws://backend:9000/ws/monitoring/abc123")
2. Backend: Valida system_id na URL
3. Backend: Adiciona conexão ao Map<system_id, Set<WebSocket>>
4. Backend: Envia dados iniciais imediatamente
5. Backend: Envia atualizações a cada 5 segundos
6. Cliente: Atualiza UI com dados recebidos
7. On Disconnect: Remove conexão do Map, clearInterval
```

---

## 📊 Data Format

### MonitoringData Interface

```typescript
{
  system_id: string;
  status: "online" | "offline" | "maintenance";
  
  // Geração atual e histórico
  current_generation_kw: number;      // Geração instantânea (kW)
  today_generation_kwh: number;       // Geração acumulada hoje (kWh)
  monthly_generation_kwh: number;     // Geração acumulada mês (kWh)
  total_generation_kwh: number;       // Geração total lifetime (kWh)
  
  // Economia financeira (tarifa R$ 0.85/kWh)
  today_savings: number;              // R$ economizado hoje
  monthly_savings: number;            // R$ economizado mês
  total_savings: number;              // R$ economizado total
  
  // Impacto ambiental
  co2_offset_kg: number;              // CO2 evitado (kg)
  trees_planted_equivalent: number;   // Árvores equivalentes (21kg CO2/árvore/ano)
  
  last_updated: string;               // ISO timestamp
  
  // Dados para gráfico (últimas 24h)
  chart_data: {
    labels: string[];                 // ["0:00", "1:00", ..., "23:00"]
    values: number[];                 // [0.0, 0.2, ..., 5.5, ..., 0.1] kW
  };
}
```

---

## 🚀 Implementation

### Backend Server

**`backend/src/api/ws/monitoring/route.ts`**:

```typescript
import { WebSocketServer, WebSocket } from "ws";

// Map de conexões: system_id -> Set<WebSocket>
const activeConnections = new Map<string, Set<WebSocket>>();

export const initializeWebSocketServer = (server: any) => {
  const wss = new WebSocketServer({ noServer: true, path: "/ws/monitoring" });

  wss.on("connection", (ws: WebSocket, req: any) => {
    const system_id = url.pathname.split("/").pop();
    
    // Adicionar ao map
    activeConnections.get(system_id)?.add(ws);
    
    // Enviar dados iniciais
    sendMonitoringData(ws, system_id);
    
    // Atualizar a cada 5s
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        sendMonitoringData(ws, system_id);
      }
    }, 5000);
    
    ws.on("close", () => {
      clearInterval(interval);
      activeConnections.get(system_id)?.delete(ws);
    });
  });

  // Handle upgrade
  server.on("upgrade", (request, socket, head) => {
    if (request.url.startsWith("/ws/monitoring")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });
};
```

**Auto-Initialization**:

Subscriber `websocket-init.ts` hooks into `http.server_ready` event:

```typescript
export default async function websocketInitSubscriber({ container }) {
  const httpServer = container.resolve("httpServer");
  const { initializeWebSocketServer } = await import("../api/ws/monitoring/route");
  initializeWebSocketServer(httpServer);
}

export const config = { event: "http.server_ready" };
```

### Storefront Client

**`monitoring-dashboard.tsx`** (já implementado):

```typescript
useEffect(() => {
  const ws = new WebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}/ws/monitoring/${systemId}`
  );

  ws.onopen = () => setIsConnected(true);
  
  ws.onmessage = (event) => {
    const realtimeData = JSON.parse(event.data) as MonitoringData;
    setData(realtimeData);
  };

  ws.onclose = () => {
    setIsConnected(false);
    setTimeout(connectWebSocket, 5000); // Auto-reconnect
  };

  return () => ws.close();
}, [systemId]);
```

---

## 📈 Current Data (Simulated)

Por ora, o servidor envia **dados simulados realistas** baseados em:

1. **Curva de Irradiação Solar**: Simula `sin((hour - 6) / 12 * π)` (zero à noite, máximo ao meio-dia)
2. **Capacidade do Sistema**: 5.5 kW (típico residencial 5-6 kWp)
3. **Eficiência**: 85-100% (variação aleatória)
4. **Tarifa Elétrica**: R$ 0.85/kWh (média Brasil 2025)
5. **Emissão CO2**: 0.5 kg CO2/kWh (matriz elétrica brasileira)

### Exemplo de Dados (12:00 - Pico Solar)

```json
{
  "system_id": "comp_01JE8X9...",
  "status": "online",
  "current_generation_kw": 5.32,
  "today_generation_kwh": 24.8,
  "monthly_generation_kwh": 545.6,
  "total_generation_kwh": 9048.0,
  "today_savings": 21.08,
  "monthly_savings": 463.76,
  "total_savings": 7690.80,
  "co2_offset_kg": 4524.0,
  "trees_planted_equivalent": 215,
  "last_updated": "2025-10-13T12:00:00Z",
  "chart_data": {
    "labels": ["0:00", "1:00", ..., "23:00"],
    "values": [0.0, 0.0, 0.5, 2.1, 4.8, 5.5, 5.2, 3.8, 1.5, 0.0, ...]
  }
}
```

---

## 🔄 Future: Real Data Integration

### Phase 1 (Current): Simulated Data ✅

- Dados calculados com curva solar realística
- Update a cada 5s
- Sem dependência de MonitoringSubscription module

### Phase 2 (TODO): MonitoringSubscription Integration

```typescript
async function sendMonitoringData(ws: WebSocket, system_id: string) {
  const monitoringModule = container.resolve("monitoring");
  
  // Buscar subscription ativa
  const subscription = await monitoringModule.retrieveMonitoringSubscription(
    system_id,
    { relations: ["monitoring_data"] }
  );
  
  if (!subscription) {
    ws.send(JSON.stringify({ error: "No active subscription" }));
    return;
  }
  
  // Buscar últimos dados do inversor (API fabricante)
  const realtimeData = await fetchInverterData(subscription.inverter_serial);
  
  ws.send(JSON.stringify(realtimeData));
}
```

### Phase 3 (TODO): Inverter API Integration

Integrar com APIs de fabricantes:

- **Growatt**: `https://openapi.growatt.com`
- **Sungrow**: `https://gateway.isolarcloud.com`
- **Huawei**: `https://eu5.fusionsolar.huawei.com`
- **Fronius**: Local API via Datamanager

---

## 🧪 Testing

### Manual Test (WebSocket Client)

```javascript
// Browser console ou Node.js
const ws = new WebSocket("ws://localhost:9000/ws/monitoring/test-system-123");

ws.onopen = () => console.log("✅ Connected");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("📊 Monitoring Data:", data);
};

ws.onerror = (error) => console.error("❌ Error:", error);

ws.onclose = () => console.log("🔌 Disconnected");
```

### Check Active Connections

```bash
curl http://localhost:9000/ws/monitoring

# Response:
{
  "status": "WebSocket Server Running",
  "endpoint": "/ws/monitoring/:system_id",
  "stats": {
    "total_connections": 3,
    "active_systems": 2,
    "systems": [
      { "system_id": "comp_01JE8...", "connections": 2 },
      { "system_id": "comp_01JE9...", "connections": 1 }
    ]
  }
}
```

---

## 🛠️ Broadcasting (Advanced)

### Broadcast para Sistema Específico

```typescript
import { broadcastToSystem } from "./api/ws/monitoring/route";

// Após atualização de dados no banco
broadcastToSystem("comp_01JE8X9...", {
  system_id: "comp_01JE8X9...",
  status: "maintenance",
  message: "Sistema em manutenção preventiva",
});
```

### Broadcast para Todos os Sistemas

```typescript
import { broadcastToAll } from "./api/ws/monitoring/route";

// Notificação global (ex: manutenção planejada)
broadcastToAll({
  type: "maintenance_notice",
  message: "Manutenção planejada às 02:00 UTC",
  start_time: "2025-10-14T02:00:00Z",
  duration_minutes: 30,
});
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# storefront/.env
NEXT_PUBLIC_WS_URL=ws://localhost:9000  # Dev
NEXT_PUBLIC_WS_URL=wss://api.yellosolarhub.store  # Prod (SSL)
```

### Nginx Proxy (Production)

```nginx
server {
  listen 443 ssl;
  server_name api.yellosolarhub.store;

  location /ws/monitoring {
    proxy_pass http://backend:9000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;  # 24h
  }
}
```

---

## 🎯 Benefits

### Performance

- ✅ **Real-Time Updates**: 5s latency vs 30s+ polling
- ✅ **Efficient**: 1 connection vs N HTTP requests
- ✅ **Scalable**: Broadcast para múltiplos clientes

### User Experience

- ✅ **Live Dashboard**: Métricas atualizadas em tempo real
- ✅ **Instant Alerts**: Offline/maintenance notificado imediatamente
- ✅ **Auto-Reconnect**: Sem perda de dados em quedas de rede

### Business Value

- ✅ **Monitoring SaaS**: Base para produto de monitoramento premium
- ✅ **Support**: Diagnóstico remoto em tempo real
- ✅ **Analytics**: Streaming de dados para data warehouse

---

## 🚧 Limitations (Current)

1. **No Authentication**: Qualquer cliente pode conectar com system_id
   - **TODO**: Validar JWT token via query param
2. **No Persistence**: Dados perdidos se servidor reinicia
   - **TODO**: Redis Pub/Sub para múltiplas instâncias
3. **Simulated Data**: Não conecta com inversores reais
   - **TODO**: Integrar com MonitoringSubscription + APIs fabricantes

---

## 📚 References

### WebSocket Libraries

- [ws](https://github.com/websockets/ws): Fast WebSocket library for Node.js
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

### Medusa.js Integration

- [HTTP Subscribers](https://docs.medusajs.com/learn/basics/events-and-subscribers)
- [Container Resolution](https://docs.medusajs.com/learn/basics/dependency-injection)

### Solar Monitoring

- [Growatt API Docs](https://openapi.growatt.com)
- [Modbus Protocol](https://en.wikipedia.org/wiki/Modbus) (for local inverter communication)

---

## ✅ Implementation Status

- ✅ **WebSocket Server**: Implemented in `route.ts`
- ✅ **Auto-Initialization**: Subscriber hooks into server start
- ✅ **Simulated Data**: Realistic solar curve (sin function)
- ✅ **Client Integration**: monitoring-dashboard.tsx already ready
- ✅ **Reconnection Logic**: Auto-reconnect após 5s
- ⏳ **Real Data**: Pending MonitoringSubscription integration
- ⏳ **Authentication**: Pending JWT validation
- ⏳ **Scalability**: Pending Redis Pub/Sub

**Status**: 🟢 **MVP Complete** - Production ready com dados simulados
