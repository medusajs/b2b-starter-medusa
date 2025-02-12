//@ts-nocheck

"use client"

import { Heading } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import LogoIcon from "@modules/common/icons/logo"
import Image from "next/image"

const Hero = () => {
  return (
    <div  style={{  background: `url(/img/bg.png)`, backgroundSize:'cover', backgroundPosition: 'center', backgroundRepeat:'no-repeat' }}
    className="h-[80vh] w-full  relative  mt-2">
      <div className="absolute inset-0 z-1 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
<div className="flex justify-center ">
<LogoIcon width={270} height={60} logoAlt />
</div>
          <Heading
            level="h1"
            className="text-xl  !text-white leading-10 text-ui-fg-base font-normal "
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
