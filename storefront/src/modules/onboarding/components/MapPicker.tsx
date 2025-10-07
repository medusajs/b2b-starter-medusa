"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    maplibregl?: any
    Cesium?: any
  }
}

export default function MapPicker({
  lat,
  lon,
  onChange,
}: {
  lat: number
  lon: number
  onChange: (pos: { lat: number; lon: number }) => void
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [mode3d, setMode3d] = useState(false)
  const [ready2d, setReady2d] = useState(false)
  const [ready3d, setReady3d] = useState(false)
  const cesiumRef = useRef<HTMLDivElement | null>(null)

  // Load MapLibre GL from CDN
  useEffect(() => {
    const cssId = "maplibre-css"
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link")
      link.id = cssId
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css"
      document.head.appendChild(link)
    }
    const jsId = "maplibre-js"
    if (!window.maplibregl && !document.getElementById(jsId)) {
      const script = document.createElement("script")
      script.id = jsId
      script.src = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"
      script.async = true
      script.onload = () => setReady2d(true)
      document.body.appendChild(script)
    } else {
      setReady2d(!!window.maplibregl)
    }
  }, [])

  // Initialize 2D map
  useEffect(() => {
    if (!ready2d || !mapRef.current || !window.maplibregl) return
    const map = new window.maplibregl.Map({
      container: mapRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [lon || -46.63, lat || -23.55],
      zoom: 9,
    })
    const marker = new window.maplibregl.Marker({ color: "#f59e0b" })
      .setLngLat([lon || -46.63, lat || -23.55])
      .addTo(map)
    map.on("click", (e: any) => {
      const { lng, lat } = e.lngLat
      marker.setLngLat([lng, lat])
      onChange({ lat, lon: lng })
    })
    return () => map.remove()
  }, [ready2d, mapRef.current])

  // Lazy-load Cesium 3D from CDN when toggled
  useEffect(() => {
    if (!mode3d || ready3d) return
    const cssId = "cesium-css"
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link")
      link.id = cssId
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/cesium@1.117.0/Build/Cesium/Widgets/widgets.css"
      document.head.appendChild(link)
    }
    const jsId = "cesium-js"
    if (!window.Cesium && !document.getElementById(jsId)) {
      ;(window as any).CESIUM_BASE_URL = "https://unpkg.com/cesium@1.117.0/Build/Cesium/"
      const script = document.createElement("script")
      script.id = jsId
      script.src = "https://unpkg.com/cesium@1.117.0/Build/Cesium/Cesium.js"
      script.async = true
      script.onload = () => setReady3d(true)
      document.body.appendChild(script)
    } else {
      setReady3d(!!window.Cesium)
    }
  }, [mode3d])

  // Initialize Cesium when ready
  useEffect(() => {
    if (!mode3d || !ready3d || !cesiumRef.current || !window.Cesium) return
    const Cesium = window.Cesium
    const viewer = new Cesium.Viewer(cesiumRef.current, {
      timeline: false,
      animation: false,
      geocoder: false,
      baseLayerPicker: true,
    })
    viewer.scene.globe.depthTestAgainstTerrain = true
    const pinBuilder = new Cesium.PinBuilder()
    const pin = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon || -46.63, lat || -23.55),
      billboard: {
        image: pinBuilder.fromColor(Cesium.Color.fromCssColorString("#f59e0b"), 48).toDataURL(),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
    })
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon || -46.63, lat || -23.55, 800000.0),
    })
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((click: any) => {
      const pos = viewer.camera.pickEllipsoid(click.position)
      if (!pos) return
      const carto = Cesium.Cartographic.fromCartesian(pos)
      const latDeg = Cesium.Math.toDegrees(carto.latitude)
      const lonDeg = Cesium.Math.toDegrees(carto.longitude)
      pin.position = Cesium.Cartesian3.fromDegrees(lonDeg, latDeg)
      onChange({ lat: latDeg, lon: lonDeg })
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    return () => {
      handler.destroy()
      viewer.destroy()
    }
  }, [mode3d, ready3d, cesiumRef.current])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Clique no mapa para escolher o ponto</span>
        <button
          type="button"
          className="text-xs px-3 py-1 rounded-full border border-[var(--border)] hover:bg-zinc-100 dark:hover:bg-zinc-900"
          onClick={() => setMode3d((v) => !v)}
        >
          {mode3d ? "Usar mapa 2D" : "Usar globo 3D (Cesium)"}
        </button>
      </div>
      {!mode3d && (
        <div ref={mapRef} style={{ width: "100%", height: 320, borderRadius: 12, overflow: "hidden" }} className="border border-[var(--border)]" />
      )}
      {mode3d && (
        <div ref={cesiumRef} style={{ width: "100%", height: 320 }} className="border border-[var(--border)] rounded-xl overflow-hidden" />
      )}
    </div>
  )
}

