import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolarMonitoringDashboard } from "@/modules/solar/components/monitoring-dashboard";
import {
    getCustomerSubscriptions,
    getSystemMonitoringData,
} from "@/lib/data/monitoring";
import { retrieveCustomer } from "@/lib/data/customer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Monitoramento Solar - Minha Conta",
    description: "Acompanhe a geração de energia dos seus sistemas solares em tempo real.",
};

export default async function SolarMonitoringPage() {
  const customer = await retrieveCustomer();

  if (!customer?.id) {
    notFound();
  }

  const subscriptions = await getCustomerSubscriptions(customer.id);    if (subscriptions.length === 0) {
        return (
            <div className="flex flex-col gap-y-8 w-full">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl-semi">Monitoramento Solar</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Nenhum Sistema Monitorado</CardTitle>
                        <CardDescription>
                            Você ainda não possui sistemas solares com monitoramento ativo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Adquira um plano de monitoramento para acompanhar a geração de energia do seu
                                sistema solar em tempo real, receber alertas e ter acesso a relatórios
                                detalhados.
                            </p>
                            <Link href="/solar-calculator">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Calcular Novo Sistema
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Buscar dados de monitoramento para todos os sistemas ativos
    const monitoringDataPromises = subscriptions
        .filter((sub) => sub.status === "active")
        .map((sub) => getSystemMonitoringData(sub.system_id));

    const monitoringDataArray = await Promise.all(monitoringDataPromises);

    return (
        <div className="flex flex-col gap-y-8 w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl-semi">Monitoramento Solar</h1>
                <Link href="/solar-calculator">
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Sistema
                    </Button>
                </Link>
            </div>

            <div className="space-y-8">
                {subscriptions.map((subscription, index) => {
                    const monitoringData = monitoringDataArray[index];

                    if (!monitoringData) {
                        return (
                            <Card key={subscription.id}>
                                <CardHeader>
                                    <CardTitle>Sistema #{subscription.system_id.slice(-8)}</CardTitle>
                                    <CardDescription>
                                        Plano: {subscription.plan.toUpperCase()} | Status:{" "}
                                        {subscription.status}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Dados de monitoramento não disponíveis no momento.
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    }

                    return (
                        <div key={subscription.id}>
                            <SolarMonitoringDashboard
                                systemId={subscription.system_id}
                                initialData={monitoringData}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}