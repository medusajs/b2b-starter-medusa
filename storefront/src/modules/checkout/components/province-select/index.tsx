import NativeSelect, {
    NativeSelectProps,
  } from "@/modules/common/components/native-select"
  import { HttpTypes } from "@medusajs/types"
  import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"
  
  const ProvinceSelect = forwardRef<
    HTMLSelectElement,
    NativeSelectProps & {
        province?: any
    }
  >(({ placeholder = "Province", province, defaultValue, ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)
  
    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    const provinceOptions = useMemo(() => {
      if (!province) {
        return []
      }
  
      return province?.map((province: any) => ({
        value: province.value,
        label: province.label,
      }))
    }, [province])
  
    return (
      <NativeSelect
        ref={innerRef}
        placeholder={placeholder}
        defaultValue={defaultValue}
        {...props}
      >
        {provinceOptions?.map(({ value, label }: any, index: number) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
    )
  })
  
  ProvinceSelect.displayName = "ProvinceSelect"
  
  export default ProvinceSelect
  