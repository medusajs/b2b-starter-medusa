import NativeSelect, {
  NativeSelectProps,
} from "@/modules/common/components/native-select"
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"

type ProvinceSelectProps = NativeSelectProps & {
  province?: { value: string; label: string }[]
  isRequired?: boolean
}

const ProvinceSelect = forwardRef<HTMLSelectElement, ProvinceSelectProps>(
  (
    {
      placeholder = "Province",
      province,
      defaultValue,
      isRequired = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    useImperativeHandle(ref, () => innerRef.current!)

    const provinceOptions = useMemo(
      () => (province ?? []).map((p) => ({ value: p.value, label: p.label })),
      [province]
    )

    return (
      <div className={`relative w-full ${className}`}>
        {/* SELECT */}
        <NativeSelect
          ref={innerRef}
          required={isRequired}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full pr-6" /* extra room so text never collides with the star */
          {...props}
        >
          {provinceOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>

        {/* RED ASTERISK — shown only when required */}
        {isRequired && (
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-red-500"
            aria-hidden
          >
            *
          </span>
        )}
      </div>
    )
  }
)

ProvinceSelect.displayName = "ProvinceSelect"
export default ProvinceSelect
