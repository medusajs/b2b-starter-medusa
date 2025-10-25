"use client"

import { DataTableSortDirection } from "@/blocks/data-table/types"
import { clx } from "@/utils/clx"
import * as React from "react"

interface SortingIconProps {
  direction: DataTableSortDirection | false
}

const DataTableSortingIcon = (props: SortingIconProps) => {
  const isAscending = props.direction === "asc"
  const isDescending = props.direction === "desc"

  const isSorted = isAscending || isDescending

  return (
    <svg
      width="16"
      height="15"
      viewBox="0 0 16 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clx("opacity-0 transition-opacity group-hover:opacity-100", {
        "opacity-100": isSorted,
      })}
    >
      <path
        d="M5.82651 5.75C5.66344 5.74994 5.50339 5.71269 5.36308 5.64216C5.22277 5.57162 5.10736 5.47039 5.02891 5.34904C4.95045 5.22769 4.91184 5.09067 4.9171 4.95232C4.92236 4.81397 4.97131 4.67936 5.05882 4.56255L7.64833 1.10788C7.73055 0.998207 7.84403 0.907911 7.97827 0.845354C8.11252 0.782797 8.26318 0.75 8.41632 0.75C8.56946 0.75 8.72013 0.782797 8.85437 0.845354C8.98862 0.907911 9.1021 0.998207 9.18432 1.10788L11.7744 4.56255C11.862 4.67939 11.9109 4.81405 11.9162 4.95245C11.9214 5.09085 11.8827 5.2279 11.8042 5.34926C11.7257 5.47063 11.6102 5.57185 11.4698 5.64235C11.3294 5.71285 11.1693 5.75003 11.0061 5.75H5.82651Z"
        className={clx("fill-ui-fg-muted", {
          "fill-ui-fg-subtle": isAscending,
        })}
      />
      <path
        d="M11.0067 9.25C11.1698 9.25006 11.3299 9.28731 11.4702 9.35784C11.6105 9.42838 11.7259 9.52961 11.8043 9.65096C11.8828 9.77231 11.9214 9.90933 11.9162 10.0477C11.9109 10.186 11.8619 10.3206 11.7744 10.4374L9.18492 13.8921C9.10271 14.0018 8.98922 14.0921 8.85498 14.1546C8.72074 14.2172 8.57007 14.25 8.41693 14.25C8.26379 14.25 8.11312 14.2172 7.97888 14.1546C7.84464 14.0921 7.73115 14.0018 7.64894 13.8921L5.05882 10.4374C4.97128 10.3206 4.92233 10.1859 4.9171 10.0476C4.91186 9.90915 4.95053 9.7721 5.02905 9.65074C5.10758 9.52937 5.22308 9.42815 5.36347 9.35765C5.50387 9.28715 5.664 9.24997 5.82712 9.25H11.0067Z"
        className={clx("fill-ui-fg-muted", {
          "fill-ui-fg-subtle": isDescending,
        })}
      />
    </svg>
  )
}
DataTableSortingIcon.displayName = "DataTable.SortingIcon"

export { DataTableSortingIcon }
export type { SortingIconProps }

