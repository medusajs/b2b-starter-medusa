const CirclePlus = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_21036_1520)">
        <path
          d="M9 1C4.589 1 1 4.589 1 9C1 13.411 4.589 17 9 17C13.411 17 17 13.411 17 9C17 4.589 13.411 1 9 1ZM12.25 9.75H9.75V12.25C9.75 12.664 9.414 13 9 13C8.586 13 8.25 12.664 8.25 12.25V9.75H5.75C5.336 9.75 5 9.414 5 9C5 8.586 5.336 8.25 5.75 8.25H8.25V5.75C8.25 5.336 8.586 5 9 5C9.414 5 9.75 5.336 9.75 5.75V8.25H12.25C12.664 8.25 13 8.586 13 9C13 9.414 12.664 9.75 12.25 9.75Z"
          fill="#18181B"
        />
      </g>
      <defs>
        <clipPath id="clip0_21036_1520">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CirclePlus
