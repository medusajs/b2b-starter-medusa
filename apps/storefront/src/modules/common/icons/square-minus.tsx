const SquareMinus = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_20975_8996)">
        <path
          d="M8.75 1.25H3.25C2.14543 1.25 1.25 2.14543 1.25 3.25V8.75C1.25 9.85457 2.14543 10.75 3.25 10.75H8.75C9.85457 10.75 10.75 9.85457 10.75 8.75V3.25C10.75 2.14543 9.85457 1.25 8.75 1.25Z"
          stroke="#A1A1AA"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.25 6H3.75"
          stroke="#A1A1AA"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_20975_8996">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default SquareMinus
