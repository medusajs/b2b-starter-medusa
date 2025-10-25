import { model } from "@medusajs/framework/utils";

export const MonitoringSubscription = model.define("monitoring_subscription", {
    id: model
        .id({
            prefix: "monsub",
        })
        .primaryKey(),
    customer_id: model.text(),
    system_id: model.text(),
    plan: model.enum(["basic", "advanced", "enterprise"]).default("basic"),
    monitoring_frequency: model.enum(["hourly", "daily", "realtime"]).default("daily"),
    alerts_enabled: model.boolean().default(true),
    data_retention_days: model.number().default(90),
    monthly_fee: model.bigNumber(),
    status: model.enum(["active", "suspended", "cancelled"]).default("active"),
    // Relacionamento com order original
    order_id: model.text(),
    // Metadata para dados customizados
    metadata: model.json().nullable(),
    created_at: model.dateTime().default(() => new Date()),
    updated_at: model.dateTime().default(() => new Date()),
}).indexes([
    {
        name: "IDX_monitoring_customer",
        on: ["customer_id"],
    },
    {
        name: "IDX_monitoring_system",
        on: ["system_id"],
    },
    {
        name: "IDX_monitoring_order",
        on: ["order_id"],
    },
    {
        name: "IDX_monitoring_status",
        on: ["status"],
    },
]);