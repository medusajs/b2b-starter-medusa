"use client"

import { t, getCopyNamespace } from "@/lib/i18n/copy"
import { sendEvent } from "@/modules/analytics/events"

export default function VideosStrip() {
  const videos = getCopyNamespace("videos") as Record<string, { src: string; alt: string; caption: string; poster?: string }>
  const keys = ["amazonia", "condominio", "pousada", "rural"].filter((k) => videos[k])

  return (
    <section className="bg-gradient-to-br from-white via-gray-50 to-slate-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 py-24">
      <div className="content-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-zinc-800 mb-6">
            <span className="text-2xl">🎥</span>
            <span className="text-gray-900 font-semibold">Histórias reais</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-zinc-50 mb-4">
            Energia limpa em
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ação
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-zinc-300 max-w-2xl mx-auto">
            Conheça projetos reais de energia solar sustentável
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {keys.map((k) => {
            const v = videos[k]
            return (
              <figure key={k} className="group">
                <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <video
                    src={v.src}
                    className="w-full aspect-video object-cover"
                    loop
                    autoPlay
                    muted
                    playsInline
                    preload="metadata"
                    poster={v.poster || "/opengraph-image.jpg"}
                    onPlay={() => sendEvent("copy_rendered", { component: `video_${k}`, key: `videos.${k}.caption` })}
                    aria-label={v.alt}
                  />
                  <div className="p-6">
                    <figcaption className="text-lg font-semibold text-gray-900 dark:text-zinc-50 group-hover:text-yellow-600 transition-colors">
                      {v.caption}
                    </figcaption>
                  </div>
                </div>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
