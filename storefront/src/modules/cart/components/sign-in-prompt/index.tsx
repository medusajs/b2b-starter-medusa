"use client"

import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { clx, Container, Text } from "@medusajs/ui"
import Image from "next/image"
import { useEffect, useState } from "react"

const BackgroundImage = () => {
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const img = new window.Image()
    img.src = "/login-banner-bg.png"
    img.onload = () => setImageLoaded(true)
  }, [])

  return (
    <div className="relative w-full h-full transition-opacity duration-300">
      <Image
        src="/login-banner-bg.png"
        alt="Login banner background"
        className={clx(
          "absolute inset-0 object-cover object-center w-full h-full transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        layout="fill"
        quality={100}
        priority
      />
    </div>
  )
}

const SignInPrompt = () => {
  return (
    <Container className="flex justify-between self-stretch relative w-full h-28 p-0 overflow-hidden">
      <BackgroundImage />
      <div className="absolute inset-0 z-1 flex justify-between items-center text-center p-4">
        <Text className="small:text-4xl text-lg text-white text-left">
          Log in for
          <br />
          faster checkout.
        </Text>
        <div className="flex small:flex-row flex-col small:gap-4 gap-2">
          <LocalizedClientLink href="/account?view=register">
            <Button
              variant="secondary"
              className="small:h-10 h-8 small:min-w-36 min-w-24 rounded-full"
              data-testid="sign-in-button"
            >
              Register
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/account?view=log-in">
            <Button
              variant="primary"
              className="small:h-10 h-8 small:min-w-36 min-w-24 rounded-full"
              data-testid="sign-in-button"
            >
              Log in
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </Container>
  )
}

export default SignInPrompt
