"use client"

import { t, getCopyNamespace } from "@/lib/i18n/copy"
import { sendEvent } from "@/modules/analytics/events"

export default function VideosStrip() {
  const videos = getCopyNamespace("videos") as Record<string, { src: string; alt: string; caption: string; poster?: string }>
  const keys = ["amazonia", "condominio", "pousada", "rural"].filter((k) => videos[k])

  return (
    <section className="content-container py-10">
      <h2 className="text-xl font-semibold mb-4">Histórias de energia limpa</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {keys.map((k) => {
          const v = videos[k]
          return (
            <figure key={k} className="rounded-lg overflow-hidden border border-neutral-200">
              <video
                src={v.src}
                className="w-full aspect-video"
                loop
                autoPlay
                muted
                playsInline
                preload="metadata"
                poster={v.poster || "/opengraph-image.jpg"}
                onPlay={() => sendEvent("copy_rendered", { component: `video_${k}`, key: `videos.${k}.caption` })}
                aria-label={v.alt}
              />
              <figcaption className="p-3 text-sm text-neutral-700">{v.caption}</figcaption>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
