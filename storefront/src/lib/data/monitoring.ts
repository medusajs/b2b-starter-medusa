"use server";
import "server-only";
import { sdk } from "@/lib/config";
import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies";

export type MonitoringSubscription = {
    id: string;
    customer_id: string;
    system_id: string;
    plan: "basic" | "advanced" | "enterprise";
    monitoring_frequency: "hourly" | "daily" | "realtime";
    alerts_enabled: boolean;
    data_retention_days: number;
    monthly_fee: number;
    status: "active" | "suspended" | "cancelled";
    order_id?: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
};

export type MonitoringData = {
    system_id: string;
    current_generation_kw: number;
    today_generation_kwh: number;
    today_savings: number;
    monthly_generation_kwh: number;
    monthly_savings: number;
    total_generation_kwh: number;
    total_savings: number;
    co2_offset_kg: number;
    trees_planted_equivalent: number;
    status: "online" | "offline" | "maintenance";
    last_updated: string;
    chart_data: {
        labels: string[];
        values: number[];
    };
};

export const getCustomerSubscriptions = async (
    customerId: string
): Promise<MonitoringSubscription[]> => {
    const headers = { ...(await getAuthHeaders()) };
    const next = { ...(await getCacheOptions("monitoring-subscriptions")) };

    try {
        const response = await sdk.client.fetch<{ subscriptions: MonitoringSubscription[] }>(
            `/store/monitoring/subscriptions?customer_id=${customerId}`,
            {
                method: "GET",
                headers,
                next,
            }
        );

        return response.subscriptions;
    } catch (error) {
        console.error("Failed to fetch monitoring subscriptions:", error);
        return [];
    }
};

export const getSystemMonitoringData = async (
    systemId: string
): Promise<MonitoringData | null> => {
    const headers = { ...(await getAuthHeaders()) };

    try {
        const response = await sdk.client.fetch<{ monitoring_data: MonitoringData }>(
            `/store/monitoring/systems/${systemId}/data`,
            {
                method: "GET",
                headers,
                next: { revalidate: 300 }, // Cache por 5 minutos
            }
        );

        return response.monitoring_data;
    } catch (error) {
        console.error("Failed to fetch monitoring data:", error);
        return null;
    }
};

export const createMonitoringSubscription = async (data: {
    customer_id: string;
    system_id: string;
    plan: "basic" | "advanced" | "enterprise";
    order_id?: string;
}): Promise<MonitoringSubscription | null> => {
    const headers = { ...(await getAuthHeaders()) };

    try {
        const response = await sdk.client.fetch<{ subscription: MonitoringSubscription }>(
            `/store/monitoring/subscriptions`,
            {
                method: "POST",
                body: JSON.stringify(data),
                headers,
            }
        );

        return response.subscription;
    } catch (error) {
        console.error("Failed to create monitoring subscription:", error);
        return null;
    }
};

export const updateSubscriptionStatus = async (
    subscriptionId: string,
    status: "active" | "suspended" | "cancelled"
): Promise<boolean> => {
    const headers = { ...(await getAuthHeaders()) };

    try {
        await sdk.client.fetch(`/store/monitoring/subscriptions/${subscriptionId}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
            headers,
        });

        return true;
    } catch (error) {
        console.error("Failed to update subscription status:", error);
        return false;
    }
};