"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Zap,
  TrendingUp,
  Leaf,
  AlertCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import type { MonitoringData } from "@/lib/data/monitoring";

interface SolarMonitoringDashboardProps {
  systemId: string;
  initialData: MonitoringData;
}

export function SolarMonitoringDashboard({
  systemId,
  initialData,
}: SolarMonitoringDashboardProps) {
  const [data, setData] = useState<MonitoringData>(initialData);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // WebSocket connection para dados em tempo real
    let ws: WebSocket | null = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(
          `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:9000"}/monitoring/${systemId}`
        );

        ws.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          const realtimeData = JSON.parse(event.data) as MonitoringData;
          setData(realtimeData);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
          // Tentar reconectar após 5 segundos
          setTimeout(connectWebSocket, 5000);
        };
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [systemId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Sistema Solar #{systemId.slice(-8)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={data.status === "online" ? "success" : "danger"}
                className={`${getStatusColor(data.status)} text-white`}
              >
                {data.status === "online" ? "Online" : "Offline"}
              </Badge>
              {isConnected && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Tempo Real
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geração Atual</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.current_generation_kw.toFixed(2)} kW</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="inline h-3 w-3 mr-1" />
              Atualizado {new Date(data.last_updated).toLocaleTimeString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geração Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.today_generation_kwh.toFixed(1)} kWh
            </div>
            <p className="text-xs text-green-600 mt-1 font-medium">
              <DollarSign className="inline h-3 w-3" />
              {formatCurrency(data.today_savings)} economizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geração Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.monthly_generation_kwh.toFixed(0)} kWh
            </div>
            <p className="text-xs text-green-600 mt-1 font-medium">
              {formatCurrency(data.monthly_savings)} economizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Evitado</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(data.co2_offset_kg / 1000).toFixed(2)} ton
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              🌳 {data.trees_planted_equivalent} árvores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Geração Últimas 24h */}
      <Card>
        <CardHeader>
          <CardTitle>Geração nas Últimas 24 Horas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-end justify-between gap-1">
            {data.chart_data.values.map((value, index) => {
              const maxValue = Math.max(...data.chart_data.values);
              const heightPercent = (value / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-yellow-500 rounded-t-sm transition-all hover:bg-yellow-600"
                    data-height={heightPercent}
                    title={`${value.toFixed(2)} kW - ${data.chart_data.labels[index]}`}
                  />
                  {index % 4 === 0 && (
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {data.chart_data.labels[index]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Totais */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Totais do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Geração Total</span>
                <span className="font-semibold">
                  {data.total_generation_kwh.toLocaleString("pt-BR")} kWh
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Economia Total</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(data.total_savings)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">CO₂ Evitado (Total)</span>
                <span className="font-semibold">
                  {(data.co2_offset_kg / 1000).toFixed(2)} toneladas
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Status do Sistema</span>
                <Badge variant={data.status === "online" ? "success" : "danger"}>
                  {data.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Última Atualização</span>
                <span className="font-semibold">
                  {new Date(data.last_updated).toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">
                  Árvores Equivalentes
                </span>
                <span className="font-semibold">
                  🌳 {data.trees_planted_equivalent}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline">
            <AlertCircle className="mr-2 h-4 w-4" />
            Relatar Problema
          </Button>
          <Button variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
            Baixar Relatório
          </Button>
          <Button variant="outline">Configurar Alertas</Button>
        </CardContent>
      </Card>
    </div>
  );
}