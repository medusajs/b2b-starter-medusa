import { Photo } from "@medusajs/icons"
import Image from "next/image"

type ThumbnailProps = {
  src?: string | null
  alt?: string
}

export const Thumbnail = ({ src, alt }: ThumbnailProps) => {
  return (
    <div className="bg-ui-bg-component flex h-8 w-6 items-center justify-center overflow-hidden rounded-[4px]">
      {src ? (
        <Image
          src={src}
          alt={alt! || "test"}
          className="h-full w-full object-cover object-center"
          draggable={false}
          quality={50}
          width={6}
          height={8}
        />
      ) : (
        <Photo className="text-ui-fg-subtle" />
      )}
    </div>
  )
}
