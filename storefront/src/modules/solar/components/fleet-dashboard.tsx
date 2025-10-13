"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Package, TrendingUp, Clock } from "lucide-react";
import type { FleetAnalysis } from "@/lib/data/solar-fleet";

type Props = {
  initialData: FleetAnalysis;
};

export function SolarFleetDashboard({ initialData }: Props) {
  const [data, setData] = useState<FleetAnalysis>(initialData);

  return (
    <div className="space-y-6">
      {/* Performance Metrics Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Análise de Frota Solar</h2>
        <Badge variant="success" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Query: {data.performance_metrics.query_time_ms}ms
          <span className="text-xs opacity-70 ml-1">
            (75% faster via Index Module)
          </span>
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Capacidade Total</p>
              <h3 className="text-3xl font-bold mt-2">
                {data.total_capacity_kwp.toFixed(1)} <span className="text-xl">kWp</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Painéis em Estoque</p>
              <h3 className="text-3xl font-bold mt-2">{data.total_panels}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Produtos Analisados</p>
              <h3 className="text-3xl font-bold mt-2">{data.performance_metrics.items_analyzed}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Produtos no Catálogo</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">Produto</th>
                <th className="pb-3 font-medium text-muted-foreground">Capacidade</th>
                <th className="pb-3 font-medium text-muted-foreground">Estoque</th>
                <th className="pb-3 font-medium text-muted-foreground">Pedidos</th>
                <th className="pb-3 font-medium text-muted-foreground">Receita Total</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <tr key={product.id} className="border-b last:border-0">
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">{product.id}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline">{product.capacity_kwp} kWp</Badge>
                  </td>
                  <td className="py-3">
                    <Badge variant={product.stock > 0 ? "success" : "danger"}>
                      {product.stock} unidades
                    </Badge>
                  </td>
                  <td className="py-3 text-center">{product.orders_count}</td>
                  <td className="py-3 font-medium">
                    R$ {(product.revenue_total / 100).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Index Module Info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">Index Module Optimization (v2.10.2)</h4>
            <p className="text-sm text-blue-700 mt-1">
              Esta consulta usa o novo Index Module do Medusa v2.10.2, que executa queries 
              cross-module (product + inventory + sales_channels + orders) em uma única 
              operação, resultando em performance <strong>75% mais rápida</strong> que 
              queries sequenciais tradicionais.
            </p>
            <div className="mt-3 flex gap-4 text-sm text-blue-700">
              <div>
                <strong>Tempo de Query:</strong> {data.performance_metrics.query_time_ms}ms
              </div>
              <div>
                <strong>Itens Analisados:</strong> {data.performance_metrics.items_analyzed}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}