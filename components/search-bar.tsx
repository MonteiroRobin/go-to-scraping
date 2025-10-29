"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SearchBarProps {
  onSearch: (
    city: string,
    businessType: string,
    filters: SearchFilters,
    location?: { lat: number; lon: number },
  ) => void
  onCitySelect?: (city: string, location: { lat: number; lon: number }) => void
  isLoading: boolean
}

export interface SearchFilters {
  keywords: string
}

export function SearchBar({ onSearch, onCitySelect, isLoading }: SearchBarProps) {
  const [cityQuery, setCityQuery] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [keywords, setKeywords] = useState("")
  const [citySuggestions, setCitySuggestions] = useState<any[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const cityInputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const searchCities = async () => {
      if (cityQuery.length < 2) {
        setCitySuggestions([])
        return
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityQuery)}&format=json&limit=5&countrycodes=fr&addressdetails=1`,
        )
        const data = await response.json()
        setCitySuggestions(data)
      } catch (error) {
        console.error("[v0] City search error:", error)
      }
    }

    const debounce = setTimeout(searchCities, 300)
    return () => clearTimeout(debounce)
  }, [cityQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCitySelect = (city: any) => {
    const location = { lat: Number.parseFloat(city.lat), lon: Number.parseFloat(city.lon) }
    setCityQuery(city.display_name.split(",")[0])
    setShowCitySuggestions(false)

    console.log("[v0] City selected, centering map:", city.display_name.split(",")[0], location)

    // Call onCitySelect to center map only
    if (onCitySelect) {
      onCitySelect(city.display_name.split(",")[0], location)
    }
  }

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      // If there are suggestions, select the first one
      if (citySuggestions.length > 0) {
        handleCitySelect(citySuggestions[0])
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!cityQuery.trim()) {
      return
    }

    const selectedCity = citySuggestions.find((city) => city.display_name.split(",")[0] === cityQuery)
    const location = selectedCity
      ? { lat: Number.parseFloat(selectedCity.lat), lon: Number.parseFloat(selectedCity.lon) }
      : undefined

    const filters: SearchFilters = {
      keywords: keywords.trim(),
    }

    onSearch(cityQuery, businessType, filters, location)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City Input */}
        <div className="space-y-2">
          <Label htmlFor="city-input" className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Ville
          </Label>
          <div ref={cityInputRef} className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 z-10" />
            <Input
              id="city-input"
              type="text"
              placeholder="Paris, Lyon, Marseille..."
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value)
                setShowCitySuggestions(true)
              }}
              onFocus={() => setShowCitySuggestions(true)}
              onKeyDown={handleCityKeyDown}
              disabled={isLoading}
              className="pl-10 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
            />
            {cityQuery && (
              <button
                type="button"
                onClick={() => {
                  setCityQuery("")
                  setCitySuggestions([])
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <MapPin className="w-4 h-4" />
              </button>
            )}
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-blue-200 dark:border-blue-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                {citySuggestions.map((city, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-sm border-b border-border last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-foreground">{city.display_name.split(",")[0]}</div>
                    <div className="text-xs text-muted-foreground">
                      {city.display_name.split(",").slice(1, 3).join(",")}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Business Type Input */}
        <div className="space-y-2">
          <Label
            htmlFor="business-type-input"
            className="text-sm font-semibold text-foreground flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Type de commerce <span className="text-muted-foreground font-normal">(optionnel)</span>
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 z-10" />
            <Input
              id="business-type-input"
              type="text"
              placeholder="café, restaurant, coiffeur..."
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={isLoading}
              className="pl-10 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Keywords Input */}
      <div className="space-y-2">
        <Label htmlFor="keywords-input" className="text-sm font-semibold text-foreground">
          Mots-clés <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <Input
          id="keywords-input"
          type="text"
          placeholder="Filtrer par nom..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          disabled={isLoading}
          className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !cityQuery.trim()}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
        >
          {isLoading ? <MapPin className="w-4 h-4 animate-spin" /> : "Rechercher"}
        </Button>
      </div>
    </div>
  )
}
