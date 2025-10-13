import { Metadata } from "next";
import { SolarCalculatorForm } from "@/modules/solar/components/calculator-form";

export const metadata: Metadata = {
    title: "Calculadora Solar - Yello Solar Hub",
    description:
        "Calcule o sistema solar ideal para sua casa ou empresa. Descubra quanto você pode economizar com energia solar.",
};

export default async function SolarCalculatorPage() {
    return (
        <div className="content-container py-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Calculadora Solar Yello
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Descubra em minutos o sistema solar ideal para você e quanto pode economizar
                        na sua conta de luz
                    </p>
                </div>

                <SolarCalculatorForm />

                <div className="border-t pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-3xl font-bold text-yellow-600">+5.000</div>
                            <p className="text-sm text-muted-foreground">Sistemas Instalados</p>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-600">R$ 50M+</div>
                            <p className="text-sm text-muted-foreground">Economia Total Gerada</p>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-600">4.5 anos</div>
                            <p className="text-sm text-muted-foreground">Payback Médio</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}