"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface SearchBarProps {
  onSearch: (
    city: string,
    businessType: string,
    filters: SearchFilters,
    location?: { lat: number; lon: number },
  ) => void
  isLoading: boolean
}

export interface SearchFilters {
  keywords: string
  useGrokEnrichment?: boolean
}

const KEYWORD_RECOMMENDATIONS: Record<string, string[]> = {
  café: ["ouvert dimanche", "wifi gratuit", "terrasse", "petit déjeuner", "parking"],
  restaurant: ["livraison", "terrasse", "menu midi", "parking", "réservation"],
  bar: ["happy hour", "terrasse", "sport", "billard", "ouvert tard"],
  boulangerie: ["ouvert dimanche", "sans gluten", "livraison", "parking", "sandwicherie"],
  pharmacie: ["ouvert dimanche", "de garde", "livraison", "parking", "orthopédie"],
  banque: ["distributeur 24h", "parking", "conseiller", "ouvert samedi", "accessible PMR"],
  coiffeur: ["sans rendez-vous", "homme", "femme", "enfant", "parking"],
  supermarché: ["ouvert dimanche", "livraison", "drive", "parking gratuit", "bio"],
  hôtel: ["parking gratuit", "wifi gratuit", "petit déjeuner", "animaux acceptés", "piscine"],
  magasin: ["ouvert dimanche", "parking", "livraison", "retrait gratuit", "soldes"],
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [citySuggestions, setCitySuggestions] = useState<any[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [recommendedKeywords, setRecommendedKeywords] = useState<string[]>([])
  const searchInputRef = useRef<HTMLDivElement>(null)

  const parseSearchQuery = (query: string) => {
    const lowerQuery = query.toLowerCase().trim()

    // Common patterns: "café à Paris", "restaurant Lyon", "Paris café"
    const patterns = [
      /(.+?)\s+à\s+(.+)/, // "café à Paris"
      /(.+?)\s+(.+)/, // "café Paris" or "Paris café"
    ]

    for (const pattern of patterns) {
      const match = lowerQuery.match(pattern)
      if (match) {
        const [, part1, part2] = match

        // Check which part is the business type
        const businessTypes = Object.keys(KEYWORD_RECOMMENDATIONS)
        const isFirstPartBusiness = businessTypes.some((type) => part1.includes(type))
        const isSecondPartBusiness = businessTypes.some((type) => part2.includes(type))

        if (isFirstPartBusiness) {
          return { businessType: part1.trim(), city: part2.trim() }
        } else if (isSecondPartBusiness) {
          return { businessType: part2.trim(), city: part1.trim() }
        }
      }
    }

    // If no pattern matches, assume it's just a city
    return { businessType: "", city: lowerQuery }
  }

  useEffect(() => {
    const { businessType } = parseSearchQuery(searchQuery)

    if (businessType) {
      const matchingType = Object.keys(KEYWORD_RECOMMENDATIONS).find((type) => businessType.includes(type))

      if (matchingType) {
        setRecommendedKeywords(KEYWORD_RECOMMENDATIONS[matchingType])
      } else {
        setRecommendedKeywords([])
      }
    } else {
      setRecommendedKeywords([])
    }
  }, [searchQuery])

  useEffect(() => {
    const searchCities = async () => {
      const { city } = parseSearchQuery(searchQuery)

      if (city.length < 2) {
        setCitySuggestions([])
        return
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=5&countrycodes=fr&addressdetails=1`,
        )
        const data = await response.json()
        setCitySuggestions(data)
      } catch (error) {
        console.error("[v0] City search error:", error)
      }
    }

    const debounce = setTimeout(searchCities, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCitySelect = (city: any) => {
    const { businessType } = parseSearchQuery(searchQuery)
    const cityName = city.display_name.split(",")[0]

    // Reconstruct query with selected city
    if (businessType) {
      setSearchQuery(`${businessType} à ${cityName}`)
    } else {
      setSearchQuery(cityName)
    }

    setShowCitySuggestions(false)
  }

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) => (prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      return
    }

    const { city, businessType } = parseSearchQuery(searchQuery)

    if (!city) {
      alert("Veuillez entrer au moins une ville dans votre recherche.")
      return
    }

    // Find location from suggestions if available
    const selectedCity = citySuggestions.find((c) =>
      city.toLowerCase().includes(c.display_name.split(",")[0].toLowerCase()),
    )
    const location = selectedCity
      ? { lat: Number.parseFloat(selectedCity.lat), lon: Number.parseFloat(selectedCity.lon) }
      : undefined

    const filters: SearchFilters = {
      keywords: selectedKeywords.join(" "),
      useGrokEnrichment: false, // Will be prompted after scraping
    }

    onSearch(city, businessType, filters, location)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div ref={searchInputRef} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 dark:text-blue-400 z-10" />
          <Input
            type="text"
            placeholder="Ex: café à Paris, restaurant Lyon, coiffeur Marseille..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowCitySuggestions(true)
            }}
            onFocus={() => setShowCitySuggestions(true)}
            disabled={isLoading}
            className="pl-12 pr-12 h-14 text-lg border-2 border-blue-200 dark:border-blue-800/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setCitySuggestions([])
                setSelectedKeywords([])
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {showCitySuggestions && citySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card dark:bg-gray-800 border border-blue-200 dark:border-blue-800/50 rounded-xl shadow-xl dark:shadow-gray-950/50 z-50 max-h-60 overflow-y-auto">
              {citySuggestions.map((city, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-sm border-b border-border dark:border-gray-700/50 last:border-b-0 transition-colors duration-150"
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

        <p className="text-xs text-muted-foreground px-1">
          💡 Tapez votre recherche en langage naturel : "café à Paris", "restaurant Lyon", etc.
        </p>
      </div>

      {recommendedKeywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Mots-clés suggérés :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedKeywords.map((keyword) => (
              <Badge
                key={keyword}
                variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedKeywords.includes(keyword)
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "hover:bg-blue-50 dark:hover:bg-blue-950/30"
                }`}
                onClick={() => toggleKeyword(keyword)}
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {selectedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
          <span className="text-sm text-muted-foreground">Filtres actifs :</span>
          {selectedKeywords.map((keyword) => (
            <Badge
              key={keyword}
              variant="secondary"
              className="gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100"
            >
              {keyword}
              <X className="w-3 h-3 cursor-pointer hover:text-blue-600" onClick={() => toggleKeyword(keyword)} />
            </Badge>
          ))}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !searchQuery.trim()}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
      >
        {isLoading ? (
          <>
            <Search className="w-5 h-5 animate-spin mr-2" />
            Recherche en cours...
          </>
        ) : (
          <>
            <Search className="w-5 h-5 mr-2" />
            Rechercher
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground px-4">
        <Sparkles className="w-3 h-3 inline mr-1" />
        Après le scraping, vous pourrez enrichir les données avec Grok AI
      </p>
    </div>
  )
}
