"use client"

import { useState } from "react"
import { Heading, Text } from "@medusajs/ui"
import { sendEvent } from "@/modules/analytics/events"

interface VideoContent {
    id: string
    title: string
    description: string
    thumbnail: string
    videoUrl: string
    duration: string
    classe: string
    classeLabel: string
}

const VIDEOS_BY_CLASS: VideoContent[] = [
    {
        id: "residencial-intro",
        title: "Energia Solar Residencial: Comece a Economizar",
        description: "Descubra como sistemas on-grid reduzem sua conta de luz em até 95%. Ideal para residências classe B1.",
        thumbnail: "/videos/thumbnails/residencial-b1.jpg",
        videoUrl: "https://www.youtube.com/embed/VIDEO_ID_RESIDENCIAL",
        duration: "5:30",
        classe: "residencial-b1",
        classeLabel: "Residencial B1",
    },
    {
        id: "rural-autonomia",
        title: "Soluções Off-Grid para Propriedades Rurais",
        description: "Sistema autônomo completo para áreas sem acesso à rede elétrica. Perfeito para classe B2.",
        thumbnail: "/videos/thumbnails/rural-b2.jpg",
        videoUrl: "https://www.youtube.com/embed/VIDEO_ID_RURAL",
        duration: "7:15",
        classe: "rural-b2",
        classeLabel: "Rural B2",
    },
    {
        id: "comercial-roi",
        title: "ROI em Energia Solar para Empresas",
        description: "Como empresas PME reduzem custos operacionais e melhoram sustentabilidade com solar B2B.",
        thumbnail: "/videos/thumbnails/comercial-b3.jpg",
        videoUrl: "https://www.youtube.com/embed/VIDEO_ID_COMERCIAL",
        duration: "6:45",
        classe: "comercial-b3",
        classeLabel: "Comercial/PME B3",
    },
    {
        id: "condominios-compartilhada",
        title: "Geração Compartilhada em Condomínios",
        description: "Como condomínios reduzem custos de áreas comuns com energia solar coletiva.",
        thumbnail: "/videos/thumbnails/condominios.jpg",
        videoUrl: "https://www.youtube.com/embed/VIDEO_ID_CONDOMINIOS",
        duration: "5:00",
        classe: "condominios",
        classeLabel: "Condomínios",
    },
    {
        id: "industria-eaas",
        title: "EaaS e PPA: Energia sem Investimento",
        description: "Grandes contas industriais economizam sem capex com modelos de energia como serviço.",
        thumbnail: "/videos/thumbnails/industria.jpg",
        videoUrl: "https://www.youtube.com/embed/VIDEO_ID_INDUSTRIA",
        duration: "8:20",
        classe: "industria",
        classeLabel: "Indústria/Grandes",
    },
]

const CLASS_COLORS: Record<string, string> = {
    "residencial-b1": "from-blue-500 to-blue-600",
    "rural-b2": "from-green-500 to-green-600",
    "comercial-b3": "from-yellow-500 to-yellow-600",
    "condominios": "from-purple-500 to-purple-600",
    "industria": "from-red-500 to-red-600",
}

export default function VideosByClass() {
    const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null)

    const handlePlayVideo = (video: VideoContent) => {
        setSelectedVideo(video)
        sendEvent("video_played", {
            video_id: video.id,
            classe: video.classe,
            title: video.title,
        })
    }

    const handleCloseVideo = () => {
        if (selectedVideo) {
            sendEvent("video_closed", {
                video_id: selectedVideo.id,
                classe: selectedVideo.classe,
            })
        }
        setSelectedVideo(null)
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
            <div className="content-container">
                <div className="text-center mb-12">
                    <Text className="text-blue-600 text-sm uppercase tracking-wider font-semibold mb-2">
                        Aprenda Mais
                    </Text>
                    <Heading level="h2" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Vídeos por Classe Consumidora
                    </Heading>
                    <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Descubra como a energia solar funciona para o seu perfil
                    </Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {VIDEOS_BY_CLASS.map((video) => (
                        <button
                            key={video.id}
                            onClick={() => handlePlayVideo(video)}
                            className="group text-left bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-gray-200 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-transparent"></div>

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transition-all group-hover:scale-110">
                                        <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Duration Badge */}
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                                    {video.duration}
                                </div>

                                {/* Classe Badge */}
                                <div className={`absolute top-2 left-2 px-3 py-1 bg-gradient-to-r ${CLASS_COLORS[video.classe]} text-white text-xs rounded-full font-semibold`}>
                                    {video.classeLabel}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <Heading level="h3" className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {video.title}
                                </Heading>
                                <Text className="text-sm text-gray-600 line-clamp-2">
                                    {video.description}
                                </Text>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={handleCloseVideo}
                >
                    <div
                        className="relative w-full max-w-5xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleCloseVideo}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 text-lg font-semibold"
                        >
                            ✕ Fechar
                        </button>

                        {/* Video Player */}
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <iframe
                                src={`${selectedVideo.videoUrl}?autoplay=1`}
                                title={selectedVideo.title}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        {/* Video Info */}
                        <div className="mt-4 text-white">
                            <Heading level="h3" className="text-xl font-bold mb-2">
                                {selectedVideo.title}
                            </Heading>
                            <Text className="text-gray-300">
                                {selectedVideo.description}
                            </Text>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
