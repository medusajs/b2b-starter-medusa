import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // View configuration para Orders com campos solares
    const viewConfig = {
        id: "solar-projects",
        name: "Solar Projects",
        entity: "orders",
        fields: [
            // Campos padrão do Order
            "id",
            "status",
            "created_at",
            "updated_at",
            "total",
            "currency_code",

            // Relacionamentos
            "customer.id",
            "customer.email",
            "customer.first_name",
            "customer.last_name",

            // Campos solares customizados via metadata
            "metadata.solar_capacity_kw",
            "metadata.solar_roi_percentage",
            "metadata.project_stage",
            "metadata.installation_address",
            "metadata.expected_completion_date",
            "metadata.monitoring_subscription_id",

            // Items do pedido (produtos solares)
            "items.id",
            "items.title",
            "items.quantity",
            "items.unit_price",
            "items.total",
            "items.metadata.product_type",
            "items.metadata.solar_specs",
        ],
        filters: [
            {
                key: "project_stage",
                label: "Project Stage",
                type: "select",
                options: [
                    { value: "consultation", label: "Consultation" },
                    { value: "design", label: "Design" },
                    { value: "permitting", label: "Permitting" },
                    { value: "installation", label: "Installation" },
                    { value: "commissioning", label: "Commissioning" },
                    { value: "completed", label: "Completed" },
                ],
            },
            {
                key: "solar_capacity_kw",
                label: "Solar Capacity (kW)",
                type: "range",
                min: 0,
                max: 100,
            },
            {
                key: "has_monitoring",
                label: "Has Monitoring",
                type: "boolean",
            },
        ],
        sorting: [
            { key: "created_at", label: "Created Date", default: "desc" },
            { key: "total", label: "Total Value" },
            { key: "metadata.solar_capacity_kw", label: "Solar Capacity" },
            { key: "metadata.expected_completion_date", label: "Completion Date" },
        ],
        actions: [
            {
                label: "View Project Details",
                type: "link",
                href: "/admin/orders/{{id}}",
            },
            {
                label: "Update Project Stage",
                type: "action",
                action: "update_project_stage",
            },
            {
                label: "Generate Report",
                type: "action",
                action: "generate_solar_report",
            },
        ],
    };

    res.json({ view_configuration: viewConfig });
};