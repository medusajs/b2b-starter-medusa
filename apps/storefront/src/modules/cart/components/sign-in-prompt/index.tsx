"use client"

import { clx, Container, Text } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
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
        <Text className="text-4xl text-white text-left">
          Log in for
          <br />
          faster checkout.
        </Text>
        <div className="flex gap-4">
          <LocalizedClientLink href="/account?view=register">
            <Button
              variant="secondary"
              className="h-10 min-w-36 rounded-full"
              data-testid="sign-in-button"
            >
              Register
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/account?view=log-in">
            <Button
              variant="primary"
              className="h-10 min-w-36 rounded-full"
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
