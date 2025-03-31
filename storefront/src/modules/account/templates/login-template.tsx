"use client"

import Login from "@/modules/account/components/login"
import Register from "@/modules/account/components/register"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export enum LOGIN_VIEW {
  LOG_IN = "log-in",
  REGISTER = "register",
}

const LoginTemplate = ({ regions }: { regions: HttpTypes.StoreRegion[] }) => {
  const route = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(() => {
    const viewFromUrl = searchParams.get("view") as LOGIN_VIEW
    return viewFromUrl && Object.values(LOGIN_VIEW).includes(viewFromUrl)
      ? viewFromUrl
      : LOGIN_VIEW.LOG_IN
  })

  useEffect(() => {
    if (searchParams.has("view")) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete("view")
      router.replace(
        `${route}${newParams.toString() ? `?${newParams.toString()}` : ""}`,
        { scroll: false }
      )
    }
  }, [searchParams, route, router])

  useEffect(() => {
    const image = new window.Image()
    image.src = "/account-block.jpg"
    image.onload = () => {
      setImageLoaded(true)
    }
  }, [])

  const updateView = (view: LOGIN_VIEW) => {
    setCurrentView(view)
    router.push(`/account?view=${view}`)
  }

  return (
    <div className="grid grid-cols-1 small:grid-cols-2 gap-2 m-2 min-h-[80vh]">
      <div className="flex justify-center items-center bg-neutral-100 p-6 small:p-0 h-full">
        {currentView === LOGIN_VIEW.LOG_IN ? (
          <Login setCurrentView={updateView} />
        ) : (
          <Register setCurrentView={updateView} regions={regions} />
        )}
      </div>

      <div className="relative">
        <Image
          src="/account-block.jpg"
          alt="Login banner background"
          className={clx(
            "object-cover transition-opacity duration-300 w-full h-full",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          fill
          quality={100}
          priority
        />
      </div>
    </div>
  )
}

export default LoginTemplate
