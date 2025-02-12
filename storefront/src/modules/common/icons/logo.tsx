
import Image from "next/image"
import Logo from '../../../../public/img/logo.png'
import LogoAlt from '../../../../public/img/logoalt.png'

interface Logo{
  height: number
  width: number
  logoAlt?: boolean
}

export const LogoIcon = (props:Logo) => {
  return(
    <>
         <Image height={props.height} width={props.width} src={props.logoAlt ? LogoAlt : Logo} alt='pulsehub consultancy'/>
 
    </>
  )
}

export default LogoIcon
