import { SVGProps } from "react"
import Image from "next/image"
import Logo from '../../../../public/img/logo.png'

export const LogoIcon = () => {
  return(
    <Image height={10} width={10} src={Logo} alt='pulsehub consultancy'/>
  )
}

export default LogoIcon
