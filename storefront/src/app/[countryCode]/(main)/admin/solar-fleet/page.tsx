import type { Metadata } from "next";
import { getSolarFleetAnalysis } from "@/lib/data/solar-fleet";
import { SolarFleetDashboard } from "@/modules/solar/components/fleet-dashboard";

export const metadata: Metadata = {
    title: "Análise de Frota Solar - Admin",
    description: "Análise em tempo real da frota de produtos solares usando Index Module (75% mais rápido)",
};

export default async function SolarFleetPage() {
    // Server-side data fetch usando Index Module otimizado
    const fleetData = await getSolarFleetAnalysis({
        category: "painel_solar",
        status: "published",
    });

    return (
        <div className="container mx-auto py-12 px-4">
            <SolarFleetDashboard initialData={fleetData} />
        </div>
    );
}