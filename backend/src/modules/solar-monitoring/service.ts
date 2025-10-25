import { MedusaService } from "@medusajs/framework/utils";
import { MonitoringSubscription } from "./models";

class SolarMonitoringModuleService extends MedusaService({
    MonitoringSubscription,
}) {
    // Criar assinatura de monitoramento
    async createMonitoringSubscription(data: {
        customer_id: string;
        system_id: string;
        plan?: "basic" | "advanced" | "enterprise";
        monitoring_frequency?: "hourly" | "daily" | "realtime";
        monthly_fee: number;
        order_id?: string;
        metadata?: Record<string, any>;
    }) {
        const subscriptionData = {
            ...data,
            plan: data.plan || "basic",
            monitoring_frequency: data.monitoring_frequency || "daily",
            status: "active" as const,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const [subscription] = await this.createMonitoringSubscriptions([subscriptionData]);
        return subscription;
    }

    // Buscar assinaturas ativas por cliente
    async getActiveSubscriptionsByCustomer(customerId: string) {
        return await this.listMonitoringSubscriptions({
            customer_id: customerId,
            status: "active",
        });
    }

    // Buscar assinatura por system_id
    async getSubscriptionBySystemId(systemId: string) {
        const subscriptions = await this.listMonitoringSubscriptions({
            system_id: systemId,
            status: "active",
        });
        return subscriptions[0] || null;
    }

    // Suspender assinatura
    async suspendSubscription(subscriptionId: string) {
        await this.updateMonitoringSubscriptions(
            { status: "suspended" },
            { where: { id: subscriptionId } }
        );
    }

    // Reativar assinatura
    async reactivateSubscription(subscriptionId: string) {
        await this.updateMonitoringSubscriptions(
            { status: "active" },
            { where: { id: subscriptionId } }
        );
    }

    // Cancelar assinatura
    async cancelSubscription(subscriptionId: string) {
        await this.updateMonitoringSubscriptions(
            { status: "cancelled" },
            { where: { id: subscriptionId } }
        );
    }

    // Calcular receita mensal recorrente (MRR)
    async calculateMRR() {
        const activeSubscriptions = await this.listMonitoringSubscriptions({
            status: "active",
        });

        return activeSubscriptions.reduce((total, sub) => {
            return total + Number(sub.monthly_fee);
        }, 0);
    }

    // Buscar sistemas que precisam de manutenção preventiva
    async getSystemsNeedingMaintenance() {
        // Simulação - em produção isso viria de dados reais de monitoramento
        const subscriptions = await this.listMonitoringSubscriptions({
            status: "active",
        });

        return subscriptions.filter(sub => {
            // Lógica para identificar sistemas que precisam manutenção
            // Baseado em metadata ou dados externos
            const lastMaintenance = sub.metadata?.last_maintenance;
            if (!lastMaintenance) return true;

            const lastMaintenanceDate = new Date(lastMaintenance as string);
            const daysSinceMaintenance = (Date.now() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceMaintenance > 180; // 6 meses
        });
    }
}

export default SolarMonitoringModuleService;