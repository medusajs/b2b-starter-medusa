"use client"

import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import { banners } from "@/modules/home/data/banners"
import Link from "next/link"

const AUTOPLAY_INTERVAL = 3000 // 3 seconds

const Hero = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [autoplay, setAutoplay] = useState(true)

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
    setAutoplay(false) // Pause autoplay when manually navigating
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
    setAutoplay(false) // Pause autoplay when manually navigating
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on("select", onSelect)
  }, [emblaApi, onSelect])

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay) return

    const autoplayInterval = setInterval(() => {
      if (emblaApi) {
        emblaApi.scrollNext()
      }
    }, AUTOPLAY_INTERVAL)

    return () => clearInterval(autoplayInterval)
  }, [autoplay, emblaApi])

  // Resume autoplay after 5 seconds of inactivity
  useEffect(() => {
    if (autoplay) return

    const resumeTimeout = setTimeout(() => {
      setAutoplay(true)
    }, 5000)

    return () => clearTimeout(resumeTimeout)
  }, [autoplay])

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, index) => (
            <Link
              key={index}
              href={banner.link}
              className="flex-[0_0_100%] relative block w-full"
            >
              {/* 16:9 Aspect Ratio Container */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <Image
                  src={banner.image}
                  alt={`Banner ${index + 1}`}
                  fill
                  quality={100}
                  priority={index === 0}
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
        onClick={scrollPrev}
      >
        <ChevronLeft />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
        onClick={scrollNext}
      >
        <ChevronRight />
      </button>

      {/* Pill Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              emblaApi?.scrollTo(index)
              setAutoplay(false)
            }}
            className={`h-2 transition-all duration-300 ${
              index === selectedIndex
                ? "w-8 bg-white rounded-full"
                : "w-2 bg-white/50 rounded-full"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default Hero
