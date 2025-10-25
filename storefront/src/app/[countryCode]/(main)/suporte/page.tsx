import { Metadata } from "next"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Suporte & Especialistas - Yello Solar Hub",
  description: "Fale com um especialista Yello Solar Hub para tirar dúvidas, solicitar proposta e acompanhar seu projeto solar.",
}

export default function SuportePage() {
  return (
    <section className="py-16">
      <div className="content-container grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl p-8 bg-[var(--surface)]/80 border border-[var(--border)] backdrop-blur-sm shadow-lg">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Falar com especialista</h1>
          <p className="text-zinc-600 dark:text-zinc-300 mb-6">
            Tire dúvidas técnicas, entenda modalidades (Lei 14.300) e receba orientação sobre kits, financiamento e homologação.
          </p>
          <ul className="space-y-2 text-zinc-800 dark:text-zinc-200 mb-6">
            <li>• Atendimento em horário comercial (Brasil)</li>
            <li>• Retorno por e-mail/WhatsApp</li>
            <li>• Encaminhamento para instalação/homologação</li>
          </ul>
          <div className="flex gap-3">
            <a className="contrast-btn" href="mailto:suporte@yellosolarhub.com">suporte@yellosolarhub.com</a>
            <a className="contrast-btn" href="https://wa.me/5521968882751" target="_blank" rel="noopener noreferrer">WhatsApp: +55 (21) 96888-2751</a>
            <LocalizedClientLink href="/dimensionamento" className="contrast-btn">Iniciar dimensionamento</LocalizedClientLink>
          </div>
        </div>
        <div className="rounded-2xl p-8 bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 border border-[var(--border)]">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Como ajudamos</h2>
          <p className="text-zinc-700 dark:text-zinc-300">Analisamos seu consumo e telhado, sugerimos kits compatíveis, simulamos economia/ROI e conduzimos a homologação junto à distribuidora.</p>
        </div>
      </div>
    </section>
  )
}

