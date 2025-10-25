import { z } from "zod";

export const solarProjectMetadataSchema = z.object({
    solar_capacity_kw: z.number().min(0).optional(),
    solar_roi_percentage: z.number().min(0).max(100).optional(),
    project_stage: z.enum([
        "consultation",
        "design",
        "permitting",
        "installation",
        "commissioning",
        "completed"
    ]).optional(),
    installation_address: z.string().optional(),
    expected_completion_date: z.string().datetime().optional(),
    monitoring_subscription_id: z.string().optional(),
});

export type SolarProjectMetadata = z.infer<typeof solarProjectMetadataSchema>;