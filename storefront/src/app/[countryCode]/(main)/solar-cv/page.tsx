import { Metadata } from "next"
import SolarCVTools from "@/modules/configuration/solar-cv"

export const metadata: Metadata = {
    title: "Ferramentas de Visão Computacional Solar | Yello Solar Hub",
    description: "Utilize IA avançada para detecção de painéis solares, análise térmica e fotogrametria 3D com o copiloto Hélio.",
}

export default function SolarCVPage() {
    return <SolarCVTools />
}