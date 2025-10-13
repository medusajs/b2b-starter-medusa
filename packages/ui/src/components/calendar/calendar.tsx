"use client"

import {
  CalendarDate,
  createCalendar,
  getLocalTimeZone
} from "@internationalized/date"
import { TriangleLeftMini, TriangleRightMini } from "@medusajs/icons"
import * as React from "react"
import {
  DateValue,
  useCalendar,
  useLocale,
  type CalendarProps as BaseCalendarProps,
} from "react-aria"
import { useCalendarState } from "react-stately"

import { createCalendarDate, getDefaultCalendarDate, updateCalendarDate } from "@/utils/calendar"

import { CalendarButton } from "./calendar-button"
import { CalendarGrid } from "./calendar-grid"

interface CalendarValueProps {
  /**
   * The currently selected date.
   */
  value?: Date | null
  /**
   * The date that is selected when the calendar first mounts (uncontrolled).
   */
  defaultValue?: Date | null
  /**
   * A function that is triggered when the selected date changes.
   */
  onChange?: (value: Date | null) => void
  /**
   * A function that determines whether a date is unavailable for selection.
   */
  isDateUnavailable?: (date: Date) => boolean
  /**
   * The minimum date that can be selected.
   */
  minValue?: Date
  /**
   * The maximum date that can be selected.
   */
  maxValue?: Date
}

interface CalendarProps
  extends Omit<BaseCalendarProps<CalendarDate>, keyof CalendarValueProps>,
    CalendarValueProps {}

/**
 * Calendar component used to select a date.
 * Its props are based on [React Aria Calendar](https://react-spectrum.adobe.com/react-aria/Calendar.html#calendar-1).
 * 
 * @excludeExternal
 */
const Calendar = (props: CalendarProps) => {
  const [value, setValue] = React.useState<CalendarDate  | null | undefined>(
    () => getDefaultCalendarDate(props.value, props.defaultValue)
  )

  const { locale } = useLocale()
  const _props = React.useMemo(() => convertProps(props, setValue), [props])

  const state = useCalendarState({
    ..._props,
    value,
    locale,
    createCalendar,
  })

  React.useEffect(() => {
    setValue(props.value ? updateCalendarDate(value, props.value) : null)
  }, [props.value])

  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar({ value, ..._props }, state)

  return (
    <div {...calendarProps} className="flex flex-col gap-y-2">
      <div className="bg-ui-bg-field border-base grid grid-cols-[28px_1fr_28px] items-center gap-1 rounded-md border p-0.5">
        <CalendarButton {...prevButtonProps}>
          <TriangleLeftMini />
        </CalendarButton>
        <div className="flex items-center justify-center">
          <h2 className="txt-compact-small-plus">{title}</h2>
        </div>
        <CalendarButton {...nextButtonProps}>
          <TriangleRightMini />
        </CalendarButton>
      </div>
      <CalendarGrid state={state} />
    </div>
  )
}

function convertProps(
  props: CalendarProps,
  setValue: React.Dispatch<
    React.SetStateAction<CalendarDate | null | undefined>
  >
): BaseCalendarProps<CalendarDate> {
  const {
    minValue,
    maxValue,
    isDateUnavailable: _isDateUnavailable,
    onChange: _onChange,
    value: __value__,
    defaultValue: __defaultValue__,
    ...rest
  } = props

  const onChange = (value: CalendarDate | null) => {
    setValue(value)
    _onChange?.(value ? value.toDate(getLocalTimeZone()) : null)
  }

  const isDateUnavailable = (date: DateValue) => {
    const _date = date.toDate(getLocalTimeZone())

    return _isDateUnavailable ? _isDateUnavailable(_date) : false
  }

  return {
    ...rest,
    onChange,
    isDateUnavailable,
    minValue: minValue ? createCalendarDate(minValue) : minValue,
    maxValue: maxValue ? createCalendarDate(maxValue) : maxValue,
  }
}

export { Calendar }
