import React from "react"

import { IconProps } from "types/icon"

const UTurnArrowRight: React.FC<IconProps> = ({
  size = "16",
  ...attributes
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      {...attributes}
    >
      <g clipPath="url(#clip0_21104_282)">
        <path
          d="M8.25 11H7C6.586 11 6.25 10.664 6.25 10.25C6.25 9.836 6.586 9.5 7 9.5H8.25C9.215 9.5 10 8.715 10 7.75C10 6.785 9.215 6 8.25 6H1.25C0.836 6 0.5 5.664 0.5 5.25C0.5 4.836 0.836 4.5 1.25 4.5H8.25C10.042 4.5 11.5 5.958 11.5 7.75C11.5 9.542 10.042 11 8.25 11Z"
          fill="#A1A1AA"
        />
        <path
          d="M4.24999 9.24999C4.05799 9.24999 3.86599 9.17699 3.71999 9.02999L0.469994 5.77999C0.176994 5.48699 0.176994 5.01199 0.469994 4.71899L3.71999 1.46999C4.01299 1.17699 4.48799 1.17699 4.78099 1.46999C5.07399 1.76299 5.07399 2.23799 4.78099 2.53099L2.06099 5.25099L4.78099 7.97099C5.07399 8.26399 5.07399 8.73899 4.78099 9.03199C4.63499 9.17799 4.44299 9.25199 4.25099 9.25199L4.24999 9.24999Z"
          fill="#A1A1AA"
        />
      </g>
      <defs>
        <clipPath id="clip0_21104_282">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default UTurnArrowRight
