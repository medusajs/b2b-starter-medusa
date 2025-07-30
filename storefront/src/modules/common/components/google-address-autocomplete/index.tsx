"use client"

import { clx, Label } from "@medusajs/ui"
import React, { useCallback, useEffect, useRef, useState } from "react"

type AddressSuggestion = {
  place_id: string
  description: string
}

type MedusaAddress = {
  address_1: string
  address_2: string
  city: string
  postal_code: string
  country_code: string
  province: string
}

type GoogleAddressAutocompleteProps = {
  label: string
  name: string
  required?: boolean
  topLabel?: string
  value: string
  onAddressSelect?: (address: MedusaAddress) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  regions?: string[]
}

const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({
  label,
  name,
  required = false,
  topLabel,
  value,
  onAddressSelect,
  onChange,
  className,
  regions = ["GB"],
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(null)

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/maps/autocomplete?query=${encodeURIComponent(
          searchQuery
        )}&regions=${regions}`
      )

      const data = await response.json()

      if (response.ok) {
        setSuggestions(data.suggestions || [])
        setShowSuggestions(true)
      } else {
        console.error("Autocomplete error:", data.error)
        setSuggestions([])
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectPlace = useCallback(
    async (placeId: string, description: string) => {
      // Create synthetic event to update parent value
      const syntheticEvent = {
        target: { name, value: description },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)

      setShowSuggestions(false)
      setSuggestions([])
      setSelectedIndex(-1)

      try {
        const response = await fetch(
          `/api/maps/place-details?placeId=${encodeURIComponent(placeId)}`
        )
        const address = await response.json()

        if (response.ok && onAddressSelect) {
          onAddressSelect(address)
        }
      } catch (error) {
        console.error("Failed to fetch place details:", error)
      }
    },
    [onAddressSelect, onChange, name]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setSelectedIndex(-1)

    // Call parent onChange to persist typed value
    onChange(e)

    // Debounce the API call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(inputValue)
    }, 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          const suggestion = suggestions[selectedIndex]
          selectPlace(suggestion.place_id, suggestion.description)
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow click on suggestion
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col w-full relative">
      {topLabel && (
        <Label className="mb-2 txt-compact-medium-plus">{topLabel}</Label>
      )}
      <div className="flex relative z-0 w-full txt-compact-medium">
        <input
          ref={inputRef}
          type="text"
          name={name}
          placeholder=" "
          required={required}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          className={clx(
            "pt-4 pb-1 block w-full h-9 px-4 mt-0 rounded-none bg-ui-bg-field appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active shadow-borders-base hover:bg-ui-bg-field-hover",
            className
          )}
          autoComplete="off"
        />
        <label
          htmlFor={name}
          onClick={() => inputRef.current?.focus()}
          className="flex items-center justify-center mx-3 px-1 transition-all absolute duration-300 top-2 -z-1 origin-0 text-neutral-400"
        >
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
        {isLoading && (
          <div className="absolute right-3 top-2 text-ui-fg-subtle">
            <div className="w-4 h-4 border-2 border-ui-border-base border-t-ui-fg-base rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 bg-ui-bg-base border border-ui-border-base rounded-b-md shadow-elevation-card-rest max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              className={clx(
                "w-full text-left px-4 py-3 text-ui-fg-base hover:bg-ui-bg-base-hover transition-colors border-b border-ui-border-base last:border-b-0",
                {
                  "bg-ui-bg-base-pressed": index === selectedIndex,
                }
              )}
              onClick={() =>
                selectPlace(suggestion.place_id, suggestion.description)
              }
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="txt-compact-small">{suggestion.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default GoogleAddressAutocomplete
