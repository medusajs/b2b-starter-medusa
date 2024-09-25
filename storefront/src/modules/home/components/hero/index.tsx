"use client"

import { Button, Heading } from "@medusajs/ui"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-neutral-100">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <p className="text-neutral-600 text-xs uppercase">
            Be light on your feet
          </p>

          <Heading
            level="h1"
            className="text-6xl leading-10 text-ui-fg-base font-normal mt-10 mb-5"
          >
            Portable Bestsellers
          </Heading>

          <p className="leading-10 text-ui-fg-subtle font-normal text-lg">
            See our widest selection of laptops and tablets
          </p>
        </span>
        <a
          href="https://github.com/medusajs/nextjs-starter-medusa"
          target="_blank"
        >
          <Button variant="secondary" className="rounded-2xl">
            Learn more
          </Button>
        </a>
      </div>
    </div>
  )
}

export default Hero
