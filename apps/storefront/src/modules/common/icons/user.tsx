import React from "react"

import { IconProps } from "types/icon"

const User: React.FC<IconProps> = ({
  size = "12",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      {...attributes}
    >
      <g clipPath="url(#clip0_21037_2692)">
        <path
          d="M6 4.991C7.38071 4.991 8.5 3.87171 8.5 2.491C8.5 1.11029 7.38071 -0.00900078 6 -0.00900078C4.61929 -0.00900078 3.5 1.11029 3.5 2.491C3.5 3.87171 4.61929 4.991 6 4.991Z"
          fill="#52525B"
        />
        <path
          d="M10.5328 8.639C9.6008 7.011 7.8638 6 5.9998 6C4.1358 6 2.3978 7.011 1.4668 8.639C1.2178 9.073 1.1618 9.593 1.3128 10.067C1.4628 10.539 1.8088 10.93 2.2598 11.139C3.5008 11.713 4.7498 12 5.9998 12C7.2498 12 8.4988 11.713 9.7398 11.139C10.1908 10.93 10.5358 10.539 10.6868 10.067C10.8378 9.593 10.7818 9.073 10.5328 8.64V8.639Z"
          fill="#52525B"
        />
      </g>
      <defs>
        <clipPath id="clip0_21037_2692">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default User
