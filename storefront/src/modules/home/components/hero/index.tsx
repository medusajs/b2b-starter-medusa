"use client"

import { Github } from "@medusajs/icons"
import { Heading } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import LogoIcon from "@modules/common/icons/logo"
import Image from "next/image"

const Hero = () => {
  return (
    <div  style={{  background: `url(/img/bg.png)`, backgroundSize:'cover', backgroundPosition: 'center', backgroundRepeat:'no-repeat' }}
    className="h-[80vh] w-full  relative  mt-2">
     
      {/* <Image
        src="/img/bg.png"
        alt="Hero background"
        layout="fill"
        quality={100}
        priority
      /> */}
      <div className="absolute inset-0 z-1 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
<LogoIcon />
          <Heading
            level="h1"
            className="text-2xl md:text-4xl !text-white xl:text-6xl leading-10 text-ui-fg-base font-normal mt-10"
          >Explore our B2B Store
          </Heading>

          {/* <p className="leading-10 text-ui-fg-subtle font-normal text-lg">
            See our widest selection of electronics
          </p> */}
        </span>
        <a
          href="/store"
        >
          <Button variant="secondary" className="rounded-2xl">
           
            Shop now
          </Button>
        </a>
      </div>
    </div>
  )
}

export default Hero
