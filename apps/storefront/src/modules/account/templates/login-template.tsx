"use client"

import { useEffect, useState } from "react"

import Login from "@modules/account/components/login"
import Register from "@modules/account/components/register"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

export enum LOGIN_VIEW {
  LOG_IN = "log-in",
  REGISTER = "register",
}

const LoginTemplate = ({ regions }: { regions: HttpTypes.StoreRegion[] }) => {
  const route = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

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
  }, [searchParams])

  const updateView = (view: LOGIN_VIEW) => {
    setCurrentView(view)
    router.push(`/account?view=${view}`)
  }

  return (
    <div className="grid grid-cols-2 gap-2 h-fit m-2">
      <div className="flex justify-center items-center bg-neutral-100">
        {currentView === LOGIN_VIEW.LOG_IN ? (
          <Login setCurrentView={updateView} />
        ) : (
          <Register setCurrentView={updateView} regions={regions} />
        )}
      </div>
      <Image
        src="/account-block.png"
        alt="Login banner background"
        className="object-cover object-center w-auto h-fit transition-opacity duration-300"
        width={500}
        height={500}
        objectFit="cover"
        quality={100}
        priority
      />
    </div>
  )
}

export default LoginTemplate
