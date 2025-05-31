import { Github } from "@medusajs/icons"

export interface Banner {
  image: string
  link: string
}

export const banners: Banner[] = [
  {
    image: "/banner-1.png",
    link: "/products",
  },
  {
    image: "/banner-2.png",
    link: "/products",
  },
  {
    image: "/banner-3.png",
    link: "/products",
  },
  // Add more banners as needed
] 