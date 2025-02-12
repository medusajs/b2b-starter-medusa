import { SVGProps } from "react"
import Image from "next/image"
import Logo from '../../../../public/img/logo.png'
import Logo from '../../../../public/img/logo.png'

export const LogoIcon = ({alt}) => {
  return(
    <>
         <Image height={12} width={150} src={Logo} alt='pulsehub consultancy'/>
 
    </>
  )
}

export default LogoIcon
